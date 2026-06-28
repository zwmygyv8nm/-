"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pause, Play, Square, X, MapPin, BookOpen } from "lucide-react";

const PRESETS = [
  { label: "25分", minutes: 25 },
  { label: "50分", minutes: 50 },
  { label: "90分", minutes: 90 },
];

const DOT_COUNT = 12;

type TimerState = "before" | "running" | "paused" | "finished";

/* ══════════════════════════════════════════
   CSSキーフレーム定義（一括）
══════════════════════════════════════════ */
const ANIM_STYLES = `
  @keyframes bgZoom {
    0%, 100% { transform: scale(1.0); }
    50%       { transform: scale(1.05); }
  }
  @keyframes petBob {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-7px); }
  }
  @keyframes petBounce {
    0%   { transform: translateY(0px) scale(1); }
    20%  { transform: translateY(-20px) scale(0.93); }
    50%  { transform: translateY(0px) scale(1.06); }
    70%  { transform: translateY(-9px) scale(0.97); }
    100% { transform: translateY(0px) scale(1); }
  }
  @keyframes stickySwing {
    0%, 100% { transform: rotate(-1.8deg); }
    50%      { transform: rotate(1.8deg); }
  }
  @keyframes stampIn {
    0%   { opacity: 0; transform: scale(2.8) rotate(-15deg); }
    55%  { opacity: 1; transform: scale(0.88) rotate(4deg); }
    78%  { transform: scale(1.10) rotate(-2deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
`;

/* ══════════════════════════════════════════
   Layer 1: 背景画像
══════════════════════════════════════════ */
function BackgroundLayer({ bgImage, blurEnabled }: { bgImage?: string; blurEnabled: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const zoomStyle = { animation: "bgZoom 42s ease-in-out infinite", transformOrigin: "center" };
  const blurStyle = { filter: "blur(4px)", transform: "scale(1.06)", transformOrigin: "center" };
  const activeStyle = blurEnabled ? blurStyle : zoomStyle;

  if (bgImage && !imgFailed) {
    return (
      <img
        className="absolute inset-0 w-full h-full object-cover z-0"
        src={bgImage}
        alt=""
        style={activeStyle}
        onError={() => setImgFailed(true)}
      />
    );
  }
  return (
    <div
      className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-sky-800 to-teal-700"
      style={activeStyle}
    />
  );
}

/* ══════════════════════════════════════════
   Layer 2: 背景オーバーレイ
══════════════════════════════════════════ */
function BackgroundOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(10,5,0,0.08) 40%, rgba(20,10,0,0.30) 100%)",
      }}
    />
  );
}

/* ══════════════════════════════════════════
   Layer 3: 机前景画像 (z-15)
   素材配置先: public/illustrations/desk/desk-foreground.png
   - PNG内で自然な透過処理済みのものを想定（CSSマスク不要）
   - 素材未配置時は旧ファイルにフォールバック
══════════════════════════════════════════ */
const DESK_SRC_PRIMARY  = "/-/illustrations/desk/desk-foreground.png";
const DESK_SRC_FALLBACK = "/-/illustrations/desk/desk-foreground-fotor-bg-remover-20260627213034.png";

function DeskForegroundLayer() {
  const [src, setSrc]     = useState(DESK_SRC_PRIMARY);
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  const handleError = () => {
    if (src === DESK_SRC_PRIMARY) {
      setSrc(DESK_SRC_FALLBACK);
    } else {
      setFailed(true);
    }
  };

  // desk-foreground.png（正式素材）はPNG内の透過で上端を処理するため mask 不要。
  // フォールバックの旧ファイルは画像の特性上 mask で上端をフェードさせる。
  const isFallback = src === DESK_SRC_FALLBACK;

  return (
    <img
      key={src}
      src={src}
      alt=""
      onError={handleError}
      draggable={false}
      style={{
        position: "absolute",
        bottom: isFallback ? "-18vh" : 0,
        left: 0,
        width: "100%",
        height: "auto",
        display: "block",
        zIndex: 15,
        pointerEvents: "none",
        ...(isFallback && {
          WebkitMaskImage: "linear-gradient(to bottom, transparent 60%, black 64%)",
          maskImage: "linear-gradient(to bottom, transparent 60%, black 64%)",
        }),
      }}
    />
  );
}

/* ══════════════════════════════════════════
   Layer 4: 小物レイヤー (z-16)
   desk-foreground.png に付箋・文具が含まれるため不要。
   ファイルが配置されたらこのコンポーネントごと削除する。
══════════════════════════════════════════ */
// AccessoriesLayer は desk-foreground.png 配置後に削除予定

/* ══════════════════════════════════════════
   Layer 4: ペットレイヤー (z-17) + 吹き出し (z-18)
   素材配置先:
     public/illustrations/pets/<characterId>.webm  ← 透過WebM（第1候補）
     public/illustrations/pets/<characterId>.png   ← 静止画フォールバック
   - autoplay / muted / loop / playsInline で自動再生
   - CSSアニメーションでゆっくり上下に揺れる
   - 素材未配置時は絵文字にフォールバック
══════════════════════════════════════════ */
const CHAR_EMOJI: Record<string, string> = { neko: "🐱", shiro: "🐤", kuma: "🐻" };

const CHAR_MSGS: Record<TimerState, string> = {
  before:   "今日も\n一緒にがんばろう！",
  running:  "コツコツいくよ〜！",
  paused:   "少し\n休憩中...",
  finished: "おつかれさま！\n🎉",
};

function PetLayer({
  characterId,
  timerState,
  justStarted,
}: {
  characterId: string;
  timerState: TimerState;
  justStarted: boolean;
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [imgFailed,   setImgFailed]   = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const emoji = CHAR_EMOJI[characterId] ?? "🐤";
  const msg   = CHAR_MSGS[timerState];

  const bobSpeed = timerState === "running" ? "2.4s" : "3.5s";
  const petAnim  = justStarted
    ? "petBounce 0.75s cubic-bezier(0.175,0.885,0.32,1.275) forwards"
    : `petBob ${bobSpeed} ease-in-out infinite`;

  // desk-foreground.png の机天板位置に合わせてサイズ・位置を調整すること
  // 目安: 机天板は bottom 約 32〜38% の位置に設計するとペット・GoalPanel と合いやすい
  const petSize: React.CSSProperties = {
    height: "clamp(100px,10vw,160px)",
    width: "auto",
    display: "block",
    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.30))",
  };

  /* ── ペット本体: WebM → PNG → 絵文字 の3段フォールバック ── */
  const petBody = (() => {
    if (!videoFailed) {
      return (
        // mix-blend-mode: screen で黒背景を透過として扱う
        // (透過WebMの代替。黒 → 透明、白/カラー → そのまま表示)
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoFailed(true)}
          style={{ ...petSize, mixBlendMode: "screen" as const }}
        >
          <source
            src={`/-/illustrations/pets/${characterId}.webm`}
            type="video/webm"
            onError={() => setVideoFailed(true)}
          />
        </video>
      );
    }
    if (!imgFailed) {
      return (
        <img
          src={`/-/illustrations/pets/${characterId}.png`}
          alt={characterId}
          onError={() => setImgFailed(true)}
          draggable={false}
          style={petSize}
        />
      );
    }
    /* 絵文字フォールバック */
    return (
      <div className="drop-shadow-lg select-none" style={{ fontSize: "clamp(2.5rem,5vw,4rem)" }}>
        {timerState === "finished" ? "🎉" : emoji}
      </div>
    );
  })();

  return (
    /* z-17: ペット本体
       left: 机の左寄り。desk-foreground.png の机天板位置（目安 bottom 32〜38%）に合わせて bottom を調整。
       現在 bottom: 28% は 1920×1080 での机天板 ~35% 想定の暫定値。 */
    <div
      className="absolute pointer-events-none"
      style={{ left: "14%", bottom: "28%", zIndex: 17 }}
    >
      {/* z-18: 吹き出し（React UIとして独立表示） */}
      <div
        className="bg-white/93 rounded-2xl rounded-bl-none shadow-lg text-center text-slate-700
                   font-medium leading-snug whitespace-pre-line mb-2 mx-auto"
        style={{
          fontSize: "clamp(8px,0.85vw,11px)",
          padding: "5px 10px",
          maxWidth: "clamp(80px,9vw,120px)",
          zIndex: 18,
          position: "relative",
        }}
      >
        {msg}
      </div>

      {/* ペット（上下に揺れるアニメーション） */}
      <div style={{ animation: petAnim }}>
        {petBody}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Layer 6: エフェクトレイヤー (z-18)
══════════════════════════════════════════ */
function EffectsLayer({ locationId: _locationId }: { locationId: string }) {
  return null;
}

/* ══════════════════════════════════════════
   Layer 7-UI: 上部HUD
   左: 旅先カード / 中: タイマー / 右: 滞在時間
══════════════════════════════════════════ */
function TravelTopHud({
  locationName, locationEnglishName, locationNextName,
  timeStr, finished,
  totalStayed, locationRequiredMinutes, remaining, stayPct, filledDots,
}: {
  locationName: string;
  locationEnglishName?: string;
  locationNextName?: string;
  timeStr: string;
  finished: boolean;
  totalStayed: number;
  locationRequiredMinutes: number;
  remaining: number;
  stayPct: number;
  filledDots: number;
}) {
  return (
    <>
      {/* 左上: 今日の旅先カード */}
      <div className="absolute top-4 left-4 z-20" style={{ width: "clamp(160px,19vw,270px)" }}>
        <div
          className="rounded-2xl shadow-xl px-3 pt-2.5 pb-3 relative overflow-hidden"
          style={{ background: "rgba(255,253,248,0.38)", backdropFilter: "blur(18px)" }}
        >
          <div
            className="absolute top-1 right-1 text-white/20 pointer-events-none select-none"
            style={{ fontSize: "clamp(32px,4.5vw,56px)", lineHeight: 1 }}
          >🗾</div>
          <p className="text-white/70 text-[9px] tracking-[0.15em] flex items-center gap-1 mb-1">
            <MapPin size={8} /> 今日の旅先
          </p>
          <p className="text-white font-black leading-tight" style={{ fontSize: "clamp(14px,1.8vw,24px)" }}>
            {locationName}
          </p>
          {locationEnglishName && (
            <p className="text-white/70 mt-0.5" style={{ fontSize: "clamp(8px,0.85vw,11px)" }}>
              {locationEnglishName}
            </p>
          )}
        </div>
      </div>

      {/* 中央上: タイマー */}
      <div className="absolute top-3 left-0 right-0 z-20 flex flex-col items-center pointer-events-none">
        {/* 数字 + プログレスバー */}
        <div className="flex items-center gap-5">
          <p
            className={`font-black tabular-nums tracking-tight leading-none drop-shadow-2xl ${
              finished ? "text-emerald-400" : "text-white"
            }`}
            style={{ fontSize: "clamp(2.8rem,5.5vw,4.5rem)", textShadow: "0 2px 28px rgba(0,0,0,0.60)" }}
          >
            {finished ? "完了！" : timeStr}
          </p>
          <div className="flex flex-col gap-2">
            {/* メインプログレスバー */}
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden" style={{ width: "clamp(140px,16vw,240px)" }}>
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${stayPct}%` }}
              />
            </div>
            {/* ドットインジケーター */}
            <div className="flex items-center gap-[3px]">
              {Array.from({ length: DOT_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-700 ${
                    i < filledDots
                      ? "w-3 h-1.5 bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.55)]"
                      : "w-2 h-1 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        {/* ラベル */}
        <p className="text-white/50 text-[10px] tracking-[0.25em] mt-1.5">⊙ 集中タイム</p>
      </div>

      {/* 右上: 滞在時間カード */}
      <div className="absolute z-20" style={{ top: "clamp(12px,1.5vh,20px)", right: "clamp(16px,2vw,24px)", width: "clamp(160px,18vw,250px)" }}>
        <div
          className="rounded-2xl shadow-xl px-3 py-2.5"
          style={{ background: "rgba(255,253,248,0.38)", backdropFilter: "blur(18px)" }}
        >
          <p className="text-white/70 text-[9px] tracking-[0.12em] mb-1">滞在時間</p>
          <div className="flex items-end justify-between">
            <p className="text-white font-black tabular-nums leading-tight" style={{ fontSize: "clamp(22px,2.6vw,36px)" }}>
              {totalStayed}
              <span className="text-white/70 font-normal" style={{ fontSize: "clamp(11px,1.1vw,15px)" }}>
                {" "}/ {locationRequiredMinutes}分
              </span>
            </p>
            <span style={{ fontSize: "clamp(16px,2vw,26px)" }}>🚌</span>
          </div>
          {/* 点線プログレス */}
          <div className="flex gap-[2px] my-1.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full ${i < Math.round(stayPct / 10) ? "bg-emerald-400" : "bg-white/30"}`}
              />
            ))}
          </div>
          <p className="text-white font-bold" style={{ fontSize: "clamp(9px,0.9vw,12px)" }}>
            {remaining === 0
              ? "到着完了！🎉"
              : `あと${remaining}分で${locationNextName ?? "次の旅先"}へ！`}
          </p>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   旅メモカード（左中）
══════════════════════════════════════════ */
function TravelMemo({ description }: { description: string }) {
  return (
    <div className="absolute left-5 z-20" style={{ top: "24%" }}>
      <div
        className="relative rounded-2xl shadow-2xl"
        style={{ width: "clamp(140px,15vw,210px)", background: "rgba(255,253,248,0.93)", backdropFilter: "blur(8px)" }}
      >
        {/* マスキングテープ */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-sm opacity-60"
          style={{ width: "45%", height: 12, background: "linear-gradient(90deg,#fcd34d,#fbbf24)" }}
        />
        <div className="px-3 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-stone-500 text-[10px] font-bold tracking-wide">旅メモ</p>
            <span className="text-base leading-none">📷</span>
          </div>
          <p className="text-stone-600 leading-relaxed whitespace-pre-line" style={{ fontSize: "clamp(10px,1.1vw,13px)" }}>
            {description}
          </p>
          <p className="text-rose-300 text-sm mt-2">🌸</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   STUDY TICKETカード（右中）
══════════════════════════════════════════ */
function StudyTicket({
  locationName,
  locationEnglishName,
  selectedMinutes,
}: {
  locationName: string;
  locationEnglishName?: string;
  selectedMinutes: number;
}) {
  const pattern = [3,1,2,1,3,2,1,3,1,2,1,2,3,1,1,2,3,1,2,1];
  return (
    <div className="absolute right-5 z-20" style={{ top: "22%" }}>
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: "clamp(150px,17vw,230px)", background: "rgba(255,253,248,0.93)", backdropFilter: "blur(8px)" }}
      >
        <div className="px-3 py-2" style={{ background: "#f472b6" }}>
          <p className="text-white font-black tracking-[0.2em]" style={{ fontSize: "clamp(9px,1vw,12px)" }}>
            STUDY TICKET
          </p>
        </div>
        <div className="px-3 pt-2.5 pb-3">
          <p className="text-stone-700 font-bold leading-tight" style={{ fontSize: "clamp(12px,1.4vw,18px)" }}>
            {locationName} 行き
          </p>
          {locationEnglishName && (
            <p className="text-stone-400 mt-0.5" style={{ fontSize: "clamp(8px,0.8vw,10px)" }}>{locationEnglishName}</p>
          )}
          <div className="h-px bg-stone-200 my-2" />
          <p className="text-stone-500" style={{ fontSize: "clamp(9px,0.9vw,11px)" }}>出発日：今日</p>
          <p className="text-stone-500 mt-0.5" style={{ fontSize: "clamp(9px,0.9vw,11px)" }}>
            目的：{selectedMinutes}分集中すること！
          </p>
          <div className="flex items-end justify-between mt-2.5">
            <div className="flex items-end gap-[1.5px] h-3.5">
              {pattern.map((w, i) => (
                <div
                  key={i}
                  className="bg-slate-300/70 rounded-[0.5px]"
                  style={{ width: w === 1 ? 1.5 : w === 2 ? 2.5 : 3.5, height: i % 4 === 0 ? "100%" : "70%" }}
                />
              ))}
            </div>
            <div className="relative w-10 h-10 opacity-70">
              <div className="absolute inset-0 rounded-full border-2 border-rose-400" />
              <div className="absolute inset-[3px] rounded-full border border-rose-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-rose-400 text-[5px] font-black tracking-[0.12em]">MY STUDY</span>
                <span className="text-rose-400 text-sm leading-none">🐱</span>
                <span className="text-rose-400 text-[5px] font-black tracking-[0.08em]">JOURNEY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   今日の目標パネル — ノート風（机の上・中央）
══════════════════════════════════════════ */
function GoalPanel({ goal }: { goal: string }) {
  const lines = goal ? goal.split("\n").filter(Boolean) : [];
  return (
    // bottom は desk-foreground.png の机天板位置（目安 32〜38%）に合わせて調整する
    <div
      className="absolute z-20"
      style={{ bottom: "26%", left: "50%", transform: "translateX(-50%)", width: "clamp(220px,28vw,400px)" }}
    >
      <div
        className="relative rounded-xl shadow-2xl overflow-hidden"
        style={{ background: "#fffef5" }}
      >
        {/* リング穴 */}
        <div
          className="absolute left-0 top-0 bottom-0 flex flex-col justify-around items-center"
          style={{ width: "clamp(22px,2.5vw,32px)", background: "#f0ede2" }}
        >
          {[0,1,2,3].map((i) => (
            <div
              key={i}
              className="rounded-full bg-white border border-stone-300 shadow-inner"
              style={{ width: "clamp(10px,1.2vw,16px)", height: "clamp(10px,1.2vw,16px)" }}
            />
          ))}
        </div>
        {/* ノート本文 */}
        <div style={{ marginLeft: "clamp(26px,3vw,38px)", padding: "clamp(10px,1.2vw,16px) clamp(12px,1.4vw,18px)" }}>
          <p className="font-black text-amber-500 flex items-center gap-1 mb-2" style={{ fontSize: "clamp(11px,1.1vw,14px)" }}>
            今日の目標 ⭐
          </p>
          <div className="space-y-1.5">
            {lines.length > 0 ? lines.map((line, i) => (
              <div key={i} className="flex items-start gap-2 pb-1.5 border-b border-stone-100">
                <span className="text-stone-300 mt-0.5 shrink-0" style={{ fontSize: "clamp(10px,1vw,13px)" }}>□</span>
                <p className="text-stone-600 leading-snug" style={{ fontSize: "clamp(10px,1.1vw,14px)" }}>{line}</p>
              </div>
            )) : (
              <p className="text-stone-300 pb-1.5 border-b border-stone-100" style={{ fontSize: "clamp(10px,1.1vw,14px)" }}>
                （目標を入力しよう）
              </p>
            )}
          </div>
          {/* ピンクのひとこと */}
          <div
            className="inline-block mt-2.5 px-2.5 py-1 rounded"
            style={{ background: "#fda4af", transform: "rotate(-0.8deg)" }}
          >
            <p className="text-white font-bold" style={{ fontSize: "clamp(8px,0.85vw,11px)" }}>
              コツコツいくよ～！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   完了スタンプ (z-25)
══════════════════════════════════════════ */
function CompletionStamp() {
  return (
    <div
      className="absolute z-[25] pointer-events-none"
      style={{ top: "18%", left: "50%", transform: "translateX(-50%)" }}
    >
      <div style={{ animation: "stampIn 0.65s cubic-bezier(0.175,0.885,0.32,1.275) forwards" }}>
        <div className="text-center">
          <div className="drop-shadow-2xl" style={{ fontSize: "clamp(3.5rem,7vw,8rem)" }}>🎉</div>
          <div
            className="bg-emerald-500 text-white font-black tracking-[0.22em] rounded-xl shadow-2xl mt-2 mx-auto"
            style={{ fontSize: "clamp(12px,1.4vw,18px)", padding: "clamp(6px,0.7vw,10px) clamp(16px,2vw,28px)" }}
          >
            COMPLETE!
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   タイマーコントロール
   3ボタン固定レイアウト:
     [一時停止 / 再開]  [集中スタート！ / 終了 / マップへ]  [旅ノート]
   プリセット(25/50/90分)は開始前のみ上に表示
══════════════════════════════════════════ */
function TimerControls({
  state,
  selectedMinutes,
  customMinutes,
  onPreset,
  onCustom,
  onStart,
  onPause,
  onResume,
  onEnd,
  onBackToMap,
  onJournal,
}: {
  state: TimerState;
  selectedMinutes: number;
  customMinutes: string;
  onPreset: (m: number) => void;
  onCustom: (v: string) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onBackToMap: () => void;
  onJournal: () => void;
}) {
  /* 時間プリセット（開始前のみ） */
  const presetRow = state === "before" && (
    <div
      className="absolute z-20 flex gap-2 items-center"
      style={{ bottom: "13%", left: "50%", transform: "translateX(-50%)" }}
    >
      {PRESETS.map((p) => (
        <button
          key={p.label}
          onClick={() => onPreset(p.minutes)}
          className={`px-4 py-1.5 rounded-full font-bold transition-all ${
            selectedMinutes === p.minutes && !customMinutes
              ? "bg-white text-stone-700 shadow-md"
              : "bg-black/30 backdrop-blur text-white/75 hover:bg-black/45"
          }`}
          style={{ fontSize: "clamp(12px,1.1vw,15px)" }}
        >
          {p.label}
        </button>
      ))}
      <input
        type="number"
        min={1}
        max={300}
        value={customMinutes}
        onChange={(e) => onCustom(e.target.value)}
        placeholder="自由"
        className="rounded-full bg-black/30 backdrop-blur text-white text-center placeholder-white/35 focus:outline-none focus:bg-black/45"
        style={{ width: "clamp(48px,5vw,64px)", padding: "6px 8px", fontSize: "clamp(12px,1.1vw,14px)" }}
      />
    </div>
  );

  /* ── 左ボタン ── */
  const leftBtn = (() => {
    if (state === "before") {
      return (
        <button
          disabled
          className="flex-1 rounded-full font-bold bg-stone-700/40 backdrop-blur text-white/35 flex items-center justify-center gap-1 cursor-default"
          style={{ padding: "clamp(8px,0.9vw,11px) 0", fontSize: "clamp(8px,0.85vw,11px)" }}
        >
          <Pause size={10} />一時停止
        </button>
      );
    }
    if (state === "running") {
      return (
        <button
          onClick={onPause}
          className="flex-1 rounded-full font-bold bg-stone-700/65 backdrop-blur hover:bg-stone-600/70 text-white shadow-lg flex items-center justify-center gap-1 transition-all"
          style={{ padding: "clamp(8px,0.9vw,11px) 0", fontSize: "clamp(8px,0.85vw,11px)" }}
        >
          <Pause size={10} />一時停止
        </button>
      );
    }
    if (state === "paused") {
      return (
        <button
          onClick={onResume}
          className="flex-1 rounded-full font-bold bg-stone-700/65 backdrop-blur hover:bg-stone-600/70 text-white shadow-lg flex items-center justify-center gap-1 transition-all"
          style={{ padding: "clamp(8px,0.9vw,11px) 0", fontSize: "clamp(8px,0.85vw,11px)" }}
        >
          <Play size={10} />再開する
        </button>
      );
    }
    /* finished */
    return (
      <button
        onClick={onBackToMap}
        className="flex-1 rounded-full font-bold bg-stone-700/65 backdrop-blur hover:bg-stone-600/70 text-white shadow-lg flex items-center justify-center gap-1 transition-all"
        style={{ padding: "clamp(8px,0.9vw,11px) 0", fontSize: "clamp(8px,0.85vw,11px)" }}
      >
        ← マップへ戻る
      </button>
    );
  })();

  /* ── 中央ボタン（メインアクション） ── */
  const centerBtn = (() => {
    if (state === "before") {
      return (
        <button
          onClick={onStart}
          className="flex-[1.4] rounded-full font-black text-white bg-rose-400 hover:bg-rose-300 shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
          style={{ padding: "clamp(9px,1.05vw,12px) 0", fontSize: "clamp(10px,1vw,13px)" }}
        >
          <Play size={12} fill="white" strokeWidth={0} />
          集中スタート！
        </button>
      );
    }
    if (state === "running" || state === "paused") {
      return (
        <button
          onClick={onEnd}
          className="flex-[1.4] rounded-full font-black text-white bg-rose-400/90 hover:bg-rose-400 shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
          style={{ padding: "clamp(9px,1.05vw,12px) 0", fontSize: "clamp(10px,1vw,13px)" }}
        >
          <Square size={11} fill="white" strokeWidth={0} />終了する
        </button>
      );
    }
    /* finished */
    return (
      <button
        onClick={onBackToMap}
        className="flex-[1.4] rounded-full font-black text-white bg-emerald-500 hover:bg-emerald-400 shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
        style={{ padding: "clamp(9px,1.05vw,12px) 0", fontSize: "clamp(10px,1vw,13px)" }}
      >
        マップへ戻る →
      </button>
    );
  })();

  /* ── 右ボタン: 旅ノート（常に表示） ── */
  const rightBtn = (
    <button
      onClick={onJournal}
      className="flex-1 rounded-full font-bold bg-stone-700/65 backdrop-blur hover:bg-stone-600/70 text-white shadow-lg flex items-center justify-center gap-1 transition-all"
      style={{ padding: "clamp(8px,0.9vw,11px) 0", fontSize: "clamp(8px,0.85vw,11px)" }}
    >
      <BookOpen size={10} />旅ノート
    </button>
  );

  return (
    <>
      {presetRow}
      <div
        className="absolute z-20 flex gap-3 items-center"
        style={{ bottom: "4%", left: "8%", right: "8%" }}
      >
        {leftBtn}
        {centerBtn}
        {rightBtn}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   メインコンポーネント
══════════════════════════════════════════ */
interface Props {
  goal: string;
  characterId: string;
  locationName: string;
  locationEnglishName?: string;
  locationArea: string;
  locationDescription: string;
  locationBgImage?: string;
  locationStudyMinutes: number;
  locationRequiredMinutes: number;
  locationNextName?: string;
  onComplete: (minutes: number) => void;
  onExit: () => void;
}

export default function TravelStudyRoomScreen({
  goal,
  characterId,
  locationName,
  locationEnglishName,
  locationArea,
  locationDescription,
  locationBgImage,
  locationStudyMinutes,
  locationRequiredMinutes,
  locationNextName,
  onComplete,
  onExit,
}: Props) {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customMinutes,   setCustomMinutes]   = useState("");
  const [secondsLeft,     setSecondsLeft]     = useState(25 * 60);
  const [running,         setRunning]         = useState(false);
  const [started,         setStarted]         = useState(false);
  const [finished,        setFinished]        = useState(false);
  const [isPortrait,      setIsPortrait]      = useState(false);
  const [blurEnabled,     setBlurEnabled]     = useState(false);
  const [justStarted,     setJustStarted]     = useState(false);
  const startSecondsRef = useRef(25 * 60);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  /* 縦横検知 */
  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth * 0.8);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* タイマー */
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return s - 1;
        });
      }, 1_000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  /* 計算値 */
  const elapsedSec  = started ? startSecondsRef.current - secondsLeft : 0;
  const elapsedMins = Math.floor(elapsedSec / 60);
  const leftMins    = Math.floor(secondsLeft / 60);
  const leftSecs    = secondsLeft % 60;
  const timeStr     = `${String(leftMins).padStart(2, "0")}:${String(leftSecs).padStart(2, "0")}`;
  const totalStayed = locationStudyMinutes + elapsedMins;
  const remaining   = Math.max(0, locationRequiredMinutes - totalStayed);
  const stayPct     = Math.min(100, (totalStayed / locationRequiredMinutes) * 100);
  const minsPerDot  = locationRequiredMinutes / DOT_COUNT;
  const filledDots  = Math.min(DOT_COUNT, Math.floor(totalStayed / minsPerDot));

  const timerState: TimerState = finished
    ? "finished"
    : !started
    ? "before"
    : running
    ? "running"
    : "paused";

  const handleStart = () => {
    startSecondsRef.current = secondsLeft;
    setStarted(true);
    setRunning(true);
    setJustStarted(true);
    setTimeout(() => setJustStarted(false), 800);
  };
  const handlePause  = () => setRunning(false);
  const handleResume = () => setRunning(true);
  const handleEnd    = useCallback(() => {
    onComplete(Math.max(1, Math.round((startSecondsRef.current - secondsLeft) / 60)));
  }, [secondsLeft, onComplete]);
  const handlePreset = (m: number) => { if (started) return; setSelectedMinutes(m); setSecondsLeft(m * 60); setCustomMinutes(""); };
  const handleCustom = (val: string) => {
    if (started) return;
    setCustomMinutes(val);
    const n = parseInt(val);
    if (!isNaN(n) && n > 0 && n <= 300) { setSelectedMinutes(n); setSecondsLeft(n * 60); }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none bg-slate-800">

      {/* CSSキーフレーム注入 */}
      <style dangerouslySetInnerHTML={{ __html: ANIM_STYLES }} />

      {/* ── Layer 1: 背景画像 ── */}
      <BackgroundLayer bgImage={locationBgImage} blurEnabled={blurEnabled} />

      {/* ── Layer 2: 背景オーバーレイ (z-10) ── */}
      <BackgroundOverlay />

      {/* ── 縦向き警告 (z-50) ── */}
      {isPortrait && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/88 backdrop-blur-md">
          <p className="text-5xl mb-5">📱</p>
          <p className="text-white text-xl font-bold mb-2">横向きにして使おう</p>
          <p className="text-white/50 text-sm text-center px-8">
            全国旅行モードは横長（16:9）画面用です。<br />スマホは横向きにしてください。
          </p>
        </div>
      )}

      {/* ── Layer 3: 机前景PNG (z-15) ── */}
      <DeskForegroundLayer />

      {/* ── Layer 4: 小物・付箋 (z-16) ── desk-foreground.png 配置後に削除済み ── */}

      {/* ── Layer 5: ペット (z-17) ── */}
      <PetLayer
        characterId={characterId}
        timerState={timerState}
        justStarted={justStarted}
      />

      {/* ── Layer 6: エフェクト (z-18) ── */}
      <EffectsLayer locationId={locationName} />

      {/* ── Layer 7: UI (z-20〜30) ── */}

      {/* 完了スタンプ (z-25) */}
      {finished && <CompletionStamp />}

      {/* 右上コントロール (z-30) */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <button
          onClick={() => setBlurEnabled((b) => !b)}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border transition-all ${
            blurEnabled
              ? "bg-white/20 text-white border-white/25 hover:bg-white/30"
              : "bg-white/35 text-stone-800 border-white/50 hover:bg-white/45"
          }`}
        >
          {blurEnabled ? "ぼかし ON" : "ぼかし OFF"}
        </button>
        <button
          onClick={onExit}
          className="text-white/55 hover:text-white bg-black/22 backdrop-blur-sm rounded-full p-2 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <TravelTopHud
        locationName={locationName}
        locationEnglishName={locationEnglishName}
        locationNextName={locationNextName}
        timeStr={timeStr}
        finished={finished}
        totalStayed={totalStayed}
        locationRequiredMinutes={locationRequiredMinutes}
        remaining={remaining}
        stayPct={stayPct}
        filledDots={filledDots}
      />

      <TravelMemo description={locationDescription} />

      <StudyTicket
        locationName={locationName}
        locationEnglishName={locationEnglishName}
        selectedMinutes={selectedMinutes}
      />

      <GoalPanel goal={goal} />

      <TimerControls
        state={timerState}
        selectedMinutes={selectedMinutes}
        customMinutes={customMinutes}
        onPreset={handlePreset}
        onCustom={handleCustom}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onEnd={handleEnd}
        onBackToMap={handleEnd}
        onJournal={onExit}
      />

    </div>
  );
}
