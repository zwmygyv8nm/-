'use client';

import type { Prompt } from '../lib/prompts';

type DailyPromptCardProps = {
  prompt: Prompt;
};

const CATEGORY_COLORS: Record<string, string> = {
  '今日の予定': 'bg-blue-100 text-blue-700',
  '気分': 'bg-yellow-100 text-yellow-700',
  '好きなもの': 'bg-pink-100 text-pink-700',
  '出来事': 'bg-green-100 text-green-700',
  '自己紹介': 'bg-purple-100 text-purple-700',
  '説明練習': 'bg-orange-100 text-orange-700',
};

export default function DailyPromptCard({ prompt }: DailyPromptCardProps) {
  const colorClass = CATEGORY_COLORS[prompt.category] ?? 'bg-gray-100 text-gray-700';

  return (
    <div className="p-5 bg-white rounded-3xl shadow-sm border border-purple-100">
      <p className="text-xs text-gray-400 mb-2">今日のお題</p>
      <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-3 ${colorClass}`}>
        {prompt.category}
      </span>
      <p className="text-gray-800 text-base font-medium leading-relaxed">{prompt.text}</p>
    </div>
  );
}
