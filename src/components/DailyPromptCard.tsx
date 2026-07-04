'use client';

import type { Prompt } from '../lib/prompts';
import { CATEGORY_BADGE_COLORS } from '../lib/categoryStyle';

type DailyPromptCardProps = {
  prompt: Prompt;
};

export default function DailyPromptCard({ prompt }: DailyPromptCardProps) {
  const colorClass = CATEGORY_BADGE_COLORS[prompt.category] ?? 'bg-gray-100 text-gray-700';

  return (
    <div className="p-5 sm:p-6 bg-white rounded-[1.75rem] shadow-sm border border-purple-100">
      <p className="text-xs text-gray-400 mb-2">📝 今日のお題</p>
      <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-3 ${colorClass}`}>
        {prompt.category}
      </span>
      <p className="text-gray-800 text-base font-medium leading-relaxed">{prompt.text}</p>
    </div>
  );
}
