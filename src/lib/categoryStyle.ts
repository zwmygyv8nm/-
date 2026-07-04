// カテゴリごとの淡い配色。CategorySelector と DailyPromptCard で共有する。
export const CATEGORY_BADGE_COLORS: Record<string, string> = {
  '今日の予定': 'bg-sky-100 text-sky-700',
  '今の気分': 'bg-amber-100 text-amber-700',
  '好きなもの': 'bg-pink-100 text-pink-700',
  '出来事': 'bg-emerald-100 text-emerald-700',
  '自己紹介': 'bg-purple-100 text-purple-700',
  '説明練習': 'bg-orange-100 text-orange-700',
  '意見練習': 'bg-rose-100 text-rose-700',
  '雑談練習': 'bg-teal-100 text-teal-700',
  '発表ウォームアップ': 'bg-indigo-100 text-indigo-700',
  'やさしい声出し': 'bg-fuchsia-100 text-fuchsia-700',
};

export const CATEGORY_ACTIVE_COLORS: Record<string, string> = {
  '今日の予定': 'bg-sky-100 text-sky-700 border-sky-300',
  '今の気分': 'bg-amber-100 text-amber-700 border-amber-300',
  '好きなもの': 'bg-pink-100 text-pink-700 border-pink-300',
  '出来事': 'bg-emerald-100 text-emerald-700 border-emerald-300',
  '自己紹介': 'bg-purple-100 text-purple-700 border-purple-300',
  '説明練習': 'bg-orange-100 text-orange-700 border-orange-300',
  '意見練習': 'bg-rose-100 text-rose-700 border-rose-300',
  '雑談練習': 'bg-teal-100 text-teal-700 border-teal-300',
  '発表ウォームアップ': 'bg-indigo-100 text-indigo-700 border-indigo-300',
  'やさしい声出し': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
};
