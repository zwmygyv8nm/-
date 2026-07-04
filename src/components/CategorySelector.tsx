'use client';

import { getAllCategories } from '../lib/prompts';
import { CATEGORY_ACTIVE_COLORS } from '../lib/categoryStyle';

type CategorySelectorProps = {
  selected: string | null;
  onChange: (category: string | null) => void;
};

const INACTIVE = 'bg-gray-50 text-gray-400 border-gray-200';

const categories = getAllCategories();

export default function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  return (
    <div className="p-5 sm:p-6 bg-white rounded-[1.75rem] shadow-sm border border-purple-100">
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
                  ? (CATEGORY_ACTIVE_COLORS[cat] ?? 'bg-gray-100 text-gray-700 border-gray-300')
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
