'use client';

import { getAllCategories } from '../lib/prompts';

type CategorySelectorProps = {
  selected: string | null;
  onChange: (category: string | null) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  '今日の予定': 'bg-blue-100 text-blue-700 border-blue-200',
  '今の気分': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '好きなもの': 'bg-pink-100 text-pink-700 border-pink-200',
  '出来事': 'bg-green-100 text-green-700 border-green-200',
  '自己紹介': 'bg-purple-100 text-purple-700 border-purple-200',
  '説明練習': 'bg-orange-100 text-orange-700 border-orange-200',
  '意見練習': 'bg-red-100 text-red-700 border-red-200',
  '雑談練習': 'bg-teal-100 text-teal-700 border-teal-200',
  '発表ウォームアップ': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'やさしい声出し': 'bg-rose-100 text-rose-700 border-rose-200',
};

const categories = getAllCategories();

export default function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  return (
    <div className="p-5 bg-white rounded-3xl shadow-sm border border-purple-100">
      <p className="text-xs text-gray-400 mb-3">お題のカテゴリ</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange(null)}
          className={`px-4 py-2 rounded-full text-sm border transition-all active:scale-95 ${
            selected === null
              ? 'bg-purple-400 text-white border-purple-400'
              : 'bg-gray-50 text-gray-500 border-gray-200'
          }`}
        >
          今日のおすすめ
        </button>
        {categories.map((cat) => {
          const isActive = selected === cat;
          const colorClass = CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-700 border-gray-200';
          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={`px-4 py-2 rounded-full text-sm border transition-all active:scale-95 ${
                isActive ? colorClass + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
