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
    <div className="p-5 bg-white rounded-3xl shadow-sm border border-purple-100">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-xs text-gray-400">レベル</p>
          <p className="text-2xl font-bold text-purple-500">Lv.{level}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">XP</p>
          <p className="text-xl font-bold text-pink-500">{totalXp}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">連続記録</p>
          <p className="text-xl font-bold text-green-500">{streakDays}日</p>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      {level < 5 && (
        <p className="text-xs text-gray-400 mt-1 text-right">
          次のレベルまで {nextLevelXp - totalXp} XP
        </p>
      )}
    </div>
  );
}
