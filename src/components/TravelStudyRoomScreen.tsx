"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pause, Play, Square, X, MapPin, BookOpen } from "lucide-react";
import { LocationVisualConfig, VisualConfigOverride, resolveVisualConfig } from "@/lib/storage";

const DOT_COUNT = 12;

type TimerState = "before" | "running" | "paused" | "finished";

/* ══════════════════════════════════════════
   CSSキーフレーム定義（一括）
══════════════════════════════════════════ */
const ANIM_STYLES = `
  @keyframes stampIn {
    0%   { opacity: 0; transform: scale(2.8) rotate(-15deg); }
    55%  { opacity: 1; transform: scale(0.88) rotate(4deg); }
    78%  { transform: scale(1.10) rotate(-2deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  /* ── 環境演出アニメーション（CSS変数で調整可能） ── */

  /* 1. 背景ゆっくりズーム: --zoom-scale で最大倍率を制御 */
  @keyframes bgBreath {
    0%, 100% { transform: scale(1.00); }
    50%       { transform: scale(var(--zoom-scale, 1.025)); }
  }

  /* 2. 光ゆらぎ: --lo / --hi / --mid で透明度レンジを制御 */
  @keyframes lightDrift {
    0%   { opacity: var(--lo, 0.18); transform: translate(0%,   0%); }
    33%  { opacity: var(--hi, 0.30); transform: translate(3%,  -2%); }
    66%  { opacity: var(--mid,0.20); transform: translate(-2%,  3%); }
    100% { opacity: var(--lo, 0.18); transform: translate(0%,   0%); }
  }

  /* 3. 霞のゆらぎ */
  @keyframes hazePulse {
    0%, 100% { opacity: 1.0; }
    50%      { opacity: 0.5; }
  }

  /* 4. 机上グロー */
  @keyframes deskGlow {
    0%, 100% { opacity: 0.6; }
    50%      { opacity: 1.0; }
  }
`;

/* ══════════════════════════════════════════
   Layer 1: 背景画像
══════════════════════════════════════════ */
function BackgroundLayer({ bgImage, blurEnabled, visualConfig }: {
  bgImage?: string; blurEnabled: boolean; visualConfig: LocationVisualConfig;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const { backgroundStyle, ambient } = visualConfig;

  // 別の地点の画像に切り替わったら失敗フラグをリセット
  useEffect(() => setImgFailed(false), [bgImage]);

  const baseFilter = `blur(${backgroundStyle.blurPx}px) brightness(${backgroundStyle.brightness}) contrast(${backgroundStyle.contrast}) saturate(${backgroundStyle.saturation})`;
  const blurFilter = `blur(${backgroundStyle.blurPx + 4}px) brightness(${backgroundStyle.brightness}) contrast(${backgroundStyle.contrast}) saturate(${backgroundStyle.saturation})`;

  const activeStyle: React.CSSProperties = blurEnabled
    ? { filter: blurFilter, transform: "scale(1.04)", transformOrigin: "center" }
    : ambient.slowZoom
      ? {
          filter: baseFilter,
          animation: `bgBreath ${ambient.zoomDurationSec}s ease-in-out infinite`,
          transformOrigin: "center",
          ["--zoom-scale" as string]: ambient.zoomScale,
        }
      : { filter: baseFilter };

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
   Layer 2.5: 環境演出レイヤー (z-11〜16)
══════════════════════════════════════════ */
const LIGHT_TONE_GRADIENT: Record<string, string> = {
  warm:   "radial-gradient(ellipse 70% 55% at 60% 35%, rgba(255,210,130,0.38) 0%, rgba(255,170,90,0.14) 55%, transparent 80%)",
  cool:   "radial-gradient(ellipse 70% 55% at 40% 30%, rgba(130,190,255,0.35) 0%, rgba(90,150,220,0.12) 55%, transparent 80%)",
  sunset: "radial-gradient(ellipse 80% 60% at 55% 30%, rgba(255,150,90,0.40) 0%, rgba(255,90,60,0.15) 55%, transparent 80%)",
  night:  "radial-gradient(ellipse 65% 50% at 65% 40%, rgba(255,220,150,0.30) 0%, rgba(180,160,255,0.12) 55%, transparent 80%)",
};

function AmbientLayer({ config }: { config: LocationVisualConfig }) {
  const { ambient } = config;
  const lo  = ambient.lightOpacity * 0.7;
  const hi  = ambient.lightOpacity;
  const mid = ambient.lightOpacity * 0.85;
  const gradient = LIGHT_TONE_GRADIENT[ambient.lightTone] ?? LIGHT_TONE_GRADIENT.warm;

  return (
    <>
      {/* 光ゆらぎ (z-11) */}
      {ambient.lightDrift && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 11,
            background: gradient,
            animation: "lightDrift 26s ease-in-out infinite",
            transformOrigin: "center",
            ["--lo"  as string]: lo,
            ["--hi"  as string]: hi,
            ["--mid" as string]: mid,
          }}
        />
      )}

      {/* 霞 (z-12) */}
      {ambient.haze && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 12,
            background: "linear-gradient(to bottom, rgba(200,215,255,1.0) 0%, transparent 60%)",
            opacity: ambient.hazeOpacity,
            animation: "hazePulse 40s ease-in-out infinite",
          }}
        />
      )}

      {/* 机上グロー (z-16) */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          zIndex: 16,
          height: "45%",
          background: "linear-gradient(to top, rgba(255,200,140,0.10) 0%, rgba(255,220,160,0.05) 40%, transparent 80%)",
          animation: "deskGlow 20s ease-in-out infinite",
        }}
      />
    </>
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
}: {
  characterId: string;
  timerState: TimerState;
}) {
  const [videoFailed, setVideoFailed] = useState(true); // 動画は無効化中、静止画を使用
  const [imgFailed,   setImgFailed] = useState(false);

  const emoji = CHAR_EMOJI[characterId] ?? "🐤";
  const msg   = CHAR_MSGS[timerState];

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
      style={{ left: "14%", bottom: "10%", zIndex: 17 }}
    >
      {/* z-18: 吹き出し（React UIとして独立表示） */}
      <div
        className="bg-white/93 rounded-2xl rounded-bl-none shadow-lg text-center text-slate-700
                   font-medium leading-snug whitespace-pre-line mb-2"
        style={{
          fontSize: "clamp(8px,0.85vw,11px)",
          padding: "5px 10px",
          maxWidth: "clamp(80px,9vw,120px)",
          zIndex: 18,
          position: "relative",
          marginLeft: "clamp(12px,2vw,28px)",
        }}
      >
        {msg}
      </div>

      <div>
        {petBody}
      </div>
    </div>
  );
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
            className={`font-light tabular-nums tracking-tight leading-none drop-shadow-2xl ${
              finished ? "text-emerald-400" : "text-white"
            }`}
            style={{ fontSize: "clamp(2.8rem,5.5vw,4.5rem)", textShadow: "0 2px 28px rgba(0,0,0,0.60)" }}
          >
            {finished ? "完了！" : timeStr}
          </p>
          <div className="flex flex-col gap-2">
            {/* メインプログレスバー */}
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden" style={{ width: "clamp(210px,24vw,360px)" }}>
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
function TravelMemo({ description, uiTheme }: {
  description: string;
  uiTheme: LocationVisualConfig["uiTheme"];
}) {
  return (
    <div className="absolute left-5 z-20" style={{ top: "24%" }}>
      <div
        className="relative rounded-2xl shadow-2xl"
        style={{ width: "clamp(140px,15vw,210px)", background: `rgba(255,244,220,${uiTheme.cardOpacity})`, backdropFilter: `blur(${uiTheme.cardBlurPx}px)`, fontFamily: "var(--font-klee), sans-serif", fontWeight: 700 }}
      >
        {/* マスキングテープ */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-sm opacity-60"
          style={{ width: "45%", height: 12, background: "linear-gradient(90deg,#fcd34d,#fbbf24)" }}
        />
        <div className="px-3 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-stone-500 text-[10px] font-semibold tracking-wide">旅メモ</p>
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
  uiTheme,
}: {
  locationName: string;
  locationEnglishName?: string;
  uiTheme: LocationVisualConfig["uiTheme"];
}) {
  const pattern = [3,1,2,1,3,2,1,3,1,2,1,2,3,1,1,2,3,1,2,1];
  return (
    <div className="absolute right-5 z-20" style={{ top: "22%" }}>
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: "clamp(150px,17vw,230px)", background: `rgba(255,244,220,${uiTheme.cardOpacity})`, backdropFilter: `blur(${uiTheme.cardBlurPx}px)`, fontFamily: "var(--font-klee), sans-serif", fontWeight: 700 }}
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
══════════════════════════════════════════ */
function TimerControls({
  state,
  onStart,
  onPause,
  onResume,
  onEnd,
  onBackToMap,
  onJournal,
}: {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onBackToMap: () => void;
  onJournal: () => void;
}) {

  /* ── 左ボタン ── */
  const leftBtn = (() => {
    if (state === "before") {
      return (
        <button
          disabled
          className="flex-[0.35] rounded-full font-bold bg-stone-700/40 backdrop-blur text-white/35 flex items-center justify-center gap-1 cursor-default"
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
          className="flex-[0.35] rounded-full font-bold bg-stone-700/65 backdrop-blur hover:bg-stone-600/70 text-white shadow-lg flex items-center justify-center gap-1 transition-all"
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
          className="flex-[0.35] rounded-full font-bold bg-stone-700/65 backdrop-blur hover:bg-stone-600/70 text-white shadow-lg flex items-center justify-center gap-1 transition-all"
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
        className="flex-[0.35] rounded-full font-bold bg-stone-700/65 backdrop-blur hover:bg-stone-600/70 text-white shadow-lg flex items-center justify-center gap-1 transition-all"
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
          className="flex-[0.7] rounded-full font-black text-white bg-rose-400 hover:bg-rose-300 shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
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
          className="flex-[0.7] rounded-full font-black text-white bg-rose-400/90 hover:bg-rose-400 shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
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
        className="flex-[0.7] rounded-full font-black text-white bg-emerald-500 hover:bg-emerald-400 shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
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
      className="flex-[0.35] rounded-full font-bold bg-stone-700/65 backdrop-blur hover:bg-stone-600/70 text-white shadow-lg flex items-center justify-center gap-1 transition-all"
      style={{ padding: "clamp(8px,0.9vw,11px) 0", fontSize: "clamp(8px,0.85vw,11px)" }}
    >
      <BookOpen size={10} />旅ノート
    </button>
  );

  return (
    <div
      className="absolute z-20 flex gap-3 items-center"
      style={{ bottom: "4%", left: "50%", transform: "translateX(-50%)", width: "clamp(280px,36vw,520px)" }}
    >
        {leftBtn}
        {centerBtn}
        {rightBtn}
      </div>
  );
}

/* ══════════════════════════════════════════
   メインコンポーネント
══════════════════════════════════════════ */
interface Props {
  characterId: string;
  locationName: string;
  locationEnglishName?: string;
  locationDescription: string;
  locationBgImage?: string;
  locationStudyMinutes: number;
  locationRequiredMinutes: number;
  locationNextName?: string;
  locationVisualConfig?: VisualConfigOverride;
  onComplete: (minutes: number) => void;
  onExit: () => void;
}

export default function TravelStudyRoomScreen({
  characterId,
  locationName,
  locationEnglishName,
  locationDescription,
  locationBgImage,
  locationStudyMinutes,
  locationRequiredMinutes,
  locationNextName,
  locationVisualConfig,
  onComplete,
  onExit,
}: Props) {
  const visualConfig = resolveVisualConfig(locationVisualConfig);
  const [secondsLeft,     setSecondsLeft]     = useState(25 * 60);
  const [running,         setRunning]         = useState(false);
  const [started,         setStarted]         = useState(false);
  const [finished,        setFinished]        = useState(false);
  const [isPortrait,      setIsPortrait]      = useState(false);
  const [blurEnabled,     setBlurEnabled]     = useState(false);
  const startSecondsRef = useRef(25 * 60);
  const secondsLeftRef  = useRef(secondsLeft);
  secondsLeftRef.current = secondsLeft;

  /* 縦横検知 */
  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth * 0.8);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* タイマー
     setIntervalの減算カウントはタブ非表示時にブラウザがtickを間引くため実時間より遅れる。
     区間開始時刻からの経過を壁時計（Date.now）で毎tick計算し直すことでズレを防ぐ。 */
  useEffect(() => {
    if (!running) return;
    const segStartMs  = Date.now();
    const segStartSec = secondsLeftRef.current;
    const id = setInterval(() => {
      const left = segStartSec - Math.floor((Date.now() - segStartMs) / 1000);
      if (left <= 0) {
        clearInterval(id);
        setSecondsLeft(0);
        setRunning(false);
        setFinished(true);
      } else {
        setSecondsLeft(left);
      }
    }, 500);
    return () => clearInterval(id);
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
  };
  const handlePause  = () => setRunning(false);
  const handleResume = () => setRunning(true);
  const handleEnd    = useCallback(() => {
    onComplete(Math.max(1, Math.round((startSecondsRef.current - secondsLeft) / 60)));
  }, [secondsLeft, onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none bg-slate-800">

      {/* CSSキーフレーム注入 */}
      <style dangerouslySetInnerHTML={{ __html: ANIM_STYLES }} />

      {/* ── Layer 1: 背景画像 ── */}
      <BackgroundLayer bgImage={locationBgImage} blurEnabled={blurEnabled} visualConfig={visualConfig} />

      {/* ── Layer 2: 背景オーバーレイ (z-10) ── */}
      <BackgroundOverlay />

      {/* ── Layer 2.5: 環境演出 (z-11〜16) ── */}
      <AmbientLayer config={visualConfig} />

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
      />

      {/* ── Layer 6: UI (z-20〜30) ── */}

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
          aria-label="自習室を出る"
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

      <TravelMemo description={locationDescription} uiTheme={visualConfig.uiTheme} />

      <StudyTicket
        locationName={locationName}
        locationEnglishName={locationEnglishName}
        uiTheme={visualConfig.uiTheme}
      />

      <TimerControls
        state={timerState}
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
