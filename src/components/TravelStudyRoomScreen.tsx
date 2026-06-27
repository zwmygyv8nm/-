"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pause, Play, Square, X, MapPin } from "lucide-react";

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

const DOT_COUNT = 12;

function Barcode() {
  const pattern = [3,1,2,1,3,2,1,3,1,2,1,2,3,1,1,2,3,1,2,1,3,1,2,2,1,3,1,2,1,3];
  return (
    <div className="flex items-end gap-[1.5px] h-5">
      {pattern.map((w, i) => (
        <div
          key={i}
          className="bg-stone-500/60 rounded-[0.5px]"
          style={{ width: w === 1 ? 1.5 : w === 2 ? 2.5 : 3.5, height: i % 5 === 0 ? "100%" : "72%" }}
        />
      ))}
    </div>
  );
}

function Stamp() {
  return (
    <div className="relative w-11 h-11 shrink-0 opacity-70">
      <div className="absolute inset-0 rounded-full border-[2.5px] border-rose-600" />
      <div className="absolute inset-[4px] rounded-full border border-rose-500" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-rose-600 text-[6px] font-black tracking-[0.15em]">STUDY</span>
        <span className="text-rose-600 text-[13px] leading-none">✈</span>
        <span className="text-rose-600 text-[6px] font-black tracking-[0.12em]">TRIP</span>
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
  const minsPerDot  = locationRequiredMinutes / DOT_COUNT;
  const filledDots  = Math.min(DOT_COUNT, Math.floor(totalStayed / minsPerDot));
  const emoji       = CHAR_EMOJI[characterId] ?? "🐱";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">

      {/* ── 背景: 旅先画像 or グラデーション ── */}
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
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_18%_72%,rgba(129,230,217,0.18),transparent)]" />
        </div>
      )}

      {/* ビネット: 上部と薄い下部のみ */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent via-45% to-black/25 pointer-events-none" />

      {/* ── 退出ボタン (常に上右) ── */}
      <button
        onClick={onExit}
        className="absolute top-4 right-4 z-30 flex items-center gap-1 text-white/65 hover:text-white transition-colors text-xs bg-black/25 backdrop-blur-sm rounded-full px-3 py-1.5"
      >
        <X size={12} />
        退出
      </button>

      {/* ════════════════════════════════
          ── 開始前の画面 ──
          ════════════════════════════════ */}
      {!started && (
        <>
          {/* 中央：旅先名 ヒーロー表示 */}
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
            style={{ paddingBottom: "220px" }}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin size={11} className="text-white/55" />
              <p className="text-white/60 text-xs tracking-[0.38em] font-medium uppercase">{locationArea}</p>
            </div>
            <h1
              className="text-white text-5xl font-black tracking-wide drop-shadow-2xl"
              style={{ textShadow: "0 2px 28px rgba(0,0,0,0.65)" }}
            >
              {locationName}
            </h1>
            <p className="text-white/50 text-sm mt-3 max-w-[230px] text-center leading-relaxed drop-shadow-lg">
              {locationDescription}
            </p>
          </div>

          {/* 下部パネル: プリセット + 出発ボタン */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <div className="bg-slate-900/82 backdrop-blur-2xl rounded-t-3xl px-4 pt-5 pb-8 ring-1 ring-white/8 shadow-2xl">
              {/* 時間プリセット */}
              <div className="flex gap-2 justify-center mb-5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handlePreset(p.minutes)}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                      selectedMinutes === p.minutes && !customMinutes
                        ? "bg-white text-slate-800 shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/18"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <input
                  type="number" min={1} max={300} value={customMinutes}
                  onChange={(e) => handleCustom(e.target.value)}
                  placeholder="自由"
                  className="w-14 px-2 py-2 rounded-full text-sm bg-white/10 text-white text-center placeholder-white/30 focus:outline-none focus:bg-white/18"
                />
              </div>

              {/* 出発するボタン — メインCTA */}
              <button
                onClick={handleStart}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/50 transition-all flex items-center justify-center gap-2.5"
              >
                <span className="text-xl leading-none">✈</span>
                出発する
              </button>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════
          ── 勉強中の画面 ──
          ════════════════════════════════ */}
      {started && (
        <>
          {/* 上部: タイマー (左) + 旅先＋進行 (右) */}
          <div className="absolute top-4 left-4 right-16 z-20 flex items-start gap-2">

            {/* タイマーカード */}
            <div className="bg-slate-900/72 backdrop-blur-xl rounded-2xl px-4 pt-3 pb-3 ring-1 ring-white/10 shadow-xl shrink-0">
              <p className="text-white/35 text-[9px] tracking-[0.15em] font-bold uppercase mb-0.5">タイマー</p>
              <p className={`text-4xl font-black tabular-nums tracking-tight leading-none ${finished ? "text-emerald-400" : "text-white"}`}>
                {finished ? "完了" : timeStr}
              </p>
              <p className="text-white/35 text-[10px] mt-1.5">
                {running ? "集中中…" : finished ? "お疲れ様！" : "停止中"}
              </p>
            </div>

            {/* 旅先 + 進行ドットカード */}
            <div className="flex-1 bg-slate-900/72 backdrop-blur-xl rounded-2xl px-3 pt-3 pb-3 ring-1 ring-white/10 shadow-xl min-w-0">
              <p className="text-white/35 text-[9px] tracking-[0.12em] font-bold uppercase mb-0.5">今日の旅先</p>
              <p className="text-white font-bold text-sm leading-tight truncate">{locationName}</p>
              {/* 進行ドット */}
              <div className="flex items-center gap-[3px] mt-2">
                {Array.from({ length: DOT_COUNT }).map((_, i) => (
                  <div key={i} className={`rounded-full transition-all duration-700 ${
                    i < filledDots
                      ? "w-3.5 h-1.5 bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.55)]"
                      : "w-2.5 h-1 bg-white/18"
                  }`} />
                ))}
              </div>
              <p className="text-white/35 text-[9px] mt-1.5 tabular-nums">
                {totalStayed}
                <span className="text-white/22"> / {locationRequiredMinutes}分滞在</span>
              </p>
            </div>
          </div>

          {/* 旅の相棒 — 左下、底パネルの上に浮かせる */}
          <div className="absolute bottom-[210px] left-4 z-20 flex items-end gap-2 pointer-events-none">
            <div className="text-4xl drop-shadow-2xl">
              {finished ? "🎉" : emoji}
            </div>
            <div className="bg-white/88 backdrop-blur-sm text-slate-700 text-[11px] font-medium px-3 py-2 rounded-2xl rounded-bl-none shadow-lg max-w-[130px] leading-snug mb-1">
              {finished
                ? "お疲れ様！\nちゃんと進んだね"
                : running
                ? TRAVEL_MESSAGES[msgIdx]
                : "一時停止中…"}
            </div>
          </div>

          {/* 下部パネル — 高さを抑える */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <div className="bg-slate-900/82 backdrop-blur-2xl rounded-t-3xl px-4 pt-4 pb-6 ring-1 ring-white/8 shadow-2xl">

              {/* 3カード横スクロール (コンパクト) */}
              <div className="flex gap-2.5 overflow-x-auto mb-3 -mx-1 px-1 pb-1 scrollbar-hide snap-x snap-mandatory">

                {/* STUDY TICKET */}
                <div className="bg-[#f5ece0] rounded-xl p-3 min-w-[148px] snap-start shrink-0 shadow ring-1 ring-stone-200/70">
                  <p className="text-[8px] font-black tracking-[0.25em] text-stone-400 mb-1.5">STUDY TICKET</p>
                  <p className="text-stone-800 font-bold text-[13px] leading-tight">
                    {locationName}&nbsp;<span className="text-stone-400 font-normal text-[11px]">行き</span>
                  </p>
                  <p className="text-stone-400 text-[10px] mt-0.5 mb-2">{selectedMinutes}分間の集中</p>
                  <div className="flex items-end justify-between">
                    <Barcode />
                    <Stamp />
                  </div>
                </div>

                {/* 今日の目標 */}
                <div className="bg-amber-50 rounded-xl p-3 min-w-[132px] snap-start shrink-0 shadow ring-1 ring-amber-100">
                  <div className="flex items-center gap-1 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <p className="text-[9px] font-bold text-amber-700 tracking-wide">今日の目標</p>
                  </div>
                  <p className="text-stone-700 text-[12px] leading-snug break-words">{goal || "（未設定）"}</p>
                  {finished && <p className="mt-2 text-emerald-600 text-[10px] font-black">✓ 達成！</p>}
                </div>

                {/* 旅メモ */}
                <div className="bg-sky-50 rounded-xl p-3 min-w-[148px] snap-start shrink-0 shadow ring-1 ring-sky-100">
                  <div className="flex items-center gap-1 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <p className="text-[9px] font-bold text-sky-700 tracking-wide">旅メモ</p>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{locationDescription}</p>
                </div>
              </div>

              {/* コントロールボタン */}
              <div className="flex gap-2.5">
                {/* 一時停止 / 再開 — メイン */}
                <button
                  onClick={handlePause}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/18 active:scale-[0.98] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ring-1 ring-white/12"
                >
                  {running
                    ? <><Pause size={15} />一時停止</>
                    : <><Play size={15} />再開</>}
                </button>
                {/* 終了 — 補助 */}
                <button
                  onClick={handleComplete}
                  className="px-5 py-3 bg-white/5 hover:bg-white/12 active:scale-[0.98] text-white/50 hover:text-white/80 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-1.5 ring-1 ring-white/8"
                >
                  <Square size={13} fill="currentColor" strokeWidth={0} />
                  終了
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
