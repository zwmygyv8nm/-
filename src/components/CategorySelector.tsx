'use client';

import { getAllCategories } from '../lib/prompts';
import { CATEGORY_ACTIVE_CLASS, CATEGORY_INACTIVE_CLASS } from '../lib/categoryStyle';

type CategorySelectorProps = {
  selected: string | null;
  onChange: (category: string | null) => void;
};

const categories = getAllCategories();

export default function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-stone-100">
      <p className="text-xs text-stone-400 mb-3">カテゴリから選ぶ</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange(null)}
          className={`px-4 py-2 min-h-[38px] rounded-full text-sm border transition-colors active:scale-95 ${
            selected === null ? CATEGORY_ACTIVE_CLASS : CATEGORY_INACTIVE_CLASS
          }`}
        >
          おすすめ
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`px-4 py-2 min-h-[38px] rounded-full text-sm border transition-colors active:scale-95 ${
              selected === cat ? CATEGORY_ACTIVE_CLASS : CATEGORY_INACTIVE_CLASS
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
