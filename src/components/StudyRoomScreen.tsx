"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, RotateCcw, Pause, Play, Check } from "lucide-react";

const STUDY_BG_KEY = "jibun_study_room_bg";

const MESSAGES = [
  "25分だけ、ここにいよう",
  "今はノートの方へ",
  "そのまま続けよう",
  "少しずつでいい",
  "集中してるね",
  "いい調子だよ",
  "ファイト！",
  "あとちょっとだよ",
];

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

type CharState = "idle" | "writing" | "complete";

interface Props {
  goal: string;
  characterId: string;
  studyRoomBg?: "classroom" | "gradient";
  locationName?: string; // 旅モード時に地点名を表示
  onComplete: (minutes: number) => void;
  onExit: () => void;
}

export default function StudyRoomScreen({ goal, characterId, studyRoomBg = "classroom", locationName, onComplete, onExit }: Props) {
  /* ── Timer state ── */
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customMinutes, setCustomMinutes]     = useState("");
  const [secondsLeft, setSecondsLeft]         = useState(25 * 60);
  const [running, setRunning]                 = useState(false);
  const [started, setStarted]                 = useState(false);
  const [finished, setFinished]               = useState(false);
  const startSecondsRef = useRef(25 * 60);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Character state ── */
  const [msgIdx, setMsgIdx]       = useState(0);
  const [charState, setCharState] = useState<CharState>("idle");

  /* ── Custom background (localStorage) ── */
  const [bgSrc, setBgSrc] = useState("");
  useEffect(() => {
    try {
      const s = localStorage.getItem(STUDY_BG_KEY);
      if (s) setBgSrc(s);
    } catch {}
  }, []);

  /* ── Rotate message every 30s ── */
  useEffect(() => {
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % MESSAGES.length),
      30_000,
    );
    return () => clearInterval(t);
  }, []);

  /* ── Writing animation every 3 min while running ── */
  useEffect(() => {
    if (!running || finished) return;
    const t = setInterval(() => {
      setCharState("writing");
      setTimeout(() => setCharState("idle"), 4_000);
    }, 3 * 60_000);
    return () => clearInterval(t);
  }, [running, finished]);

  /* ── Complete state ── */
  useEffect(() => {
    if (finished) setCharState("complete");
  }, [finished]);

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

  /* ── Actions ── */
  const handleStart = () => {
    startSecondsRef.current = secondsLeft;
    setStarted(true);
    setRunning(true);
  };

  const handlePause = () => setRunning((r) => !r);

  const handleReset = () => {
    setRunning(false);
    setStarted(false);
    setFinished(false);
    setCharState("idle");
    setSecondsLeft(selectedMinutes * 60);
  };

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
  const progress = started
    ? (startSecondsRef.current - secondsLeft) / startSecondsRef.current
    : 0;

  const elapsedSec  = started ? startSecondsRef.current - secondsLeft : 0;
  const elapsedMins = Math.floor(elapsedSec / 60);
  const elapsedSecs = elapsedSec % 60;
  const leftMins    = Math.floor(secondsLeft / 60);
  const leftSecs    = secondsLeft % 60;
  const timeStr     = `${String(leftMins).padStart(2, "0")}:${String(leftSecs).padStart(2, "0")}`;
  const elapsedStr  = `${String(elapsedMins).padStart(2, "0")}:${String(elapsedSecs).padStart(2, "0")}`;
  const emoji       = CHAR_EMOJI[characterId] ?? "🐱";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">

      {/* 背景: CSSグラデーション（最下層） */}
      <div className="absolute inset-0 classroom-bg" />

      {/* 背景画像 */}
      {bgSrc ? (
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${bgSrc})`, backgroundPosition: "center 70%" }}
        />
      ) : studyRoomBg === "classroom" ? (
        <img
          src="/-/classroom-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 60%" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : null}

      {/* ビネット */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/75 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />

      {/* ── 進行バー ── */}
      <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-white/15">
        <div
          className="h-full bg-red-500 transition-all duration-1000 ease-linear"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>

      {/* ── 上部バー ── */}
      <div className="absolute top-1 left-0 right-0 z-20 flex items-center justify-between px-4 pt-2 pb-1">
        <div className="flex items-center gap-2">
          {locationName && (
            <span className="text-white/70 text-xs bg-white/15 px-2 py-0.5 rounded-full">
              🗺 {locationName}
            </span>
          )}
          <span className="text-white/50 text-xs font-mono tabular-nums select-none">
            {started && !finished ? `経過 ${elapsedStr}` : ""}
          </span>
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-white/55 hover:text-white/90 transition-colors text-xs"
        >
          <X size={13} />
          退出
        </button>
      </div>

      {/* ── 開始前: 中央下部カード ── */}
      {!started && (
        <div className="absolute inset-0 z-20 flex items-end justify-center pb-10 px-4">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-5 w-full max-w-sm flex flex-col gap-4">
            <p className="text-white/65 text-xs text-center tracking-widest">時間を選んでスタート</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p.minutes)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedMinutes === p.minutes && !customMinutes
                      ? "bg-white text-gray-800 shadow"
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
                className="w-16 px-2 py-1.5 rounded-full text-sm bg-white/20 text-white text-center placeholder-white/40 focus:outline-none focus:bg-white/30"
              />
            </div>
            <button
              onClick={handleStart}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <Play size={18} />
              自習をはじめる
            </button>
          </div>
        </div>
      )}

      {/* ── 勉強中UI ── */}
      {started && (
        <>
          {/* 目標付箋 — 左下 */}
          <div className="absolute bottom-10 left-4 z-20 max-w-[160px]">
            <div className="bg-yellow-100/92 text-yellow-900 text-xs font-medium px-3 py-2.5 rounded shadow-md leading-snug"
              style={{ boxShadow: "2px 3px 8px rgba(0,0,0,0.25), 0 1px 0 rgba(0,0,0,0.08)" }}
            >
              <p className="text-yellow-600/80 text-[10px] mb-1 font-bold tracking-wide">📝 今日の目標</p>
              <p className="leading-relaxed break-words">{goal}</p>
              {finished && (
                <p className="mt-1.5 text-emerald-600 font-bold">✓ 完了！</p>
              )}
            </div>
          </div>

          {/* キャラ — 右下 */}
          <div className="absolute bottom-10 right-4 z-20 flex flex-col items-center gap-1.5">
            {/* 吹き出し */}
            <div className="relative bg-white/88 backdrop-blur-sm text-gray-700 text-[11px] font-medium px-3 py-1.5 rounded-xl shadow max-w-[120px] text-center leading-snug">
              {finished ? "おつかれさま！\nちゃんと進んだね" : MESSAGES[msgIdx]}
              <span
                className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 block w-0 h-0"
                style={{
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "6px solid rgba(255,255,255,0.88)",
                }}
              />
            </div>
            {/* キャラ絵文字 */}
            <div
              className={`text-4xl select-none drop-shadow-lg ${
                charState === "idle" && running ? "animate-bounce-gentle" :
                charState === "writing"         ? "animate-writing"       : ""
              }`}
            >
              {charState === "complete" ? "🎉" : emoji}
            </div>
            {charState === "writing" && !finished && (
              <span className="text-sm -mt-0.5">✏️</span>
            )}
          </div>

          {/* タイマー — 中央下部（コンパクト） */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5">
            <div className={`text-3xl font-bold tabular-nums tracking-tight drop-shadow-lg ${
              finished ? "text-emerald-400" : "text-white"
            }`}>
              {finished ? "完了！" : timeStr}
            </div>
            <div className="text-white/45 text-[11px]">
              {finished ? "記録しよう" : running ? "残り" : "一時停止中"}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {!finished && (
                <button
                  onClick={handlePause}
                  className="p-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-full transition-all"
                >
                  {running ? <Pause size={13} /> : <Play size={13} />}
                </button>
              )}
              <button
                onClick={handleComplete}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white rounded-full font-medium flex items-center gap-1 text-xs transition-all shadow"
              >
                <Check size={12} />
                終了
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 text-white/30 hover:text-white/60 hover:bg-white/10 active:scale-95 rounded-full transition-all"
                title="リセット"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
