"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pause, Play, Square, LogOut } from "lucide-react";

const CHAR_EMOJI: Record<string, string> = {
  neko:  "🐱",
  shiro: "🐰",
  kuma:  "🐻",
};

const TRAVEL_MESSAGES = [
  "旅の途中でも、勉強は続く",
  "集中してるね。すごいよ",
  "ここに来てよかった",
  "いい景色の中で学ぼう",
  "少しずつ、確実に",
  "あとちょっとだよ",
];

const PRESETS = [
  { label: "25分", minutes: 25 },
  { label: "50分", minutes: 50 },
  { label: "90分", minutes: 90 },
];

/* ── Barcode decoration ── */
function Barcode() {
  const pattern = [3,1,2,1,3,2,1,3,1,2,1,2,3,1,1,2,3,1,2,1,3,1,2,2,1,3,1,2,1,3];
  return (
    <div className="flex items-end gap-[1.5px] h-6 mt-1">
      {pattern.map((w, i) => (
        <div
          key={i}
          className="bg-stone-600 rounded-[0.5px]"
          style={{ width: w === 1 ? 2 : w === 2 ? 3 : 4, height: i % 5 === 0 ? "100%" : "80%" }}
        />
      ))}
    </div>
  );
}

/* ── Stamp decoration ── */
function Stamp() {
  return (
    <div className="relative w-14 h-14 shrink-0 opacity-75">
      <div className="absolute inset-0 rounded-full border-[3px] border-rose-700" />
      <div className="absolute inset-[5px] rounded-full border border-rose-600" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
        <span className="text-rose-700 text-[7px] font-black tracking-[0.15em]">STUDY</span>
        <span className="text-rose-700 text-base leading-none">✈</span>
        <span className="text-rose-700 text-[7px] font-black tracking-[0.12em]">TRIP</span>
      </div>
    </div>
  );
}

interface Props {
  goal: string;
  characterId: string;
  locationName: string;
  locationArea: string;
  locationDescription: string;
  locationBgImage?: string;
  locationStudyMinutes: number;
  locationRequiredMinutes: number;
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
  onComplete,
  onExit,
}: Props) {
  /* ── Timer state ── */
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customMinutes,   setCustomMinutes]   = useState("");
  const [secondsLeft,     setSecondsLeft]     = useState(25 * 60);
  const [running,         setRunning]         = useState(false);
  const [started,         setStarted]         = useState(false);
  const [finished,        setFinished]        = useState(false);
  const [msgIdx,          setMsgIdx]          = useState(0);
  const startSecondsRef = useRef(25 * 60);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) { clearInterval(intervalRef.current!); setRunning(false); setFinished(true); return 0; }
          return s - 1;
        });
      }, 1_000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setMsgIdx(i => (i + 1) % TRAVEL_MESSAGES.length), 30_000);
    return () => clearInterval(t);
  }, [running]);

  const handleStart = () => { startSecondsRef.current = secondsLeft; setStarted(true); setRunning(true); };
  const handlePause = () => setRunning(r => !r);
  const handleComplete = useCallback(() => {
    onComplete(Math.max(1, Math.round((startSecondsRef.current - secondsLeft) / 60)));
  }, [secondsLeft, onComplete]);

  const handlePreset = (m: number) => {
    if (started) return;
    setSelectedMinutes(m); setSecondsLeft(m * 60); setCustomMinutes("");
  };
  const handleCustom = (val: string) => {
    if (started) return;
    setCustomMinutes(val);
    const n = parseInt(val);
    if (!isNaN(n) && n > 0 && n <= 300) { setSelectedMinutes(n); setSecondsLeft(n * 60); }
  };

  /* ── Derived ── */
  const elapsedSec  = started ? startSecondsRef.current - secondsLeft : 0;
  const elapsedMins = Math.floor(elapsedSec / 60);
  const leftMins    = Math.floor(secondsLeft / 60);
  const leftSecs    = secondsLeft % 60;
  const timeStr     = `${String(leftMins).padStart(2, "0")}:${String(leftSecs).padStart(2, "0")}`;
  const totalStayed = locationStudyMinutes + elapsedMins;
  const stayPct     = Math.min(100, (totalStayed / locationRequiredMinutes) * 100);

  // 進行ドット: 5分1ドット、最大12個
  const DOT_COUNT  = 12;
  const minsPerDot = locationRequiredMinutes / DOT_COUNT;
  const filledDots = Math.min(DOT_COUNT, Math.floor(totalStayed / minsPerDot));

  const emoji = CHAR_EMOJI[characterId] ?? "🐱";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">

      {/* ── 背景 ── */}
      {locationBgImage ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${locationBgImage})` }} />
      ) : (
        <div className="absolute inset-0">
          {/* 美しい旅先グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-sky-800 to-teal-700" />
          {/* 光の演出 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(99,179,237,0.35),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_70%,rgba(129,230,217,0.2),transparent)]" />
        </div>
      )}
      {/* 上下ビネット */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/0 to-black/80 pointer-events-none" />

      {/* ── TOP: タイマー (左) + 旅先 (右) ── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between gap-2">
        {/* タイマーカード */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl px-4 pt-3 pb-3 ring-1 ring-white/10 shadow-xl">
          <p className="text-white/40 text-[10px] tracking-[0.15em] font-medium mb-1">集中タイマー</p>
          <p className={`text-4xl font-black tabular-nums tracking-tight leading-none ${finished ? "text-emerald-400" : "text-white"}`}>
            {finished ? "完了" : timeStr}
          </p>
          <p className="text-white/40 text-[10px] mt-1.5">
            {!started ? "スタート前" : running ? "集中中…" : finished ? "お疲れ様！" : "一時停止中"}
          </p>
        </div>

        {/* 旅先カード */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl px-4 pt-3 pb-3 text-right ring-1 ring-white/10 shadow-xl">
          <p className="text-white/40 text-[10px] tracking-[0.15em] font-medium mb-1">今日の旅先</p>
          <p className="text-white font-bold text-lg leading-tight">{locationName}</p>
          <p className="text-white/40 text-[10px] mt-1.5 mb-0.5 tracking-wide">滞在時間</p>
          <p className="text-white font-semibold text-base tabular-nums">
            {totalStayed}<span className="text-white/40 font-normal text-sm"> / {locationRequiredMinutes}分</span>
          </p>
        </div>
      </div>

      {/* ── 進行ドット（中央上部） ── */}
      <div className="absolute top-28 left-0 right-0 z-20 flex flex-col items-center gap-2">
        <p className="text-white/40 text-[10px] tracking-[0.2em] font-medium">今日の進行</p>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: DOT_COUNT }).map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-700 ${
              i < filledDots
                ? "w-5 h-2 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                : "w-4 h-1.5 bg-white/20"
            }`} />
          ))}
        </div>
        {/* 細い滞在バー */}
        <div className="w-48 h-0.5 bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400/70 rounded-full transition-all duration-1000" style={{ width: `${stayPct}%` }} />
        </div>
      </div>

      {/* ── 中央：地点名シネマ風 ── */}
      {!started && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none pb-24">
          <p className="text-white/25 text-xs tracking-[0.4em] font-medium mb-2 uppercase">{locationArea}</p>
          <h1 className="text-white/30 text-4xl font-black tracking-wide">{locationName}</h1>
        </div>
      )}

      {/* ── キャラ（走行中、右下角） ── */}
      {started && !finished && (
        <div className="absolute bottom-[272px] right-5 z-20 flex flex-col items-center gap-1.5 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-lg max-w-[110px] text-center leading-snug">
            {running ? TRAVEL_MESSAGES[msgIdx] : "一時停止中…"}
          </div>
          <div className="text-4xl drop-shadow-xl">{emoji}</div>
        </div>
      )}
      {finished && (
        <div className="absolute bottom-[272px] right-5 z-20 flex flex-col items-center gap-1.5 pointer-events-none">
          <div className="bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg text-center">
            お疲れ様！
          </div>
          <div className="text-4xl drop-shadow-xl">🎉</div>
        </div>
      )}

      {/* ── 下部パネル ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-slate-900/75 backdrop-blur-2xl rounded-t-3xl px-4 pt-5 pb-6 ring-1 ring-white/10 shadow-2xl">

          {/* 時間プリセット（スタート前のみ） */}
          {!started && (
            <div className="flex gap-2 justify-center mb-4">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p.minutes)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    selectedMinutes === p.minutes && !customMinutes
                      ? "bg-white text-slate-800 shadow-lg"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <input
                type="number" min={1} max={300} value={customMinutes}
                onChange={(e) => handleCustom(e.target.value)}
                placeholder="自由"
                className="w-14 px-2 py-2 rounded-full text-sm bg-white/10 text-white text-center placeholder-white/30 focus:outline-none focus:bg-white/20"
              />
            </div>
          )}

          {/* 3カード（横スクロール） */}
          <div className="flex gap-3 overflow-x-auto pb-1 mb-4 scrollbar-hide snap-x snap-mandatory -mx-1 px-1">

            {/* STUDY TICKET */}
            <div className="bg-[#f5ece0] rounded-2xl p-4 min-w-[168px] snap-start shrink-0 shadow-xl ring-1 ring-stone-200">
              <p className="text-[9px] font-black tracking-[0.25em] text-stone-400 mb-2">STUDY TICKET</p>
              <p className="text-stone-800 font-bold text-sm leading-tight">
                {locationName}&nbsp;<span className="text-stone-400 font-normal text-xs">行き</span>
              </p>
              <p className="text-stone-400 text-[11px] mt-0.5 mb-3">出発時刻：{selectedMinutes}分間の集中</p>
              <div className="flex items-end justify-between">
                <Barcode />
                <Stamp />
              </div>
            </div>

            {/* 今日の目標 */}
            <div className="bg-amber-50 rounded-2xl p-4 min-w-[152px] snap-start shrink-0 shadow-xl ring-1 ring-amber-100">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <p className="text-[10px] font-bold text-amber-700 tracking-wide">今日の目標</p>
              </div>
              <p className="text-stone-700 text-sm leading-snug break-words">{goal || "（未設定）"}</p>
              {finished && (
                <p className="mt-3 text-emerald-600 text-xs font-black">✓ 達成！</p>
              )}
            </div>

            {/* 旅メモ */}
            <div className="bg-sky-50 rounded-2xl p-4 min-w-[168px] snap-start shrink-0 shadow-xl ring-1 ring-sky-100">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-sky-400" />
                <p className="text-[10px] font-bold text-sky-700 tracking-wide">旅メモ</p>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">{locationDescription}</p>
              <p className="text-slate-400 text-[10px] mt-2 font-medium">{locationArea}</p>
            </div>
          </div>

          {/* ボタン */}
          {!started ? (
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleStart}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2"
              >
                <Play size={18} fill="white" strokeWidth={0} />
                出発する
              </button>
              <button
                onClick={onExit}
                className="w-full py-3 bg-white/8 hover:bg-white/15 text-white/50 hover:text-white/70 rounded-2xl text-sm transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} />
                退出する
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handlePause}
                className="flex-1 py-3.5 bg-white/10 hover:bg-white/18 active:scale-[0.98] text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ring-1 ring-white/15"
              >
                {running ? <><Pause size={16} />一時停止</> : <><Play size={16} />再開</>}
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 py-3.5 bg-white/8 hover:bg-red-500/50 active:scale-[0.98] text-white/70 hover:text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ring-1 ring-white/10"
              >
                <Square size={14} fill="currentColor" strokeWidth={0} />
                終了する
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
