'use client';

// 絵日記の「絵」スペース。将来的に本物のSVG/PNGイラストに差し替えやすいよう、
// 表示だけを担う小さなコンポーネントとして分離している。
// 上部に虹と雲、下に窓・机・日記帳・植物・相棒のいる部屋のシーンを配置し、
// 昔ながらの絵日記テンプレートの雰囲気を再現する。

type DiaryIllustrationProps = {
  buddyStage: number;
};

const BUDDY_EMOJI = ['🌱', '🌿', '🌸', '🌳'];

export default function DiaryIllustration({ buddyStage }: DiaryIllustrationProps) {
  const emoji = BUDDY_EMOJI[Math.min(Math.max(buddyStage - 1, 0), 3)];

  return (
    <div className="rounded-2xl border-2 border-sky-200 bg-white overflow-hidden">
      {/* 虹と雲 */}
      <div className="relative h-16 bg-sky-50">
        <svg
          viewBox="0 0 300 80"
          className="absolute left-1/2 top-2 -translate-x-1/2 w-[85%]"
          aria-hidden
        >
          <path
            d="M 20 80 A 130 130 0 0 1 280 80"
            fill="none"
            stroke="#fca5a5"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 20 80 A 130 130 0 0 1 280 80"
            fill="none"
            stroke="#fdba74"
            strokeWidth="7"
            strokeLinecap="round"
            transform="translate(0 -7)"
          />
          <path
            d="M 20 80 A 130 130 0 0 1 280 80"
            fill="none"
            stroke="#fde68a"
            strokeWidth="7"
            strokeLinecap="round"
            transform="translate(0 -14)"
          />
          <path
            d="M 20 80 A 130 130 0 0 1 280 80"
            fill="none"
            stroke="#bbf7d0"
            strokeWidth="7"
            strokeLinecap="round"
            transform="translate(0 -21)"
          />
          <path
            d="M 20 80 A 130 130 0 0 1 280 80"
            fill="none"
            stroke="#bfdbfe"
            strokeWidth="7"
            strokeLinecap="round"
            transform="translate(0 -28)"
          />
        </svg>
        {/* 雲 */}
        <div className="absolute left-3 bottom-1 flex items-end">
          <div className="w-5 h-5 rounded-full bg-white border border-sky-100" />
          <div className="w-7 h-7 rounded-full bg-white border border-sky-100 -ml-2" />
          <div className="w-4 h-4 rounded-full bg-white border border-sky-100 -ml-2" />
        </div>
        <div className="absolute right-3 bottom-1 flex items-end">
          <div className="w-4 h-4 rounded-full bg-white border border-sky-100" />
          <div className="w-7 h-7 rounded-full bg-white border border-sky-100 -ml-2" />
          <div className="w-5 h-5 rounded-full bg-white border border-sky-100 -ml-2" />
        </div>
      </div>

      {/* 部屋のシーン */}
      <div className="relative w-full h-32 bg-gradient-to-b from-white to-amber-50">
        {/* やわらかい光 */}
        <div className="absolute top-1 right-4 w-14 h-14 rounded-full bg-amber-100/70 blur-xl" />

        {/* 窓 */}
        <div className="absolute top-3 left-4 w-11 h-11 rounded-md bg-sky-50/80 border border-stone-200">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-stone-200" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-200" />
        </div>

        {/* 相棒 */}
        <div className="absolute top-5 right-8 text-3xl buddy-float select-none" aria-hidden>
          {emoji}
        </div>

        {/* 机 */}
        <div className="absolute bottom-0 left-0 right-0 h-9 bg-amber-100/80 border-t border-amber-200/80" />

        {/* 日記帳（机の上） */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-7 rounded-sm bg-white border border-stone-200 -rotate-2 shadow-sm px-1.5 pt-1.5 flex flex-col gap-1">
          <div className="h-px bg-stone-100" />
          <div className="h-px bg-stone-100" />
        </div>

        {/* 小さな植物 */}
        <div className="absolute bottom-2 right-6 flex flex-col items-center">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-200/80 -mb-1" />
          <div className="w-2 h-2.5 rounded-t-full bg-amber-200/90" />
        </div>
      </div>
    </div>
  );
}
