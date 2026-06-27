"use client";

import IllustrationImg from "./IllustrationImg";
import { characterIllustration, deskItemIllustration } from "../lib/illustrations";

const CHAR_EMOJI: Record<string, string> = {
  neko:  "🐱",
  shiro: "🐰",
  kuma:  "🐻",
};

function WoodGrains() {
  const grains = [4, 13, 22, 31, 38, 47, 55, 63, 72, 80, 89];
  return (
    <>
      {grains.map((pct, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: `${pct}%`, width: i % 3 === 0 ? 2 : 1, background: "rgba(255,255,255,0.04)" }}
        />
      ))}
    </>
  );
}

function WaterBottle() {
  const css = (
    <div className="flex flex-col items-center">
      <div className="rounded-t-sm" style={{ width: 18, height: 8, background: "linear-gradient(180deg,#94d2e8,#5bb8d4)" }} />
      <div className="rounded-b-lg relative overflow-hidden flex items-center justify-center"
        style={{ width: 22, height: 52, background: "linear-gradient(160deg,rgba(180,230,245,0.85),rgba(130,200,225,0.7))" }}>
        <div className="absolute inset-y-2 left-1.5 w-px bg-white/40 rounded-full" />
        <p className="text-[5px] text-sky-800/70 font-black tracking-tight rotate-90 leading-none select-none whitespace-nowrap">MY STUDY ROOM</p>
      </div>
      <div className="rounded-b" style={{ width: 24, height: 4, background: "rgba(130,200,225,0.5)" }} />
    </div>
  );
  return (
    <div className="absolute z-[15] flex flex-col items-center" style={{ left: "2.5%", bottom: "32%" }}>
      <IllustrationImg
        src={deskItemIllustration("water-bottle")}
        alt="水筒"
        style={{ height: "clamp(60px, 7vw, 90px)", width: "auto", objectFit: "contain" }}
        fallback={css}
      />
    </div>
  );
}

function MascotOnDesk({
  characterId,
  emoji,
  charMsg,
}: {
  characterId: string;
  emoji: string;
  charMsg: string;
}) {
  const charFallback = (
    <div className="drop-shadow-lg" style={{ fontSize: "clamp(1.8rem, 3vw, 3rem)" }}>{emoji}</div>
  );
  return (
    <div className="absolute z-[15] flex flex-col items-center" style={{ left: "10%", bottom: "29%" }}>
      {/* Speech bubble */}
      <div
        className="bg-white/90 rounded-2xl rounded-bl-none shadow-lg text-center text-slate-700 font-medium leading-snug whitespace-pre-line mb-1"
        style={{ fontSize: "clamp(9px, 1vw, 12px)", padding: "5px 9px", maxWidth: "clamp(72px, 8vw, 110px)" }}
      >
        {charMsg}
      </div>
      <IllustrationImg
        src={characterIllustration(characterId)}
        alt={characterId}
        style={{ height: "clamp(60px, 7vw, 100px)", width: "auto", objectFit: "contain" }}
        fallback={charFallback}
      />
    </div>
  );
}

function StudyNotebook({ goal, finished }: { goal: string; finished: boolean }) {
  const css = (
    <div className="flex">
      {/* Spiral binding */}
      <div className="relative w-4 rounded-l-lg bg-amber-400/80 flex flex-col items-center justify-evenly py-2 shrink-0">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full border-2 border-amber-600/60 bg-amber-200/50" />
        ))}
      </div>
      {/* Body */}
      <div className="bg-amber-50/97 rounded-r-xl shadow-2xl ring-1 ring-amber-200/50 flex flex-col"
        style={{ padding: "clamp(8px,1vw,14px) clamp(10px,1.2vw,18px)", width: "clamp(160px, 18vw, 280px)" }}>
        <p className="text-amber-700 font-black flex items-center gap-1 mb-2" style={{ fontSize: "clamp(9px, 1vw, 12px)" }}>
          今日の目標 <span>⭐</span>
        </p>
        <p className="text-slate-700 leading-snug break-words font-medium" style={{ fontSize: "clamp(10px, 1.1vw, 14px)" }}>
          {goal || "（目標を入力しよう）"}
        </p>
        <div className="mt-2 flex flex-col gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-px bg-amber-300/50" />)}
        </div>
        <p className="mt-2 text-amber-500/70 italic" style={{ fontSize: "clamp(8px, 0.85vw, 11px)" }}>
          {finished ? "✓ 達成！よくがんばった🎉" : "コツコツいくよ～！"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="absolute z-[15]" style={{ bottom: "26%", left: "50%", transform: "translateX(-50%)" }}>
      <IllustrationImg
        src={deskItemIllustration("notebook")}
        alt="ノート"
        style={{ height: "clamp(100px, 12vw, 160px)", width: "auto", objectFit: "contain" }}
        fallback={css}
      />
    </div>
  );
}

function CSSPen() {
  return (
    <div className="absolute z-[15]"
      style={{ right: "33%", bottom: "30%", transform: "rotate(-8deg)", transformOrigin: "center bottom" }}>
      <div className="rounded-t-sm mx-auto" style={{ width: 7, height: 14, background: "linear-gradient(180deg,#475569,#334155)" }} />
      <div className="absolute" style={{ top: 2, right: -2, width: 3, height: 12, background: "#64748b", borderRadius: 1 }} />
      <div style={{ width: 7, height: 50, background: "linear-gradient(180deg,#1e3a5f,#1e40af,#1e3a5f)" }} />
      <div style={{ width: 7, height: 10, background: "linear-gradient(180deg,#1e40af,#1e3a5f)", opacity: 0.7 }} />
      <div style={{ width: 0, height: 0, borderLeft: "3.5px solid transparent", borderRight: "3.5px solid transparent", borderTop: "8px solid #c0c0c0" }} />
    </div>
  );
}

function DeskPen() {
  return (
    <div className="absolute z-[15]" style={{ right: "33%", bottom: "30%", transform: "rotate(-8deg)", transformOrigin: "center bottom" }}>
      <IllustrationImg
        src={deskItemIllustration("pen")}
        alt="ペン"
        style={{ height: "clamp(70px, 8vw, 110px)", width: "auto", objectFit: "contain" }}
        fallback={<CSSPen />}
      />
    </div>
  );
}

function CSSEraser() {
  return (
    <div className="rounded" style={{ transform: "rotate(-4deg)" }}>
      <div className="rounded flex overflow-hidden shadow" style={{ width: 36, height: 14 }}>
        <div className="flex-1" style={{ background: "linear-gradient(180deg,#f9a8d4,#fb7185)" }} />
        <div style={{ width: 10, background: "linear-gradient(180deg,#e2e8f0,#cbd5e1)" }} />
      </div>
      <p className="text-center text-[5px] font-black text-pink-100/90 absolute inset-0 flex items-center justify-center leading-none tracking-tight">MONO</p>
    </div>
  );
}

function DeskEraser() {
  return (
    <div className="absolute z-[15]" style={{ right: "27%", bottom: "31%" }}>
      <IllustrationImg
        src={deskItemIllustration("eraser")}
        alt="消しゴム"
        style={{ height: "clamp(24px, 3vw, 40px)", width: "auto", objectFit: "contain" }}
        fallback={<CSSEraser />}
      />
    </div>
  );
}

function CSSPencilCase() {
  return (
    <div className="rounded-2xl shadow-xl relative overflow-hidden flex flex-col items-center justify-center"
      style={{ width: "clamp(70px, 8vw, 110px)", height: "clamp(32px, 3.5vw, 48px)", background: "linear-gradient(150deg,#fde68a,#fcd34d,#fbbf24)" }}>
      <div className="absolute top-1/2 left-3 right-3 h-px bg-amber-600/30" />
      <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 8, height: 8, borderRadius: "50%", background: "#92400e", opacity: 0.5 }} />
      <p className="relative text-amber-800/80 font-black tracking-tight" style={{ fontSize: "clamp(7px, 0.8vw, 10px)" }}>Keep going!</p>
    </div>
  );
}

function DeskPencilCase() {
  return (
    <div className="absolute z-[15]" style={{ right: "7%", bottom: "31%" }}>
      <IllustrationImg
        src={deskItemIllustration("pencil-case")}
        alt="ペンケース"
        style={{ height: "clamp(40px, 5vw, 70px)", width: "auto", objectFit: "contain" }}
        fallback={<CSSPencilCase />}
      />
    </div>
  );
}

function CSSStickyNote() {
  return (
    <div className="flex items-center justify-center shadow-lg"
      style={{
        width: "clamp(64px, 7vw, 96px)", height: "clamp(64px, 7vw, 96px)",
        background: "linear-gradient(135deg,#fda4af,#fb7185,#f43f5e)",
        borderRadius: 4, transform: "rotate(2deg)",
      }}>
      <p className="text-white font-bold text-center leading-snug" style={{ fontSize: "clamp(7px, 0.75vw, 10px)", padding: "6px" }}>
        できたことを<br />つみあげて<br />いこう！☺
      </p>
    </div>
  );
}

function DeskStickyNote() {
  return (
    <div className="absolute z-[15]" style={{ right: "6%", bottom: "35%" }}>
      <IllustrationImg
        src={deskItemIllustration("sticky-note")}
        alt="付箋"
        style={{ height: "clamp(64px, 7vw, 96px)", width: "auto", objectFit: "contain" }}
        fallback={<CSSStickyNote />}
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

/* CSS fallback desk surface (used when desk-surface.png is not found) */
function CSSDesk() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden"
      style={{
        height: "34%",
        background: "linear-gradient(180deg, #8B5E3C 0%, #7A4F2D 40%, #6B3F1E 100%)",
        boxShadow: "inset 0 6px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.18), rgba(255,255,255,0.08))" }} />
      <WoodGrains />
    </div>
  );
}

export default function DeskLayer({ goal, characterId, charMsg, finished }: DeskLayerProps) {
  const emoji = CHAR_EMOJI[characterId] ?? "🐱";

  return (
    <>
      {/* Desk surface image (transparent PNG, full-width, anchored to bottom) */}
      <IllustrationImg
        src="/-/illustrations/desk/desk-surface.png"
        alt=""
        className="absolute bottom-0 left-0 w-full z-10 pointer-events-none"
        style={{ height: "auto", display: "block" }}
        fallback={<CSSDesk />}
      />

      {/* Desk items */}
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
