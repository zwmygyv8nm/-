"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Check } from "lucide-react";

interface TimerProps {
  onComplete: (minutes: number) => void;
}

const PRESETS = [
  { label: "25分", minutes: 25 },
  { label: "50分", minutes: 50 },
  { label: "90分", minutes: 90 },
];

export default function Timer({ onComplete }: TimerProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const startSecondsRef = useRef<number>(selectedMinutes * 60);

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
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handleSelectPreset = (m: number) => {
    if (started) return;
    setSelectedMinutes(m);
    setSecondsLeft(m * 60);
    setCustomMinutes("");
  };

  const handleCustomChange = (val: string) => {
    if (started) return;
    setCustomMinutes(val);
    const n = parseInt(val);
    if (!isNaN(n) && n > 0 && n <= 300) {
      setSelectedMinutes(n);
      setSecondsLeft(n * 60);
    }
  };

  const handleStart = () => {
    startSecondsRef.current = secondsLeft;
    startTimeRef.current = Date.now();
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

  const handleComplete = () => {
    const elapsed = Math.round((startSecondsRef.current - secondsLeft) / 60);
    onComplete(Math.max(1, elapsed));
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = started ? 1 - secondsLeft / (selectedMinutes * 60) : 0;
  const circumference = 2 * Math.PI * 80;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Presets */}
      {!started && (
        <div className="flex gap-2 flex-wrap justify-center">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSelectPreset(p.minutes)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedMinutes === p.minutes && !customMinutes
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white/80 text-gray-600 hover:bg-indigo-50 border border-gray-200"
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
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="自由入力"
            className="w-24 px-3 py-2 rounded-full text-sm border border-gray-200 bg-white/80 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-center"
          />
        </div>
      )}

      {/* Circular timer */}
      <div className="relative">
        <svg width="200" height="200" className="-rotate-90">
          <circle
            cx="100"
            cy="100"
            r="80"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r="80"
            stroke={finished ? "#10b981" : "#6366f1"}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {finished ? (
            <div className="text-4xl animate-bounce">🎉</div>
          ) : (
            <>
              <span className="text-4xl font-bold tabular-nums text-gray-800">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                {running ? "勉強中..." : started ? "一時停止中" : "準備OK"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 items-center">
        {!started && !finished && (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <Play size={18} />
            スタート
          </button>
        )}
        {started && !finished && (
          <>
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full font-medium shadow transition-all"
            >
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? "一時停止" : "再開"}
            </button>
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium shadow transition-all"
            >
              <Check size={16} />
              終了する
            </button>
          </>
        )}
        {finished && (
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium shadow-lg transition-all"
          >
            <Check size={18} />
            記録して終了
          </button>
        )}
        {started && (
          <button
            onClick={handleReset}
            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            title="リセット"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
