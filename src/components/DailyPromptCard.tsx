'use client';

import { useState, useEffect } from 'react';
import type { Prompt } from '../lib/prompts';
import { CATEGORY_BADGE_COLORS } from '../lib/categoryStyle';

type DailyPromptCardProps = {
  prompt: Prompt;
};

export default function DailyPromptCard({ prompt }: DailyPromptCardProps) {
  const colorClass = CATEGORY_BADGE_COLORS[prompt.category] ?? 'bg-gray-100 text-gray-700';
  const [showStarter, setShowStarter] = useState(false);

  // お題が変わったら、話し出しサポートは一旦閉じておく
  useEffect(() => {
    setShowStarter(false);
  }, [prompt.id]);

  return (
    <div className="p-5 sm:p-6 bg-white rounded-[1.75rem] shadow-sm border border-purple-100">
      <p className="text-xs text-gray-400 mb-2">📝 今日のお題</p>
      <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-3 ${colorClass}`}>
        {prompt.category}
      </span>
      <p className="text-gray-800 text-base font-medium leading-relaxed">{prompt.text}</p>

      {prompt.starter && (
        <div className="mt-4">
          {!showStarter ? (
            <button
              onClick={() => setShowStarter(true)}
              className="text-sm text-purple-400 active:scale-95 transition-transform"
            >
              💬 話し出しサポートを見る
            </button>
          ) : (
            <div className="hanasu-fade-in bg-amber-50/60 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-amber-500">話し出しサポート</p>
                <button
                  onClick={() => setShowStarter(false)}
                  className="text-xs text-gray-300 active:scale-95 transition-transform"
                >
                  閉じる
                </button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{prompt.starter}</p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                迷ったら、この形をそのまま読んでも大丈夫です。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
