"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pause, Play, Square, X } from "lucide-react";

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
    <div className="relative w-10 h-10 opacity-70">
      <div className="absolute inset-0 rounded-full border-2 border-rose-400" />
      <div className="absolute inset-[3px] rounded-full border border-rose-300" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-rose-400 text-[5px] font-black tracking-[0.12em]">MY STUDY</span>
        <span className="text-rose-400 text-xs leading-none">✈</span>
        <span className="text-rose-400 text-[5px] font-black tracking-[0.08em]">JOURNEY</span>
      </div>
    </div>
  );
}

function Barcode() {
  const pattern = [3,1,2,1,3,2,1,3,1,2,1,2,3,1,1,2,3,1,2,1];
  return (
    <div className="flex items-end gap-[1.5px] h-3.5">
      {pattern.map((w, i) => (
        <div key={i} className="bg-slate-300/70 rounded-[0.5px]"
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

  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth * 0.8);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
  const charMsg     = finished ? "お疲れ様！\nちゃんと進んだね"
    : running  ? TRAVEL_MESSAGES[msgIdx]
    : started  ? "一時停止中…"
    : "今日も\n一緒にがんばろう！";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">

      {/* 背景 */}
      {locationBgImage ? (
        <img className="absolute inset-0 w-full h-full object-cover" src={locationBgImage} alt="" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-sky-800 to-teal-700" />
      )}

      {/* 上部だけ暗くする */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent via-35% to-transparent pointer-events-none" />

      {/* 縦向き警告 */}
      {isPortrait && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/88 backdrop-blur-md">
          <p className="text-5xl mb-5">📱</p>
          <p className="text-white text-xl font-bold mb-2">横向きにして使おう</p>
          <p className="text-white/50 text-sm text-center px-8">
            全国旅行モードは横長（16:9）画面用です。<br />スマホは横向きにしてください。
          </p>
        </div>
      )}

      {/* 退出 */}
      <button onClick={onExit} className="absolute top-3 right-3 z-30 text-white/55 hover:text-white bg-black/22 backdrop-blur-sm rounded-full p-2 transition-colors">
        <X size={14} />
      </button>

      {/* ── 左上: 今日の旅先カード ── */}
      <div className="absolute top-4 left-4 z-20" style={{ width: "clamp(160px, 18vw, 260px)" }}>
        <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "rgba(60,40,20,0.72)", backdropFilter: "blur(16px)" }}>
          <div className="px-3 pt-2.5 pb-3 relative">
            {/* Japan map placeholder – replaced by image when available */}
            <div className="absolute top-2 right-2 text-white/20" style={{ fontSize: "clamp(28px, 4vw, 52px)", lineHeight: 1 }}>🗾</div>
            <p className="text-white/50 text-[9px] tracking-[0.15em] flex items-center gap-1 mb-1">
              <span>📍</span> 今日の旅先
            </p>
            <p className="text-white font-black leading-tight" style={{ fontSize: "clamp(14px, 1.6vw, 22px)" }}>{locationName}</p>
            <p className="text-white/40 mt-0.5" style={{ fontSize: "clamp(9px, 0.9vw, 12px)" }}>{locationArea}</p>
          </div>
        </div>
      </div>

      {/* ── 中央上: タイマー + 進行バー (オリジナルのまま) ── */}
      <div className="absolute top-4 left-0 right-0 z-20 flex flex-col items-center pointer-events-none">
        <p className="text-white/50 text-[10px] tracking-[0.25em] mb-2">◉ 集中タイム</p>
        <div className="flex items-center gap-4">
          <p
            className={`font-black tabular-nums tracking-tight leading-none drop-shadow-2xl ${finished ? "text-emerald-400" : "text-white"}`}
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", textShadow: "0 2px 28px rgba(0,0,0,0.55)" }}
          >
            {finished ? "完了！" : timeStr}
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden" style={{ width: "clamp(100px, 12vw, 180px)" }}>
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${stayPct}%` }} />
            </div>
            <div className="flex items-center gap-[3px]">
              {Array.from({ length: DOT_COUNT }).map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-700 ${
                  i < filledDots ? "w-3 h-1.5 bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.55)]" : "w-2 h-1 bg-white/25"
                }`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 右上: 滞在時間カード ── */}
      <div className="absolute top-4 right-10 z-20" style={{ width: "clamp(150px, 17vw, 240px)" }}>
        <div className="rounded-2xl shadow-xl px-3 py-2.5" style={{ background: "rgba(255,252,245,0.82)", backdropFilter: "blur(16px)" }}>
          <p className="text-stone-400 text-[9px] tracking-[0.12em] mb-1">滞在時間</p>
          <div className="flex items-end justify-between">
            <p className="text-stone-700 font-black tabular-nums leading-tight" style={{ fontSize: "clamp(20px, 2.4vw, 34px)" }}>
              {totalStayed}
              <span className="text-stone-400 font-normal" style={{ fontSize: "clamp(11px, 1.1vw, 15px)" }}> / {locationRequiredMinutes}分</span>
            </p>
            <span style={{ fontSize: "clamp(16px, 2vw, 26px)" }}>🚌</span>
          </div>
          <p className="text-emerald-500 font-bold mt-1" style={{ fontSize: "clamp(9px, 0.9vw, 12px)" }}>
            {remaining === 0 ? "到着完了！🎉" : `あと${remaining}分で次の旅先へ！`}
          </p>
        </div>
      </div>

      {/* ── 旅メモカード (左中) ── */}
      <div className="absolute left-5 z-20" style={{ top: "26%" }}>
        <div className="relative rounded-2xl shadow-2xl" style={{ width: "clamp(130px, 14vw, 195px)", background: "rgba(255,253,248,0.93)", backdropFilter: "blur(8px)" }}>
          {/* マスキングテープ風 */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-sm opacity-60"
            style={{ width: "45%", height: 12, background: "linear-gradient(90deg,#fcd34d,#fbbf24)" }} />
          <div className="px-3 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-stone-500 text-[10px] font-bold tracking-wide">旅メモ</p>
              <span className="text-base leading-none">📷</span>
            </div>
            <p className="text-stone-600 leading-relaxed" style={{ fontSize: "clamp(10px, 1.1vw, 13px)" }}>
              {locationDescription}
            </p>
            <p className="text-rose-300 text-sm mt-2">🌸</p>
          </div>
        </div>
      </div>

      {/* ── STUDY TICKET (右中) ── */}
      <div className="absolute right-5 z-20" style={{ top: "23%" }}>
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ width: "clamp(145px, 16vw, 215px)", background: "rgba(255,253,248,0.93)", backdropFilter: "blur(8px)" }}>
          <div className="px-3 py-2" style={{ background: "#f472b6" }}>
            <p className="text-white font-black tracking-[0.2em]" style={{ fontSize: "clamp(9px, 1vw, 12px)" }}>STUDY TICKET</p>
          </div>
          <div className="px-3 pt-2.5 pb-3">
            <p className="text-stone-700 font-bold leading-tight" style={{ fontSize: "clamp(12px, 1.3vw, 16px)" }}>
              {locationName} 行き
            </p>
            <p className="text-stone-400 mt-0.5" style={{ fontSize: "clamp(9px, 0.9vw, 11px)" }}>{locationArea}</p>
            <div className="h-px bg-stone-200 my-2" />
            <p className="text-stone-500" style={{ fontSize: "clamp(9px, 0.9vw, 11px)" }}>出発日：今日</p>
            <p className="text-stone-500 mt-0.5" style={{ fontSize: "clamp(9px, 0.9vw, 11px)" }}>
              目的：{selectedMinutes}分集中すること！
            </p>
            <div className="flex items-end justify-between mt-2.5">
              <Barcode />
              <TicketStamp />
            </div>
          </div>
        </div>
      </div>

      {/* ── 時間プリセット（スタート前のみ、中央下） ── */}
      {!started && (
        <div className="absolute z-20 flex gap-2 items-center" style={{ bottom: "20%", left: "50%", transform: "translateX(-50%)" }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p.minutes)}
              className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                selectedMinutes === p.minutes && !customMinutes
                  ? "bg-white text-stone-700 shadow-md"
                  : "bg-black/25 backdrop-blur text-white/75 hover:bg-black/40"
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
            className="rounded-full bg-black/25 backdrop-blur text-white text-center placeholder-white/35 focus:outline-none focus:bg-black/40"
            style={{ width: "clamp(48px, 5vw, 64px)", padding: "6px 8px", fontSize: "clamp(12px, 1.1vw, 14px)" }}
          />
        </div>
      )}

      {/* ── 3ボタン（中央下部） ── */}
      <div className="absolute z-20 flex gap-3 items-center" style={{ bottom: "4%", left: "20%", right: "20%" }}>

        <button
          onClick={started ? handlePause : undefined}
          disabled={!started}
          className={`flex-1 rounded-full font-bold transition-all flex items-center justify-center gap-1.5 ${
            started
              ? "bg-white/20 backdrop-blur-md hover:bg-white/30 text-white shadow-lg border border-white/20"
              : "bg-white/10 backdrop-blur text-white/30 cursor-default border border-white/10"
          }`}
          style={{ padding: "clamp(11px, 1.3vw, 15px) 0", fontSize: "clamp(12px, 1.2vw, 16px)" }}
        >
          {started
            ? running ? <><Pause size={14} />一時停止</> : <><Play size={14} />再開</>
            : <><Pause size={14} />一時停止</>}
        </button>

        <button
          onClick={!started ? handleStart : handleComplete}
          className={`flex-[1.5] rounded-full font-black text-white shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-2 ${
            !started ? "bg-rose-400 hover:bg-rose-300" : "bg-rose-400/85 hover:bg-rose-400"
          }`}
          style={{ padding: "clamp(13px, 1.5vw, 17px) 0", fontSize: "clamp(13px, 1.3vw, 17px)" }}
        >
          {!started
            ? <><Play size={16} fill="white" strokeWidth={0} />集中スタート！</>
            : <><Square size={14} fill="white" strokeWidth={0} />終了する</>}
        </button>

        <button
          onClick={onViewNotes ?? onExit}
          className="flex-1 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white/85 hover:text-white rounded-full font-bold transition-all shadow-lg flex items-center justify-center gap-1 border border-white/20"
          style={{ padding: "clamp(11px, 1.3vw, 15px) 0", fontSize: "clamp(12px, 1.2vw, 16px)" }}
        >
          →　旅ノート
        </button>
      </div>
    </div>
  );
}
