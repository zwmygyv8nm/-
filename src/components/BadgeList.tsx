'use client';

import { getBadgeLabel } from '../lib/progress';

type BadgeListProps = {
  badges: string[];
};

const BADGE_ICONS: Record<string, string> = {
  first_voice: '🎤',
  streak_3: '🔥',
  streak_7: '⭐',
  duration_30: '💬',
  duration_60: '🏆',
};

export default function BadgeList({ badges }: BadgeListProps) {
  if (badges.length === 0) {
    return (
      <div className="p-5 bg-white rounded-2xl border border-stone-100">
        <p className="text-xs text-stone-400 mb-2">バッジ</p>
        <p className="text-sm text-stone-400 text-center py-2">話すとバッジが届くよ</p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white rounded-2xl border border-stone-100">
      <p className="text-xs text-stone-400 mb-3">バッジ</p>
      <div className="flex flex-wrap gap-2">
        {badges.map((id) => (
          <div
            key={id}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-50 border border-stone-100 rounded-full"
          >
            <span>{BADGE_ICONS[id] ?? '🏅'}</span>
            <span className="text-xs text-stone-600">{getBadgeLabel(id)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
