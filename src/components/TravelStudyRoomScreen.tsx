"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pause, Play, Square, X, MapPin } from "lucide-react";
import IllustrationImg from "./IllustrationImg";

const PRESETS = [
  { label: "25分", minutes: 25 },
  { label: "50分", minutes: 50 },
  { label: "90分", minutes: 90 },
];

const DOT_COUNT = 12;

/* ══════════════════════════════════════════
   CSSキーフレーム定義（一括）
   - bgZoom       : 背景がゆっくりズーム（勉強中の空気感）
   - petBob       : ペットがゆっくり上下に揺れる
   - petBounce    : 勉強開始時に一回だけ跳ねる
   - stickySwing  : 付箋が左右に少し揺れる
   - stampIn      : 完了スタンプがポンと押される
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
   blurEnabled=true  → blur+scale（静止）
   blurEnabled=false → ゆっくりズームアニメ
══════════════════════════════════════════ */
function BackgroundLayer({ bgImage, blurEnabled }: { bgImage?: string; blurEnabled: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const zoomStyle = { animation: "bgZoom 42s ease-in-out infinite", transformOrigin: "center" };
  const blurStyle = { filter: "blur(4px)", transform: "scale(1.06)", transformOrigin: "center" };
  const activeStyle = blurEnabled ? blurStyle : zoomStyle;

  /* z-0 を明示して描画順を確定させる。
     透明ピクセルを持つ desk(z-15) の後ろに必ず回るようにする。 */
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
   Layer 2: 背景オーバーレイ（暗め＋暖色）
══════════════════════════════════════════ */
function BackgroundOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.50) 0%, rgba(10,5,0,0.10) 38%, rgba(30,15,5,0.38) 100%)",
      }}
    />
  );
}

/* ══════════════════════════════════════════
   Layer 3: 机前景画像 (z-15)
   机・ノート・ペン・筆箱・水筒・影を焼き込んだ共通1枚PNG
   public/illustrations/desk/desk-foreground-fotor-bg-remover-20260627213034.png
══════════════════════════════════════════ */
function DeskForegroundLayer() {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "35vh",
        overflow: "hidden",
        zIndex: 15,
        pointerEvents: "none",
        /* 上端をグラデーションでなだらかにフェード */
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 18%)",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 18%)",
      }}
    >
      <img
        src="/-/illustrations/desk/desk-foreground-fotor-bg-remover-20260627213034.png"
        alt=""
        onError={() => setFailed(true)}
        draggable={false}
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "auto", display: "block" }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════
   Layer 4: 小物レイヤー (z-16)
   付箋など「机前景に焼き込まない」小道具
   将来：クリック可能な付箋、スタンプ演出など
══════════════════════════════════════════ */
function AccessoriesLayer() {
  return (
    <div className="absolute inset-0 z-[16] pointer-events-none">
      {/* 付箋：ゆっくり左右に揺れる */}
      <div
        className="absolute"
        style={{
          left: "7%",
          bottom: "20%",
          animation: "stickySwing 5s ease-in-out infinite",
          transformOrigin: "top center",
        }}
      >
        <IllustrationImg
          src="/-/illustrations/desk/sticky-note.png"
          alt="付箋"
          style={{ height: "clamp(52px,6vw,78px)", width: "auto", objectFit: "contain" }}
          fallback={
            <div
              className="flex items-center justify-center shadow-lg"
              style={{
                width: "clamp(52px,6vw,76px)",
                height: "clamp(52px,6vw,76px)",
                background: "linear-gradient(135deg,#fda4af,#fb7185)",
                borderRadius: 4,
              }}
            >
              <p className="text-white font-bold text-center leading-snug select-none"
                style={{ fontSize: "clamp(6px,0.65vw,8.5px)", padding: "5px" }}>
                できたこと<br />つみあげよう<br />☺
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Layer 5: ペットレイヤー (z-17)
   - 常にゆっくり上下に揺れる（petBob）
   - 勉強開始時に一回だけ跳ねる（petBounce）
   - timerStateに応じた吹き出しメッセージ
══════════════════════════════════════════ */
const CHAR_EMOJI: Record<string, string> = { neko: "🐱", shiro: "🐰", kuma: "🐻" };

const CHAR_MSGS: Record<TimerState, string> = {
  before:   "今日も\nがんばろう！",
  running:  "集中して！",
  paused:   "少し\n休憩中...",
  finished: "お疲れ様！\n🎉",
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
  const emoji = CHAR_EMOJI[characterId] ?? "🐱";
  const msg   = CHAR_MSGS[timerState];

  const bobSpeed = timerState === "running" ? "2.4s" : "3.5s";
  const petAnim  = justStarted
    ? "petBounce 0.75s cubic-bezier(0.175,0.885,0.32,1.275) forwards"
    : `petBob ${bobSpeed} ease-in-out infinite`;

  return (
    <div className="absolute z-[17] pointer-events-none" style={{ left: "17%", bottom: "14%" }}>
      {/* 吹き出し */}
      <div
        className="bg-white/92 rounded-2xl rounded-bl-none shadow-lg text-center text-slate-700
                   font-medium leading-snug whitespace-pre-line mb-1.5 mx-auto"
        style={{
          fontSize: "clamp(7.5px,0.82vw,10.5px)",
          padding: "4px 8px",
          maxWidth: "clamp(62px,7.5vw,96px)",
        }}
      >
        {msg}
      </div>
      {/* キャラクター */}
      <div style={{ animation: petAnim }}>
        <IllustrationImg
          src={`/-/illustrations/characters/${characterId}.png`}
          alt={characterId}
          style={{ height: "clamp(50px,6.5vw,92px)", width: "auto", objectFit: "contain" }}
          fallback={
            <div className="drop-shadow-lg" style={{ fontSize: "clamp(1.8rem,3.2vw,3.2rem)" }}>
              {timerState === "finished" ? "🎉" : emoji}
            </div>
          }
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Layer 6: エフェクトレイヤー (z-18)
   MVP: 空レイヤー（将来の場所別演出の受け皿）
   将来例:
     kanazawa  → 小さな桜が少し舞う
     hokkaido  → 光の粒・ラベンダーの花びら
     kyoto     → 紅葉・桜
     okinawa   → 光・水しぶき粒子
     snow_region → 小さな雪が静かに降る
   実装方針: 背景写真内の木や草を動かさず、
             静止画の上に重ねる粒子・花びらで空気感を出す
══════════════════════════════════════════ */
function EffectsLayer({
  locationId: _locationId,
}: {
  locationId: string;
}) {
  // 将来ここに場所ごとの軽いCSS粒子アニメを追加
  return null;
}

/* ══════════════════════════════════════════
   Layer 7-UI: 上部HUD
   左:旅先カード / 中:タイマー+バー / 右:滞在時間
══════════════════════════════════════════ */
function TravelTopHud({
  locationName, locationArea, locationNextName,
  timeStr, finished,
  totalStayed, locationRequiredMinutes, remaining, stayPct, filledDots,
}: {
  locationName: string;
  locationArea: string;
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
      {/* 左上: 今日の旅先 */}
      <div className="absolute top-4 left-4 z-20" style={{ width: "clamp(160px, 18vw, 260px)" }}>
        <div
          className="rounded-2xl overflow-hidden shadow-xl"
          style={{ background: "rgba(60,40,20,0.42)", backdropFilter: "blur(16px)" }}
        >
          <div className="px-3 pt-2.5 pb-3 relative">
            <div className="absolute top-2 right-2 text-white/20" style={{ fontSize: "clamp(28px,4vw,52px)", lineHeight: 1 }}>🗾</div>
            <p className="text-white/50 text-[9px] tracking-[0.15em] flex items-center gap-1 mb-1">
              <MapPin size={8} /> 今日の旅先
            </p>
            <p className="text-white font-black leading-tight" style={{ fontSize: "clamp(14px,1.6vw,22px)" }}>
              {locationName}
            </p>
            <p className="text-white/40 mt-0.5" style={{ fontSize: "clamp(9px,0.9vw,12px)" }}>{locationArea}</p>
          </div>
        </div>
      </div>

      {/* 中央上: タイマー + 進行バー + ドット */}
      <div className="absolute top-4 left-0 right-0 z-20 flex flex-col items-center pointer-events-none">
        <p className="text-white/50 text-[10px] tracking-[0.25em] mb-2">◉ 集中タイム</p>
        <div className="flex items-center gap-4">
          <p
            className={`font-black tabular-nums tracking-tight leading-none drop-shadow-2xl ${
              finished ? "text-emerald-400" : "text-white"
            }`}
            style={{ fontSize: "clamp(2.5rem,5vw,4rem)", textShadow: "0 2px 28px rgba(0,0,0,0.55)" }}
          >
            {finished ? "完了！" : timeStr}
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden" style={{ width: "clamp(100px,12vw,180px)" }}>
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${stayPct}%` }}
              />
            </div>
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
      </div>

      {/* 右上: 滞在時間 */}
      <div className="absolute z-20" style={{ top: "clamp(44px,5.5vh,60px)", right: "clamp(120px,10vw,160px)", width: "clamp(150px,17vw,240px)" }}>
        <div
          className="rounded-2xl shadow-xl px-3 py-2.5"
          style={{ background: "rgba(255,252,245,0.48)", backdropFilter: "blur(16px)" }}
        >
          <p className="text-stone-400 text-[9px] tracking-[0.12em] mb-1">滞在時間</p>
          <div className="flex items-end justify-between">
            <p className="text-stone-700 font-black tabular-nums leading-tight" style={{ fontSize: "clamp(20px,2.4vw,34px)" }}>
              {totalStayed}
              <span className="text-stone-400 font-normal" style={{ fontSize: "clamp(11px,1.1vw,15px)" }}>
                {" "}/ {locationRequiredMinutes}分
              </span>
            </p>
            <span style={{ fontSize: "clamp(16px,2vw,26px)" }}>🚌</span>
          </div>
          <p className="text-emerald-500 font-bold mt-1" style={{ fontSize: "clamp(9px,0.9vw,12px)" }}>
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
    <div className="absolute left-5 z-20" style={{ top: "26%" }}>
      <div
        className="relative rounded-2xl shadow-2xl"
        style={{ width: "clamp(130px,14vw,195px)", background: "rgba(255,253,248,0.93)", backdropFilter: "blur(8px)" }}
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
          <p className="text-stone-600 leading-relaxed" style={{ fontSize: "clamp(10px,1.1vw,13px)" }}>
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
  locationArea,
  selectedMinutes,
}: {
  locationName: string;
  locationArea: string;
  selectedMinutes: number;
}) {
  const pattern = [3,1,2,1,3,2,1,3,1,2,1,2,3,1,1,2,3,1,2,1];
  return (
    <div className="absolute right-5 z-20" style={{ top: "23%" }}>
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: "clamp(145px,16vw,215px)", background: "rgba(255,253,248,0.93)", backdropFilter: "blur(8px)" }}
      >
        <div className="px-3 py-2" style={{ background: "#f472b6" }}>
          <p className="text-white font-black tracking-[0.2em]" style={{ fontSize: "clamp(9px,1vw,12px)" }}>
            STUDY TICKET
          </p>
        </div>
        <div className="px-3 pt-2.5 pb-3">
          <p className="text-stone-700 font-bold leading-tight" style={{ fontSize: "clamp(12px,1.3vw,16px)" }}>
            {locationName} 行き
          </p>
          <p className="text-stone-400 mt-0.5" style={{ fontSize: "clamp(9px,0.9vw,11px)" }}>{locationArea}</p>
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
                <span className="text-rose-400 text-xs leading-none">✈</span>
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
   今日の目標パネル（机付近・中央）
══════════════════════════════════════════ */
function GoalPanel({ goal }: { goal: string }) {
  return (
    <div
      className="absolute z-20"
      style={{ bottom: "20%", left: "50%", transform: "translateX(-50%)", width: "clamp(200px,24vw,340px)" }}
    >
      <div
        className="bg-amber-50/92 rounded-2xl shadow-xl ring-1 ring-amber-200/40 px-4 py-3"
        style={{ backdropFilter: "blur(8px)" }}
      >
        <p className="text-amber-700 font-black flex items-center gap-1 mb-1.5" style={{ fontSize: "clamp(9px,1vw,12px)" }}>
          今日の目標 ⭐
        </p>
        <p className="text-stone-700 font-medium leading-snug break-words" style={{ fontSize: "clamp(11px,1.2vw,15px)" }}>
          {goal || "（目標を入力しよう）"}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   完了スタンプ演出 (z-25)
   勉強終了時にポンと押されるアニメーション
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
   タイマーコントロール（4状態）

   before   → [出発する]
   running  → [一時停止] [終了する]
   paused   → [再開する] [終了する]
   finished → [マップへ戻る]
══════════════════════════════════════════ */
type TimerState = "before" | "running" | "paused" | "finished";

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
}) {
  return (
    <>
      {/* プリセット（開始前のみ） */}
      {state === "before" && (
        <div
          className="absolute z-20 flex gap-2 items-center"
          style={{ bottom: "14%", left: "50%", transform: "translateX(-50%)" }}
        >
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onPreset(p.minutes)}
              className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                selectedMinutes === p.minutes && !customMinutes
                  ? "bg-white text-stone-700 shadow-md"
                  : "bg-black/25 backdrop-blur text-white/75 hover:bg-black/40"
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
            className="rounded-full bg-black/25 backdrop-blur text-white text-center placeholder-white/35 focus:outline-none focus:bg-black/40"
            style={{ width: "clamp(48px,5vw,64px)", padding: "6px 8px", fontSize: "clamp(12px,1.1vw,14px)" }}
          />
        </div>
      )}

      {/* ボタンエリア */}
      <div
        className="absolute z-20 flex gap-3 items-center"
        style={{ bottom: "4%", left: "20%", right: "20%" }}
      >
        {state === "before" && (
          <button
            onClick={onStart}
            className="flex-1 rounded-full font-black text-white bg-rose-400 hover:bg-rose-300 shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            style={{ padding: "clamp(13px,1.5vw,17px) 0", fontSize: "clamp(13px,1.3vw,17px)" }}
          >
            <Play size={16} fill="white" strokeWidth={0} />
            出発する
          </button>
        )}

        {state === "running" && (
          <>
            <button
              onClick={onPause}
              className="flex-1 rounded-full font-bold bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20 shadow-lg flex items-center justify-center gap-1.5 transition-all"
              style={{ padding: "clamp(11px,1.3vw,15px) 0", fontSize: "clamp(12px,1.2vw,16px)" }}
            >
              <Pause size={14} />一時停止
            </button>
            <button
              onClick={onEnd}
              className="flex-1 rounded-full font-black text-white bg-rose-400/85 hover:bg-rose-400 shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{ padding: "clamp(13px,1.5vw,17px) 0", fontSize: "clamp(13px,1.3vw,17px)" }}
            >
              <Square size={14} fill="white" strokeWidth={0} />終了する
            </button>
          </>
        )}

        {state === "paused" && (
          <>
            <button
              onClick={onResume}
              className="flex-1 rounded-full font-bold bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20 shadow-lg flex items-center justify-center gap-1.5 transition-all"
              style={{ padding: "clamp(11px,1.3vw,15px) 0", fontSize: "clamp(12px,1.2vw,16px)" }}
            >
              <Play size={14} />再開する
            </button>
            <button
              onClick={onEnd}
              className="flex-1 rounded-full font-black text-white bg-rose-400/85 hover:bg-rose-400 shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{ padding: "clamp(13px,1.5vw,17px) 0", fontSize: "clamp(13px,1.3vw,17px)" }}
            >
              <Square size={14} fill="white" strokeWidth={0} />終了する
            </button>
          </>
        )}

        {state === "finished" && (
          <button
            onClick={onBackToMap}
            className="flex-1 rounded-full font-black text-white bg-emerald-500 hover:bg-emerald-400 shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            style={{ padding: "clamp(13px,1.5vw,17px) 0", fontSize: "clamp(13px,1.3vw,17px)" }}
          >
            マップへ戻る →
          </button>
        )}
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

  /* ハンドラ */
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

      {/* ── Layer 4: 小物レイヤー・付箋 (z-16) ── */}
      <AccessoriesLayer />

      {/* ── Layer 5: ペット (z-17) ── */}
      <PetLayer
        characterId={characterId}
        timerState={timerState}
        justStarted={justStarted}
      />

      {/* ── Layer 6: エフェクト (z-18, 将来の場所別演出) ── */}
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
        locationArea={locationArea}
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
        locationArea={locationArea}
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
      />

    </div>
  );
}
