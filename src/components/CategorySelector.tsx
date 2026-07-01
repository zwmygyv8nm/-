'use client';

import { getAllCategories } from '../lib/prompts';

type CategorySelectorProps = {
  selected: string | null;
  onChange: (category: string | null) => void;
};

// アクティブ時の色クラス
const ACTIVE_COLORS: Record<string, string> = {
  '今日の予定': 'bg-blue-100 text-blue-700 border-blue-300',
  '今の気分': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  '好きなもの': 'bg-pink-100 text-pink-700 border-pink-300',
  '出来事': 'bg-green-100 text-green-700 border-green-300',
  '自己紹介': 'bg-purple-100 text-purple-700 border-purple-300',
  '説明練習': 'bg-orange-100 text-orange-700 border-orange-300',
  '意見練習': 'bg-red-100 text-red-700 border-red-300',
  '雑談練習': 'bg-teal-100 text-teal-700 border-teal-300',
  '発表ウォームアップ': 'bg-indigo-100 text-indigo-700 border-indigo-300',
  'やさしい声出し': 'bg-rose-100 text-rose-700 border-rose-300',
};

const INACTIVE = 'bg-gray-50 text-gray-400 border-gray-200';

const categories = getAllCategories();

export default function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  return (
    <div className="p-5 bg-white rounded-3xl shadow-sm border border-purple-100">
      <p className="text-xs text-gray-400 mb-3">カテゴリから選ぶ</p>
      {/* スクロール可能な横並びより、折り返しの方がスマホで安心 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange(null)}
          className={`px-4 py-2.5 min-h-[40px] rounded-full text-sm border transition-all active:scale-95 ${
            selected === null
              ? 'bg-purple-400 text-white border-purple-400'
              : INACTIVE
          }`}
        >
          今日のおすすめ
        </button>
        {categories.map((cat) => {
          const isActive = selected === cat;
          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={`px-4 py-2.5 min-h-[40px] rounded-full text-sm border transition-all active:scale-95 ${
                isActive
                  ? (ACTIVE_COLORS[cat] ?? 'bg-gray-100 text-gray-700 border-gray-300')
                  : INACTIVE
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
