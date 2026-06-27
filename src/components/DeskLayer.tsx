"use client";

import IllustrationImg from "./IllustrationImg";
import { characterIllustration, deskItemIllustration } from "../lib/illustrations";

const CHAR_EMOJI: Record<string, string> = {
  neko:  "🐱",
  shiro: "🐰",
  kuma:  "🐻",
};

function WaterBottle() {
  const css = (
    <div className="flex flex-col items-center">
      <div className="rounded-t-sm" style={{ width: 18, height: 8, background: "linear-gradient(180deg,#94d2e8,#5bb8d4)" }} />
      <div className="rounded-b-lg relative overflow-hidden flex items-center justify-center"
        style={{ width: 22, height: 52, background: "linear-gradient(160deg,rgba(180,230,245,0.85),rgba(130,200,225,0.7))" }}>
        <p className="text-[5px] text-sky-800/70 font-black tracking-tight rotate-90 leading-none select-none whitespace-nowrap">MY STUDY ROOM</p>
      </div>
      <div className="rounded-b" style={{ width: 24, height: 4, background: "rgba(130,200,225,0.5)" }} />
    </div>
  );
  return (
    <div className="absolute z-20 flex flex-col items-center" style={{ left: "2%", bottom: "6%" }}>
      <IllustrationImg
        src={deskItemIllustration("water-bottle")}
        alt="水筒"
        style={{ height: "clamp(70px, 9vw, 130px)", width: "auto", objectFit: "contain" }}
        fallback={css}
      />
    </div>
  );
}

function MascotOnDesk({ characterId, emoji, charMsg }: { characterId: string; emoji: string; charMsg: string }) {
  const charFallback = (
    <div className="drop-shadow-lg" style={{ fontSize: "clamp(2.2rem, 4vw, 4rem)" }}>{emoji}</div>
  );
  return (
    <div className="absolute z-20 flex flex-col items-center" style={{ left: "14%", bottom: "6%" }}>
      <div
        className="bg-white/90 rounded-2xl rounded-bl-none shadow-lg text-center text-slate-700 font-medium leading-snug whitespace-pre-line mb-2"
        style={{ fontSize: "clamp(9px, 1vw, 13px)", padding: "6px 10px", maxWidth: "clamp(80px, 9vw, 120px)" }}
      >
        {charMsg}
      </div>
      <IllustrationImg
        src={characterIllustration(characterId)}
        alt={characterId}
        style={{ height: "clamp(60px, 8vw, 110px)", width: "auto", objectFit: "contain" }}
        fallback={charFallback}
      />
    </div>
  );
}

function StudyNotebook({ goal, finished }: { goal: string; finished: boolean }) {
  const css = (
    <div className="flex drop-shadow-2xl">
      <div className="relative w-5 rounded-l-xl bg-amber-400/80 flex flex-col items-center justify-evenly py-3 shrink-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-3.5 h-3.5 rounded-full border-2 border-amber-600/60 bg-amber-200/50" />
        ))}
      </div>
      <div className="bg-amber-50/98 rounded-r-2xl flex flex-col"
        style={{ padding: "clamp(10px,1.2vw,18px) clamp(12px,1.4vw,22px)", width: "clamp(200px, 24vw, 360px)" }}>
        <p className="text-amber-700 font-black flex items-center gap-1 mb-3" style={{ fontSize: "clamp(10px, 1.1vw, 14px)" }}>
          今日の目標 <span>⭐</span>
        </p>
        <p className="text-slate-700 leading-snug break-words font-medium" style={{ fontSize: "clamp(11px, 1.2vw, 16px)" }}>
          {goal || "（目標を入力しよう）"}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-px bg-amber-200" />)}
        </div>
        <p className="mt-3 text-amber-500/70 italic" style={{ fontSize: "clamp(9px, 0.9vw, 12px)" }}>
          {finished ? "✓ 達成！よくがんばった🎉" : "コツコツいくよ～！"}
        </p>
      </div>
    </div>
  );
  return (
    <div className="absolute z-20" style={{ bottom: "4%", left: "50%", transform: "translateX(-50%)" }}>
      <IllustrationImg
        src={deskItemIllustration("notebook")}
        alt="ノート"
        style={{ height: "clamp(120px, 16vw, 220px)", width: "auto", objectFit: "contain" }}
        fallback={css}
      />
    </div>
  );
}

function DeskPen() {
  const css = (
    <div style={{ transform: "rotate(-30deg)", transformOrigin: "center center" }}>
      <div className="rounded-t-sm mx-auto" style={{ width: 7, height: 14, background: "linear-gradient(180deg,#475569,#334155)" }} />
      <div style={{ width: 7, height: 60, background: "linear-gradient(180deg,#1e3a5f,#1e40af,#1e3a5f)" }} />
      <div style={{ width: 7, height: 10, background: "linear-gradient(180deg,#1e40af,#1e3a5f)", opacity: 0.7 }} />
      <div style={{ width: 0, height: 0, borderLeft: "3.5px solid transparent", borderRight: "3.5px solid transparent", borderTop: "8px solid #c0c0c0" }} />
    </div>
  );
  return (
    <div className="absolute z-20" style={{ left: "62%", bottom: "8%" }}>
      <IllustrationImg
        src={deskItemIllustration("pen")}
        alt="ペン"
        style={{ height: "clamp(80px, 10vw, 140px)", width: "auto", objectFit: "contain" }}
        fallback={css}
      />
    </div>
  );
}

function DeskEraser() {
  const css = (
    <div className="rounded shadow" style={{ transform: "rotate(-5deg)" }}>
      <div className="rounded flex overflow-hidden" style={{ width: 44, height: 18 }}>
        <div className="flex-1" style={{ background: "linear-gradient(180deg,#f9a8d4,#fb7185)" }} />
        <div style={{ width: 12, background: "linear-gradient(180deg,#e2e8f0,#cbd5e1)" }} />
      </div>
    </div>
  );
  return (
    <div className="absolute z-20" style={{ left: "70%", bottom: "6%" }}>
      <IllustrationImg
        src={deskItemIllustration("eraser")}
        alt="消しゴム"
        style={{ height: "clamp(28px, 3.5vw, 50px)", width: "auto", objectFit: "contain" }}
        fallback={css}
      />
    </div>
  );
}

function DeskPencilCase() {
  const css = (
    <div className="rounded-2xl shadow-xl relative overflow-hidden flex items-center justify-center"
      style={{ width: "clamp(80px, 10vw, 140px)", height: "clamp(36px, 4.5vw, 60px)", background: "linear-gradient(150deg,#fde68a,#fcd34d,#fbbf24)" }}>
      <p className="text-amber-800/80 font-black" style={{ fontSize: "clamp(8px, 0.9vw, 12px)" }}>Keep going!</p>
    </div>
  );
  return (
    <div className="absolute z-20" style={{ left: "77%", bottom: "5%" }}>
      <IllustrationImg
        src={deskItemIllustration("pencil-case")}
        alt="ペンケース"
        style={{ height: "clamp(50px, 6vw, 85px)", width: "auto", objectFit: "contain" }}
        fallback={css}
      />
    </div>
  );
}

function DeskStickyNote() {
  const css = (
    <div className="flex items-center justify-center shadow-lg"
      style={{
        width: "clamp(70px, 8vw, 110px)", height: "clamp(70px, 8vw, 110px)",
        background: "linear-gradient(135deg,#fda4af,#fb7185)",
        borderRadius: 4, transform: "rotate(2deg)",
      }}>
      <p className="text-white font-bold text-center leading-snug" style={{ fontSize: "clamp(8px, 0.8vw, 11px)", padding: "8px" }}>
        できたことを<br />つみあげて<br />いこう！☺
      </p>
    </div>
  );
  return (
    <div className="absolute z-20" style={{ left: "87%", bottom: "18%" }}>
      <IllustrationImg
        src={deskItemIllustration("sticky-note")}
        alt="付箋"
        style={{ height: "clamp(70px, 8vw, 110px)", width: "auto", objectFit: "contain" }}
        fallback={css}
      />
    </div>
  );
}

interface DeskLayerProps {
  goal: string;
  characterId: string;
  charMsg: string;
  finished: boolean;
}

export default function DeskLayer({ goal, characterId, charMsg, finished }: DeskLayerProps) {
  const emoji = CHAR_EMOJI[characterId] ?? "🐱";
  return (
    <>
      <WaterBottle />
      <MascotOnDesk characterId={characterId} emoji={finished ? "🎉" : emoji} charMsg={charMsg} />
      <StudyNotebook goal={goal} finished={finished} />
      <DeskPen />
      <DeskEraser />
      <DeskPencilCase />
      <DeskStickyNote />
    </>
  );
}
