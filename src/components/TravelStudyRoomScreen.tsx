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

function TicketStamp() {
  return (
    <div className="relative w-11 h-11 opacity-75">
      <div className="absolute inset-0 rounded-full border-2 border-rose-500" />
      <div className="absolute inset-[3px] rounded-full border border-rose-400" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-rose-500 text-[5px] font-black tracking-[0.15em]">MY STUDY</span>
        <span className="text-rose-500 text-sm leading-none">✈</span>
        <span className="text-rose-500 text-[5px] font-black tracking-[0.1em]">JOURNEY</span>
      </div>
    </div>
  );
}

function Barcode() {
  const pattern = [3,1,2,1,3,2,1,3,1,2,1,2,3,1,1,2,3,1,2,1];
  return (
    <div className="flex items-end gap-[1.5px] h-4">
      {pattern.map((w, i) => (
        <div key={i} className="bg-slate-400/55 rounded-[0.5px]"
          style={{ width: w === 1 ? 1.5 : w === 2 ? 2.5 : 3.5, height: i % 4 === 0 ? "100%" : "70%" }} />
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
  const [isPortrait,      setIsPortrait]      = useState(false);
  const startSecondsRef = useRef(25 * 60);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── 縦横検知 ── */
  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth * 0.8);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── タイマー ── */
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

  const handleStart    = () => { startSecondsRef.current = secondsLeft; setStarted(true); setRunning(true); };
  const handlePause    = () => setRunning(r => !r);
  const handleComplete = useCallback(() => {
    onComplete(Math.max(1, Math.round((startSecondsRef.current - secondsLeft) / 60)));
  }, [secondsLeft, onComplete]);
  const handlePreset   = (m: number) => { if (started) return; setSelectedMinutes(m); setSecondsLeft(m * 60); setCustomMinutes(""); };
  const handleCustom   = (val: string) => {
    if (started) return;
    setCustomMinutes(val);
    const n = parseInt(val);
    if (!isNaN(n) && n > 0 && n <= 300) { setSelectedMinutes(n); setSecondsLeft(n * 60); }
  };

  /* ── 計算値 ── */
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
  const charMsg     = finished ? "お疲れ様！\nちゃんと進んだね"
    : running  ? TRAVEL_MESSAGES[msgIdx]
    : started  ? "一時停止中…"
    : "今日も\n一緒にがんばろう！";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">

      {/* ── 背景: 旅先全画面画像 ── */}
      {locationBgImage ? (
        <img className="absolute inset-0 w-full h-full object-cover" src={locationBgImage} alt="" />
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-sky-800 to-teal-700" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_28%,rgba(99,179,237,0.38),transparent)]" />
        </div>
      )}

      {/* ビネット: 上部 + 下部のみ（中央は景色を見せる） */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent via-40% to-black/72 pointer-events-none" />

      {/* ════════════════════════════════════
          縦向き警告オーバーレイ（16:9横長前提）
          ════════════════════════════════════ */}
      {isPortrait && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/88 backdrop-blur-md">
          <p className="text-5xl mb-5">📱</p>
          <p className="text-white text-xl font-bold mb-2">横向きにして使おう</p>
          <p className="text-white/50 text-sm text-center px-8">
            全国旅行モードは横長（16:9）画面用です。<br />
            スマホは横向きにしてください。
          </p>
        </div>
      )}

      {/* ── 退出ボタン (常に右上) ── */}
      <button
        onClick={onExit}
        className="absolute top-3 right-3 z-30 text-white/55 hover:text-white bg-black/22 backdrop-blur-sm rounded-full p-2 transition-colors"
      >
        <X size={14} />
      </button>

      {/* ════════════════════════════════════
          上部エリア（16:9基準 上18%）
          ════════════════════════════════════ */}

      {/* 左上: 旅先カード */}
      <div className="absolute top-4 left-4 z-20" style={{ maxWidth: "22%" }}>
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-3 py-2.5 ring-1 ring-white/12 shadow-xl">
          <p className="text-white/45 text-[9px] tracking-[0.12em] flex items-center gap-0.5 mb-0.5">
            <MapPin size={8} className="shrink-0" /> 今日の旅先
          </p>
          <p className="text-white font-bold text-base leading-tight">{locationName}</p>
          <p className="text-white/35 text-[10px] mt-0.5">{locationArea}</p>
        </div>
      </div>

      {/* 中央上: タイマー + バー (右に) + ドット */}
      <div className="absolute top-4 left-0 right-0 z-20 flex flex-col items-center pointer-events-none">
        <p className="text-white/45 text-[10px] tracking-[0.25em] mb-2">◉ 集中タイム</p>
        <div className="flex items-center gap-4">
          <p
            className={`font-black tabular-nums tracking-tight leading-none drop-shadow-2xl ${
              finished ? "text-emerald-400" : "text-white"
            }`}
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", textShadow: "0 2px 28px rgba(0,0,0,0.55)" }}
          >
            {finished ? "完了！" : timeStr}
          </p>
          {/* 右: バー + ドット */}
          <div className="flex flex-col gap-1.5">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden" style={{ width: "clamp(100px, 12vw, 180px)" }}>
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${stayPct}%` }}
              />
            </div>
            <div className="flex items-center gap-[3px]">
              {Array.from({ length: DOT_COUNT }).map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-700 ${
                  i < filledDots
                    ? "w-3 h-1.5 bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.55)]"
                    : "w-2 h-1 bg-white/25"
                }`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 右上: 滞在時間カード */}
      <div className="absolute top-4 right-10 z-20" style={{ maxWidth: "22%" }}>
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-3 py-2.5 ring-1 ring-white/12 shadow-xl text-right">
          <p className="text-white/45 text-[9px] tracking-[0.12em] mb-0.5">滞在時間</p>
          <p className="text-white font-bold text-xl tabular-nums leading-tight">
            {totalStayed}
            <span className="text-white/40 font-normal text-sm"> / {locationRequiredMinutes}分</span>
          </p>
          <p className="text-emerald-400 text-[10px] mt-0.5">
            {remaining === 0 ? "到着完了！🎉" : `あと${remaining}分で次の旅先へ！`}
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════
          中央浮かびカード（景色エリア）
          ════════════════════════════════════ */}

      {/* 旅メモ — 左 27%付近 */}
      <div className="absolute left-6 z-20" style={{ top: "27%" }}>
        <div
          className="bg-white/93 rounded-xl p-3 shadow-2xl ring-1 ring-black/5"
          style={{ transform: "rotate(-2deg)", width: "clamp(130px, 14vw, 190px)" }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-slate-600 text-[10px] font-bold tracking-wide">旅メモ</p>
            <span className="text-sm leading-none">📷</span>
          </div>
          <p className="text-slate-600 leading-relaxed" style={{ fontSize: "clamp(10px, 1.1vw, 13px)" }}>
            {locationDescription}
          </p>
          <p className="text-rose-400 text-sm mt-2">🌸</p>
        </div>
      </div>

      {/* STUDY TICKET — 右 24%付近 */}
      <div className="absolute right-6 z-20" style={{ top: "24%" }}>
        <div
          className="bg-white/93 rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/5"
          style={{ transform: "rotate(1.5deg)", width: "clamp(140px, 15vw, 200px)" }}
        >
          <div className="bg-rose-400 px-3 py-1.5">
            <p className="text-white font-black tracking-[0.22em]" style={{ fontSize: "clamp(9px, 1vw, 12px)" }}>
              STUDY TICKET
            </p>
          </div>
          <div className="px-3 pt-2.5 pb-3">
            <p className="text-slate-700 font-bold leading-tight" style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}>
              {locationName} 行き
            </p>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: "clamp(9px, 0.9vw, 11px)" }}>{locationArea}</p>
            <div className="h-px bg-slate-200/70 my-2" />
            <p className="text-slate-500" style={{ fontSize: "clamp(9px, 0.9vw, 11px)" }}>出発日：今日</p>
            <p className="text-slate-500 mt-0.5" style={{ fontSize: "clamp(9px, 0.9vw, 11px)" }}>
              目的：{selectedMinutes}分集中すること！
            </p>
            <div className="flex items-end justify-between mt-2">
              <Barcode />
              <TicketStamp />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          下部デスクエリア（16:9基準 下35%）
          左ゾーン: キャラ + 今日の目標
          右ゾーン: プリセット + ボタン
          ════════════════════════════════════ */}

      {/* キャラ + 今日の目標ノート — 左下 */}
      <div
        className="absolute z-20 flex items-end gap-3"
        style={{ bottom: "22%", left: "5%" }}
      >
        {/* キャラ (旅の相棒) */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div
            className="bg-white/90 backdrop-blur-sm text-slate-700 font-medium rounded-2xl rounded-bl-none shadow-lg text-center whitespace-pre-line leading-snug"
            style={{ fontSize: "clamp(10px, 1.1vw, 13px)", padding: "6px 10px", maxWidth: "clamp(80px, 9vw, 120px)" }}
          >
            {charMsg}
          </div>
          <div className="drop-shadow-2xl" style={{ fontSize: "clamp(2rem, 3.5vw, 3.5rem)" }}>
            {finished ? "🎉" : emoji}
          </div>
        </div>

        {/* 今日の目標ノート */}
        <div
          className="bg-amber-50/95 rounded-2xl shadow-2xl ring-1 ring-amber-200/60"
          style={{
            transform: "rotate(0.5deg)",
            padding: "clamp(10px, 1.2vw, 16px)",
            width: "clamp(160px, 18vw, 280px)",
          }}
        >
          <p className="text-amber-700 font-black flex items-center gap-1 mb-2"
            style={{ fontSize: "clamp(10px, 1.1vw, 13px)" }}>
            今日の目標 <span>⭐</span>
          </p>
          <p className="text-slate-600 leading-snug break-words"
            style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}>
            {goal || "（目標を入力しよう）"}
          </p>
          {finished && (
            <p className="mt-2 text-emerald-600 font-black" style={{ fontSize: "clamp(9px, 1vw, 12px)" }}>
              ✓ 達成！
            </p>
          )}
        </div>
      </div>

      {/* 時間プリセット（スタート前のみ）— 右ゾーン上段 */}
      {!started && (
        <div
          className="absolute z-20 flex gap-2 items-center"
          style={{ bottom: "21%", left: "38%", right: "5%" }}
        >
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p.minutes)}
              className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                selectedMinutes === p.minutes && !customMinutes
                  ? "bg-white text-slate-700 shadow-md"
                  : "bg-black/30 backdrop-blur text-white/75 hover:bg-black/45"
              }`}
              style={{ fontSize: "clamp(12px, 1.1vw, 15px)" }}
            >
              {p.label}
            </button>
          ))}
          <input
            type="number" min={1} max={300} value={customMinutes}
            onChange={(e) => handleCustom(e.target.value)}
            placeholder="自由"
            className="rounded-full bg-black/30 backdrop-blur text-white text-center placeholder-white/35 focus:outline-none focus:bg-black/45"
            style={{ width: "clamp(48px, 5vw, 64px)", padding: "6px 8px", fontSize: "clamp(12px, 1.1vw, 14px)" }}
          />
        </div>
      )}

      {/* 3ボタン — 右ゾーン下段 */}
      <div
        className="absolute z-20 flex gap-3 items-center"
        style={{ bottom: "6%", left: "36%", right: "5%" }}
      >
        {/* 左: 一時停止 / 再開 */}
        <button
          onClick={started ? handlePause : undefined}
          disabled={!started}
          className={`flex-1 rounded-full font-bold transition-all flex items-center justify-center gap-1.5 ${
            started
              ? "bg-slate-800/65 backdrop-blur-md hover:bg-slate-700/70 text-white shadow-lg"
              : "bg-slate-800/30 backdrop-blur text-white/25 cursor-default"
          }`}
          style={{ padding: "clamp(10px, 1.2vw, 14px) 0", fontSize: "clamp(12px, 1.2vw, 15px)" }}
        >
          {started
            ? running ? <><Pause size={14} />一時停止</> : <><Play size={14} />再開</>
            : <><Pause size={14} />一時停止</>}
        </button>

        {/* 中央: 集中スタート！/ 終了する (ピンク・メインCTA) */}
        <button
          onClick={!started ? handleStart : handleComplete}
          className={`flex-[1.6] rounded-full font-black text-white shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-2 ${
            !started
              ? "bg-rose-400 hover:bg-rose-300 shadow-rose-900/40"
              : "bg-rose-400/80 hover:bg-rose-400"
          }`}
          style={{ padding: "clamp(12px, 1.4vw, 16px) 0", fontSize: "clamp(13px, 1.3vw, 16px)" }}
        >
          {!started
            ? <><Play size={16} fill="white" strokeWidth={0} />集中スタート！</>
            : <><Square size={14} fill="white" strokeWidth={0} />終了する</>}
        </button>

        {/* 右: 旅ノート */}
        <button
          onClick={onViewNotes ?? onExit}
          className="flex-1 bg-slate-800/65 backdrop-blur-md hover:bg-slate-700/70 text-white/80 hover:text-white rounded-full font-bold transition-all shadow-lg flex items-center justify-center gap-1"
          style={{ padding: "clamp(10px, 1.2vw, 14px) 0", fontSize: "clamp(12px, 1.2vw, 15px)" }}
        >
          旅ノート <span className="text-xs">→</span>
        </button>
      </div>
    </div>
  );
}
