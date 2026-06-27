"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pause, Play, Square, X, MapPin } from "lucide-react";

const CHAR_EMOJI: Record<string, string> = {
  neko:  "🐱",
  shiro: "🐰",
  kuma:  "🐻",
};

const TRAVEL_MESSAGES = [
  "今日も\n一緒にがんばろう！",
  "集中してるね\nすごいよ",
  "ここに来て\nよかったね",
  "少しずつ\n確実に",
  "あとちょっとだよ",
  "いい調子！",
];

const PRESETS = [
  { label: "25分", minutes: 25 },
  { label: "50分", minutes: 50 },
  { label: "90分", minutes: 90 },
];

const DOT_COUNT = 12;

/* ── スタンプ ── */
function TicketStamp() {
  return (
    <div className="relative w-10 h-10 opacity-75">
      <div className="absolute inset-0 rounded-full border-2 border-rose-500" />
      <div className="absolute inset-[3px] rounded-full border border-rose-400" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-rose-500 text-[5px] font-black tracking-[0.15em]">MY STUDY</span>
        <span className="text-rose-500 text-[11px] leading-none">✈</span>
        <span className="text-rose-500 text-[5px] font-black tracking-[0.1em]">JOURNEY</span>
      </div>
    </div>
  );
}

/* ── バーコード ── */
function Barcode() {
  const pattern = [3,1,2,1,3,2,1,3,1,2,1,2,3,1,1,2,3,1,2,1];
  return (
    <div className="flex items-end gap-[1.5px] h-4">
      {pattern.map((w, i) => (
        <div
          key={i}
          className="bg-slate-400/60 rounded-[0.5px]"
          style={{ width: w === 1 ? 1.5 : w === 2 ? 2.5 : 3.5, height: i % 4 === 0 ? "100%" : "70%" }}
        />
      ))}
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
  onViewNotes?: () => void;
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
  onViewNotes,
}: Props) {
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
  const emoji       = CHAR_EMOJI[characterId] ?? "🐱";

  const charMsg = finished
    ? "お疲れ様！\nちゃんと進んだね"
    : running
    ? TRAVEL_MESSAGES[msgIdx]
    : started
    ? "一時停止中…"
    : "今日も\n一緒にがんばろう！";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">

      {/* ── 背景: 全画面旅先画像 ── */}
      {locationBgImage ? (
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src={locationBgImage}
          alt=""
        />
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-sky-800 to-teal-700" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_28%,rgba(99,179,237,0.38),transparent)]" />
        </div>
      )}

      {/* ビネット: 上下のみ、中央は透ける */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent via-40% to-black/60 pointer-events-none" />

      {/* ── 退出ボタン ── */}
      <button
        onClick={onExit}
        className="absolute top-3 right-3 z-30 text-white/55 hover:text-white bg-black/20 backdrop-blur-sm rounded-full p-2 transition-colors"
      >
        <X size={14} />
      </button>

      {/* ════════════════════════════════════
          ── 左上: 旅先カード ──
          ════════════════════════════════════ */}
      <div className="absolute top-4 left-4 z-20 max-w-[160px]">
        <div className="bg-black/38 backdrop-blur-xl rounded-2xl px-3 py-2.5 ring-1 ring-white/12 shadow-xl">
          <p className="text-white/45 text-[9px] tracking-[0.12em] flex items-center gap-0.5 mb-0.5">
            <MapPin size={8} className="shrink-0" />
            今日の旅先
          </p>
          <p className="text-white font-bold text-[15px] leading-tight">{locationName}</p>
          <p className="text-white/35 text-[10px] mt-0.5">{locationArea}</p>
        </div>
      </div>

      {/* ════════════════════════════════════
          ── 中央上: タイマー + プログレス ──
          ════════════════════════════════════ */}
      <div className="absolute top-4 left-0 right-0 z-20 flex flex-col items-center pointer-events-none">
        <p className="text-white/45 text-[10px] tracking-[0.25em] mb-2">◉ 集中タイム</p>
        <p
          className={`text-6xl font-black tabular-nums tracking-tight leading-none drop-shadow-2xl ${
            finished ? "text-emerald-400" : "text-white"
          }`}
          style={{ textShadow: "0 2px 28px rgba(0,0,0,0.55)" }}
        >
          {finished ? "完了！" : timeStr}
        </p>
        {/* 横長プログレスバー */}
        <div className="w-44 h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${stayPct}%` }}
          />
        </div>
        {/* 進行ドット */}
        <div className="flex items-center gap-[3px] mt-1.5">
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

      {/* ════════════════════════════════════
          ── 右上: 滞在時間カード ──
          ════════════════════════════════════ */}
      <div className="absolute top-4 right-4 z-20 max-w-[155px]">
        <div className="bg-black/38 backdrop-blur-xl rounded-2xl px-3 py-2.5 ring-1 ring-white/12 shadow-xl text-right">
          <p className="text-white/45 text-[9px] tracking-[0.12em] mb-0.5">滞在時間</p>
          <p className="text-white font-bold text-2xl tabular-nums leading-tight">
            {totalStayed}
            <span className="text-white/40 font-normal text-sm"> / {locationRequiredMinutes}分</span>
          </p>
          <p className={`text-[10px] mt-0.5 ${remaining === 0 ? "text-emerald-400" : "text-emerald-400"}`}>
            {remaining === 0 ? "到着完了！🎉" : `あと${remaining}分で次の旅先へ！`}
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════
          ── 左中: 旅メモカード (浮かせ・傾き) ──
          ════════════════════════════════════ */}
      <div className="absolute left-3 z-20" style={{ top: "40%" }}>
        <div
          className="bg-white/93 rounded-xl p-3 max-w-[140px] shadow-2xl ring-1 ring-black/5"
          style={{ transform: "rotate(-2deg)" }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-slate-600 text-[10px] font-bold tracking-wide">旅メモ</p>
            <span className="text-base leading-none">📷</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">{locationDescription}</p>
          <p className="text-rose-400 text-sm mt-2">🌸</p>
        </div>
      </div>

      {/* ════════════════════════════════════
          ── 右中: STUDY TICKETカード ──
          ════════════════════════════════════ */}
      <div className="absolute right-3 z-20" style={{ top: "37%" }}>
        <div
          className="bg-white/93 rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/5 max-w-[152px]"
          style={{ transform: "rotate(1.5deg)" }}
        >
          {/* ピンクヘッダー帯 */}
          <div className="bg-rose-400 px-3 py-1.5">
            <p className="text-white font-black text-[10px] tracking-[0.22em]">STUDY TICKET</p>
          </div>
          <div className="px-3 pt-2.5 pb-3">
            <p className="text-slate-700 font-bold text-[13px] leading-tight">{locationName} 行き</p>
            <p className="text-slate-400 text-[10px] mt-0.5">{locationArea}</p>
            <div className="h-px bg-slate-200/70 my-2 border-dashed border-slate-200" />
            <p className="text-slate-500 text-[10px]">出発日：今日</p>
            <p className="text-slate-500 text-[10px] mt-0.5">目的：{selectedMinutes}分集中すること！</p>
            <div className="flex items-end justify-between mt-2.5">
              <Barcode />
              <TicketStamp />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          ── 下中央: キャラ + 今日の目標ノート ──
          ════════════════════════════════════ */}
      <div className="absolute z-20 pointer-events-none" style={{ bottom: "108px", left: 0, right: 0 }}>
        <div className="flex items-end justify-center gap-3 px-4">

          {/* キャラ（旅の相棒） */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div
              className="bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-medium px-2.5 py-1.5 rounded-xl rounded-bl-none shadow-lg max-w-[90px] text-center leading-snug whitespace-pre-line"
            >
              {charMsg}
            </div>
            <div className="text-4xl drop-shadow-2xl">
              {finished ? "🎉" : emoji}
            </div>
          </div>

          {/* 今日の目標ノート */}
          <div
            className="bg-amber-50/95 rounded-xl px-4 py-3 shadow-2xl ring-1 ring-amber-200/60 flex-1 max-w-[200px]"
            style={{ transform: "rotate(0.5deg)" }}
          >
            <p className="text-amber-700 text-[11px] font-black mb-1.5 flex items-center gap-1">
              今日の目標 <span>⭐</span>
            </p>
            <p className="text-slate-600 text-[12px] leading-snug break-words">
              {goal || "（目標を入力しよう）"}
            </p>
            {finished && (
              <p className="mt-2 text-emerald-600 text-[11px] font-black">✓ 達成！</p>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          ── 時間プリセット（スタート前のみ、中央） ──
          ════════════════════════════════════ */}
      {!started && (
        <div className="absolute z-20 flex gap-2 justify-center" style={{ bottom: "82px", left: 0, right: 0 }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p.minutes)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                selectedMinutes === p.minutes && !customMinutes
                  ? "bg-white text-slate-700 shadow-md"
                  : "bg-black/30 backdrop-blur text-white/75 hover:bg-black/45"
              }`}
            >
              {p.label}
            </button>
          ))}
          <input
            type="number" min={1} max={300} value={customMinutes}
            onChange={(e) => handleCustom(e.target.value)}
            placeholder="自由"
            className="w-14 px-2 py-1.5 rounded-full text-sm bg-black/30 backdrop-blur text-white text-center placeholder-white/35 focus:outline-none focus:bg-black/45"
          />
        </div>
      )}

      {/* ════════════════════════════════════
          ── 下部3ボタン（浮かせ、パネルなし） ──
          ════════════════════════════════════ */}
      <div className="absolute bottom-7 left-4 right-4 z-20 flex gap-2.5 items-center">

        {/* 左: 一時停止 / 再開 */}
        <button
          onClick={started ? handlePause : undefined}
          disabled={!started}
          className={`flex-1 py-3.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            started
              ? "bg-slate-800/65 backdrop-blur-md hover:bg-slate-700/70 text-white shadow-lg"
              : "bg-slate-800/30 backdrop-blur text-white/25 cursor-default"
          }`}
        >
          {started
            ? running
              ? <><Pause size={14} />一時停止</>
              : <><Play size={14} />再開</>
            : <><Pause size={14} />一時停止</>}
        </button>

        {/* 中央: 集中スタート！/ 終了する（ピンク、メインCTA） */}
        {!started ? (
          <button
            onClick={handleStart}
            className="flex-[1.4] py-4 bg-rose-400 hover:bg-rose-300 active:scale-[0.97] text-white rounded-full font-black text-base shadow-2xl shadow-rose-900/40 transition-all flex items-center justify-center gap-2"
          >
            <Play size={17} fill="white" strokeWidth={0} />
            集中スタート！
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="flex-[1.4] py-4 bg-rose-400/75 hover:bg-rose-400 active:scale-[0.97] text-white rounded-full font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Square size={14} fill="white" strokeWidth={0} />
            終了する
          </button>
        )}

        {/* 右: 旅ノート */}
        <button
          onClick={onViewNotes ?? onExit}
          className="flex-1 py-3.5 bg-slate-800/65 backdrop-blur-md hover:bg-slate-700/70 text-white/80 hover:text-white rounded-full text-sm font-bold transition-all flex items-center justify-center gap-1 shadow-lg"
        >
          旅ノート
          <span className="text-xs">→</span>
        </button>
      </div>
    </div>
  );
}
