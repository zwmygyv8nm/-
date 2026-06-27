"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pause, Play, Square, LogOut } from "lucide-react";

const CHAR_EMOJI: Record<string, string> = {
  neko:  "🐱",
  shiro: "🐰",
  kuma:  "🐻",
};

const PRESETS = [
  { label: "25分", minutes: 25 },
  { label: "50分", minutes: 50 },
  { label: "90分", minutes: 90 },
];

/* ── Barcode decoration ── */
function Barcode() {
  const pattern = [3,1,2,1,3,2,1,3,1,2,1,2,3,1,1,2,3,1,2,1,3,1,2,2,1,3,1,2,1,3];
  return (
    <div className="flex items-end gap-[1.5px] h-7">
      {pattern.map((w, i) => (
        <div
          key={i}
          className="bg-stone-700 rounded-[0.5px]"
          style={{ width: w === 1 ? 2 : w === 2 ? 3 : 4, height: i % 5 === 0 ? "100%" : "80%" }}
        />
      ))}
    </div>
  );
}

/* ── Stamp decoration ── */
function Stamp() {
  return (
    <div className="relative w-16 h-16 shrink-0">
      <div className="absolute inset-0 rounded-full border-[3px] border-red-700/60 opacity-70" />
      <div className="absolute inset-[6px] rounded-full border border-red-700/40 opacity-70" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-red-700/70 text-[7px] font-black tracking-[0.2em] leading-none">STUDY</span>
        <span className="text-red-700/70 text-[9px]">🚂</span>
        <span className="text-red-700/70 text-[7px] font-black tracking-[0.15em] leading-none">TRIP</span>
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
  locationStudyMinutes: number;   // 以前のセッション累計
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
  const startSecondsRef = useRef(25 * 60);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Timer tick ── */
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

  const handleStart = () => {
    startSecondsRef.current = secondsLeft;
    setStarted(true);
    setRunning(true);
  };

  const handlePause = () => setRunning((r) => !r);

  const handleComplete = useCallback(() => {
    const elapsed = Math.round((startSecondsRef.current - secondsLeft) / 60);
    onComplete(Math.max(1, elapsed));
  }, [secondsLeft, onComplete]);

  const handlePreset = (m: number) => {
    if (started) return;
    setSelectedMinutes(m);
    setSecondsLeft(m * 60);
    setCustomMinutes("");
  };

  const handleCustom = (val: string) => {
    if (started) return;
    setCustomMinutes(val);
    const n = parseInt(val);
    if (!isNaN(n) && n > 0 && n <= 300) {
      setSelectedMinutes(n);
      setSecondsLeft(n * 60);
    }
  };

  /* ── Derived ── */
  const elapsedSec  = started ? startSecondsRef.current - secondsLeft : 0;
  const elapsedMins = Math.floor(elapsedSec / 60);
  const leftMins    = Math.floor(secondsLeft / 60);
  const leftSecs    = secondsLeft % 60;
  const timeStr     = `${String(leftMins).padStart(2, "0")}:${String(leftSecs).padStart(2, "0")}`;

  // 滞在時間（このセッションの経過 + 以前の累計）
  const totalStayed = locationStudyMinutes + elapsedMins;
  const stayPct     = Math.min(100, (totalStayed / locationRequiredMinutes) * 100);

  // 進行ドット（5分 = 1ドット）
  const totalDots  = Math.max(12, Math.ceil(locationRequiredMinutes / 5));
  const filledDots = Math.floor(totalStayed / 5);

  const emoji = CHAR_EMOJI[characterId] ?? "🐱";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">

      {/* ── 背景画像 ── */}
      {locationBgImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${locationBgImage})` }}
        />
      ) : (
        /* 画像未設定: 旅感のある美しいグラデーション */
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-teal-500 to-emerald-600" />
      )}

      {/* オーバーレイ（上下グラデーション） */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70 pointer-events-none" />

      {/* ── TOP: タイマー card (左) + 旅先 card (右) ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-3 pt-safe pt-3 gap-2">

        {/* タイマーカード */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2.5 min-w-[100px]">
          <p className="text-white/55 text-[9px] tracking-widest mb-0.5">集中タイマー</p>
          <p className={`text-3xl font-bold tabular-nums tracking-tight leading-none ${
            finished ? "text-emerald-400" : "text-white"
          }`}>
            {finished ? "完了！" : timeStr}
          </p>
          {started && !finished && (
            <p className="text-white/45 text-[9px] mt-0.5">
              {running ? "集中中…" : "一時停止中"}
            </p>
          )}
        </div>

        {/* 旅先カード */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2.5 text-right min-w-[120px]">
          <p className="text-white/55 text-[9px] tracking-widest mb-0.5">今日の旅先</p>
          <p className="text-white font-bold text-base leading-tight">{locationName}</p>
          <p className="text-white/55 text-[9px] mt-1.5 mb-0.5">滞在時間</p>
          <p className="text-white font-semibold text-sm tabular-nums">
            {totalStayed} <span className="text-white/60 font-normal text-xs">/ {locationRequiredMinutes}分</span>
          </p>
        </div>
      </div>

      {/* ── 進行ドット ── */}
      <div className="absolute top-[88px] left-0 right-0 z-20 flex flex-col items-center gap-1">
        <p className="text-white/50 text-[9px] tracking-widest">今日の進行</p>
        <div className="flex flex-wrap justify-center gap-[4px] px-6 max-w-xs">
          {Array.from({ length: totalDots }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ${
                i < filledDots
                  ? "bg-white w-4 h-2"
                  : "bg-white/25 w-4 h-2"
              }`}
            />
          ))}
        </div>
        {/* 滞在進行バー */}
        <div className="w-40 h-0.5 bg-white/20 rounded-full mt-1">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
            style={{ width: `${stayPct}%` }}
          />
        </div>
      </div>

      {/* ── キャラクター（右下） ── */}
      <div className="absolute bottom-[200px] right-4 z-20 text-5xl drop-shadow-xl pointer-events-none">
        {emoji}
      </div>

      {/* ── 下部パネル ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-stone-50/10 backdrop-blur-md rounded-t-3xl px-4 pt-4 pb-safe pb-6">

          {/* 時間プリセット（スタート前のみ） */}
          {!started && (
            <div className="flex gap-2 justify-center mb-3">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p.minutes)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedMinutes === p.minutes && !customMinutes
                      ? "bg-white text-gray-800 shadow-md"
                      : "bg-white/20 text-white/80 hover:bg-white/30"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={300}
                value={customMinutes}
                onChange={(e) => handleCustom(e.target.value)}
                placeholder="自由"
                className="w-14 px-2 py-1.5 rounded-full text-sm bg-white/20 text-white text-center placeholder-white/40 focus:outline-none focus:bg-white/30"
              />
            </div>
          )}

          {/* 3カードエリア（横スクロール） */}
          <div className="flex gap-3 overflow-x-auto pb-2 mb-3 scrollbar-hide snap-x snap-mandatory">

            {/* STUDY TICKET */}
            <div className="bg-[#f5ece0] rounded-2xl p-3 min-w-[160px] snap-start shrink-0 shadow-md">
              <p className="text-[9px] font-black tracking-[0.2em] text-stone-500 mb-1">STUDY TICKET</p>
              <p className="text-stone-800 font-bold text-sm leading-tight mb-0.5">
                {locationName} <span className="text-stone-500 font-normal text-xs">行き</span>
              </p>
              <p className="text-stone-400 text-[10px] mb-2">出発時刻：{selectedMinutes}分間の集中</p>
              <div className="flex items-end justify-between gap-2">
                <Barcode />
                <Stamp />
              </div>
            </div>

            {/* 今日の目標 */}
            <div className="bg-yellow-50/95 rounded-2xl p-3 min-w-[148px] snap-start shrink-0 shadow-md">
              <p className="text-[10px] font-bold text-yellow-700 mb-1.5 flex items-center gap-1">
                🏁 今日の目標
              </p>
              <p className="text-stone-700 text-sm leading-snug break-words">{goal || "（未設定）"}</p>
              {finished && (
                <p className="mt-2 text-emerald-600 text-xs font-bold">✓ 達成！</p>
              )}
            </div>

            {/* 旅メモ */}
            <div className="bg-white/90 rounded-2xl p-3 min-w-[160px] snap-start shrink-0 shadow-md">
              <p className="text-[10px] font-bold text-stone-500 mb-1.5">旅メモ ✏️</p>
              <p className="text-stone-600 text-xs leading-relaxed">{locationDescription}</p>
              <p className="text-stone-400 text-[10px] mt-2 font-medium">{locationArea}</p>
            </div>
          </div>

          {/* ボタンエリア */}
          {!started ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleStart}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white rounded-2xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Play size={18} fill="white" />
                出発する
              </button>
              <button
                onClick={onExit}
                className="w-full py-2.5 bg-white/15 hover:bg-white/25 text-white/70 rounded-2xl text-sm transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} />
                退出する
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handlePause}
                className="flex-1 py-3 bg-white/20 hover:bg-white/30 active:scale-95 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 backdrop-blur-sm"
              >
                {running ? <><Pause size={16} /> 一時停止</> : <><Play size={16} /> 再開</>}
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 py-3 bg-white/15 hover:bg-red-500/70 active:scale-95 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 backdrop-blur-sm"
              >
                <Square size={14} fill="white" />
                終了する
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
