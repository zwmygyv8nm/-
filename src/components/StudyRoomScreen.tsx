"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, RotateCcw, Pause, Play, Check, Image as ImageIcon } from "lucide-react";

const STUDY_BG_KEY = "jibun_study_room_bg";

const MESSAGES = [
  "そのまま続けよう",
  "今はノートの方へ",
  "25分だけ、ここで見守ってる",
  "少しずつでいい",
  "集中してるね！",
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

interface Props {
  goal: string;
  characterId: string;
  onComplete: (minutes: number) => void;
  onExit: () => void;
}

export default function StudyRoomScreen({ goal, characterId, onComplete, onExit }: Props) {
  /* ── Timer state ── */
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customMinutes, setCustomMinutes]     = useState("");
  const [secondsLeft, setSecondsLeft]         = useState(25 * 60);
  const [running, setRunning]                 = useState(false);
  const [started, setStarted]                 = useState(false);
  const [finished, setFinished]               = useState(false);
  const startSecondsRef = useRef(25 * 60);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Character ── */
  const [msgIdx, setMsgIdx] = useState(0);

  /* ── Background ── */
  const [bgSrc, setBgSrc] = useState("");

  /* ── Load stored background ── */
  useEffect(() => {
    try {
      const s = localStorage.getItem(STUDY_BG_KEY);
      if (s) setBgSrc(s);
    } catch {}
  }, []);

  /* ── Rotate character message every 30s ── */
  useEffect(() => {
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % MESSAGES.length),
      30_000,
    );
    return () => clearInterval(t);
  }, []);

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

  /* ── Timer actions ── */
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

  /* ── Background change ── */
  const handleBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      setBgSrc(b64);
      try { localStorage.setItem(STUDY_BG_KEY, b64); } catch {}
    };
    reader.readAsDataURL(file);
  };

  const handleBgClear = () => {
    setBgSrc("");
    try { localStorage.removeItem(STUDY_BG_KEY); } catch {}
  };

  /* ── Derived ── */
  const progress = started
    ? (startSecondsRef.current - secondsLeft) / startSecondsRef.current
    : 0;

  const elapsedSec   = started ? startSecondsRef.current - secondsLeft : 0;
  const elapsedMins  = Math.floor(elapsedSec / 60);
  const elapsedSecs  = elapsedSec % 60;
  const leftMins     = Math.floor(secondsLeft / 60);
  const leftSecs     = secondsLeft % 60;
  const timeStr      = `${String(leftMins).padStart(2, "0")}:${String(leftSecs).padStart(2, "0")}`;
  const elapsedStr   = `${String(elapsedMins).padStart(2, "0")}:${String(elapsedSecs).padStart(2, "0")}`;
  const emoji        = CHAR_EMOJI[characterId] ?? "🐱";

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* 背景レイヤー: CSS グラデーション（常に最下層） */}
      <div className="absolute inset-0 classroom-bg" />

      {/* デフォルト教室画像 / ユーザーカスタム画像 */}
      {bgSrc ? (
        /* ユーザーが選んだ画像（localStorage） */
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${bgSrc})`, backgroundPosition: "center 70%" }}
        />
      ) : (
        /* public/classroom-bg.jpg をデフォルトとして表示、失敗時はグラデ表示 */
        <img
          src="classroom-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 60%" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}

      {/* Dark vignette for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60 pointer-events-none" />
      {/* Side vignettes */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25 pointer-events-none" />

      {/* ── Progress bar ── */}
      <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-white/15">
        <div
          className="h-full bg-red-500 transition-all duration-1000 ease-linear"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>

      {/* ── Top bar ── */}
      <div className="absolute top-1 left-0 right-0 z-20 flex items-center justify-between px-4 pt-2 pb-1">
        {/* Elapsed */}
        <div className="text-white/60 text-xs font-mono tabular-nums select-none">
          {started && !finished ? `経過 ${elapsedStr}` : ""}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* BG change */}
          <label
            className="cursor-pointer text-white/50 hover:text-white/90 transition-colors"
            title="背景画像を変更"
          >
            <input type="file" accept="image/*" className="hidden" onChange={handleBgFile} />
            <ImageIcon size={14} />
          </label>
          {bgSrc && (
            <button
              onClick={handleBgClear}
              className="text-white/50 hover:text-white/90 text-xs transition-colors"
              title="背景をリセット"
            >
              ✕
            </button>
          )}
          <button
            onClick={onExit}
            className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-xs"
          >
            <X size={13} />
            退出
          </button>
        </div>
      </div>

      {/* ── Goal pill ── */}
      <div className="absolute top-10 left-0 right-0 flex justify-center px-6 z-20">
        <div className="bg-black/35 backdrop-blur-sm text-white/85 text-xs px-4 py-1.5 rounded-full max-w-[280px] truncate">
          📝 {goal}
        </div>
      </div>

      {/* ── Character + speech bubble ── */}
      <div
        className="absolute left-0 right-0 z-20 flex flex-col items-center gap-3"
        style={{ top: "50%", transform: "translateY(-60%)" }}
      >
        {/* Speech bubble */}
        <div className="relative bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium px-5 py-2.5 rounded-2xl shadow-lg max-w-[220px] text-center leading-snug">
          {MESSAGES[msgIdx]}
          {/* Triangle */}
          <span
            className="absolute left-1/2 -bottom-2 -translate-x-1/2 block w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "10px solid rgba(255,255,255,0.9)",
            }}
          />
        </div>

        {/* Character emoji */}
        <div
          className={`text-5xl select-none drop-shadow-lg ${started && running ? "animate-bounce-gentle" : ""}`}
        >
          {emoji}
        </div>
      </div>

      {/* ── Bottom timer card ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8">
        <div className="bg-black/45 backdrop-blur-md rounded-2xl max-w-sm mx-auto overflow-hidden">

          {!started ? (
            /* Pre-start */
            <div className="p-4 flex flex-col gap-3">
              <p className="text-white/60 text-xs text-center">時間を選んでスタート</p>
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
          ) : (
            /* Running */
            <div className="p-4 flex items-center gap-4">
              {/* Time display */}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-4xl font-bold tabular-nums tracking-tight ${
                    finished ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {finished ? "🎉" : timeStr}
                </div>
                <div className="text-white/45 text-xs mt-0.5 truncate">
                  {finished
                    ? "終了！記録しよう"
                    : running
                    ? `残り ${timeStr}`
                    : "一時停止中"}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {!finished && (
                  <button
                    onClick={handlePause}
                    className="p-2.5 bg-white/20 hover:bg-white/30 active:scale-95 text-white rounded-full transition-all"
                  >
                    {running ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                )}
                <button
                  onClick={handleComplete}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white rounded-full font-medium flex items-center gap-1.5 text-sm transition-all shadow"
                >
                  <Check size={15} />
                  終了
                </button>
                <button
                  onClick={handleReset}
                  className="p-2.5 text-white/35 hover:text-white/60 hover:bg-white/10 active:scale-95 rounded-full transition-all"
                  title="リセット"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
