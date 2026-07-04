'use client';

import type { UserProgress } from '../types';

type ProgressSummaryProps = {
  progress: UserProgress;
};

const XP_FOR_LEVEL = [0, 0, 50, 120, 220, 350];

export default function ProgressSummary({ progress }: ProgressSummaryProps) {
  const { totalXp, level, streakDays } = progress;
  const currentLevelXp = XP_FOR_LEVEL[level] ?? 0;
  const nextLevelXp = XP_FOR_LEVEL[level + 1] ?? totalXp;
  const progressPct =
    level >= 5
      ? 100
      : Math.min(100, ((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);

  return (
    <div className="p-5 bg-white rounded-2xl border border-stone-100">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-xs text-stone-400">レベル</p>
          <p className="text-2xl font-semibold text-stone-700">Lv.{level}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-400">XP</p>
          <p className="text-xl font-semibold text-rose-500">{totalXp}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-400">連続記録</p>
          <p className="text-xl font-semibold text-stone-700">{streakDays}日</p>
        </div>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-2">
        <div
          className="bg-rose-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      {level < 5 && (
        <p className="text-xs text-stone-400 mt-1 text-right">
          次のレベルまで {nextLevelXp - totalXp} XP
        </p>
      )}
    </div>
  );
}
