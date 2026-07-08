"use client";

import Link from "next/link";
import { AppMode } from "@/lib/study/storage";

interface Props {
  onSelect: (mode: AppMode) => void;
}

const MODES: {
  id: AppMode;
  emoji: string;
  title: string;
  description: string;
  cta: string;
  disabled?: boolean;
  accent: string;
}[] = [
  {
    id: "virtual",
    emoji: "🏫",
    title: "バーチャル自習室",
    description: "一人称の没入自習。25分集中して、机と部屋を育てよう。",
    cta: "入室する",
    accent: "border-indigo-400/40 hover:border-indigo-300/60",
  },
  {
    id: "travel",
    emoji: "🗺",
    title: "全国旅行モード",
    description: "勉強するたびに全国を旅する。次の街は、どこだろう。",
    cta: "旅を始める",
    accent: "border-emerald-400/40 hover:border-emerald-300/60",
  },
  {
    id: "original",
    emoji: "🖼",
    title: "オリジナル自習室",
    description: "志望校や自分の机など、好きな画像で自習室を作る。",
    cta: "準備中",
    disabled: true,
    accent: "border-white/10",
  },
];

export default function ModeSelectScreen({ onSelect }: Props) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex flex-col items-center justify-center px-5 py-10 gap-8"
      style={{ background: "linear-gradient(160deg, #0f0c29, #1a1040 40%, #0d1b2a)" }}
    >
      {/* ポータルへの戻り導線 */}
      <Link
        href="/"
        className="absolute left-4 top-4 text-xs text-white/30 transition-colors hover:text-white/60"
      >
        ← ポータル
      </Link>

      {/* App title */}
      <div className="text-center">
        <div className="text-5xl mb-3 drop-shadow-lg">🏫</div>
        <h1 className="text-2xl font-bold text-white tracking-tight">私だけの自習室</h1>
        <p className="text-white/40 text-sm mt-1.5">どのモードで始めますか？</p>
      </div>

      {/* Mode cards */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            disabled={m.disabled}
            onClick={() => !m.disabled && onSelect(m.id)}
            className={`w-full text-left rounded-2xl p-5 border-2 transition-all duration-200 backdrop-blur-sm
              ${m.disabled
                ? "border-white/10 bg-white/5 opacity-40 cursor-not-allowed"
                : `${m.accent} bg-white/8 hover:bg-white/12 active:scale-[0.98]`
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{m.emoji}</span>
                <span className="font-bold text-white text-sm">{m.title}</span>
              </div>
              {m.disabled && (
                <span className="text-[10px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full shrink-0">
                  近日公開
                </span>
              )}
            </div>
            <p className="text-white/50 text-xs leading-relaxed">{m.description}</p>
            {!m.disabled && (
              <p className="mt-3 text-xs font-semibold text-white/70">→ {m.cta}</p>
            )}
          </button>
        ))}
      </div>

      <p className="text-white/20 text-xs">あとでモードは変えられます</p>
    </div>
  );
}
