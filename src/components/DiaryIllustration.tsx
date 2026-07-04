'use client';

// 絵日記の「絵」スペース。将来的に本物のSVG/PNGイラストに差し替えやすいよう、
// 表示だけを担う小さなコンポーネントとして分離している。
// 現状はCSSの図形のみで「窓・机・日記帳・植物・やわらかい光・相棒」を表現し、
// 絵文字は相棒本体の1つだけに留める。

type DiaryIllustrationProps = {
  buddyStage: number;
};

const BUDDY_EMOJI = ['🌱', '🌿', '🌸', '🌳'];

export default function DiaryIllustration({ buddyStage }: DiaryIllustrationProps) {
  const emoji = BUDDY_EMOJI[Math.min(Math.max(buddyStage - 1, 0), 3)];

  return (
    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gradient-to-b from-sky-50 via-sky-50 to-amber-50 border border-stone-200/70">
      {/* やわらかい光 */}
      <div className="absolute top-2 right-4 w-16 h-16 rounded-full bg-amber-100/70 blur-xl" />

      {/* 窓 */}
      <div className="absolute top-3 left-4 w-12 h-12 rounded-md bg-white/80 border border-stone-200">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-stone-200" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-200" />
      </div>

      {/* 相棒（窓の光の中で少し浮いている） */}
      <div className="absolute top-6 right-8 text-3xl buddy-float select-none" aria-hidden>
        {emoji}
      </div>

      {/* 机 */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-amber-100/80 border-t border-amber-200/80" />

      {/* 日記帳（机の上） */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-8 rounded-sm bg-white border border-stone-200 -rotate-2 shadow-sm px-1.5 pt-1.5 flex flex-col gap-1.5">
        <div className="h-px bg-stone-100" />
        <div className="h-px bg-stone-100" />
        <div className="h-px bg-stone-100" />
      </div>

      {/* 小さな植物 */}
      <div className="absolute bottom-2 right-6 flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-emerald-200/80 -mb-1" />
        <div className="w-2 h-3 rounded-t-full bg-amber-200/90" />
      </div>
    </div>
  );
}
