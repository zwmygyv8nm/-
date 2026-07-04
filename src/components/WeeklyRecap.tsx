'use client';

import { getAllCategories } from '../lib/prompts';
import type { SpeechRecord } from '../types';

type WeeklyRecapProps = {
  records: SpeechRecord[];
};

function getDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDateStr(d));
  }
  return days;
}

function formatSec(sec: number): string {
  if (sec === 0) return '0秒';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}秒`;
  if (s === 0) return `${m}分`;
  return `${m}分${s}秒`;
}

export default function WeeklyRecap({ records }: WeeklyRecapProps) {
  const last7 = new Set(getLast7Days());
  const weekRecords = records.filter((r) => last7.has(r.date));

  if (weekRecords.length === 0) {
    return (
      <div className="p-5 bg-white rounded-3xl shadow-sm border border-purple-100">
        <p className="text-xs text-gray-400 mb-2">今週のふりかえり</p>
        <p className="text-sm text-gray-400 leading-relaxed">
          まだ今週の記録がありません。今日、最初の一声を出してみましょう。
        </p>
      </div>
    );
  }

  const activeDates = new Set(weekRecords.map((r) => r.date));
  const activeDays = activeDates.size;
  const totalSec = weekRecords.reduce((sum, r) => sum + r.durationSec, 0);
  const maxSec = Math.max(...weekRecords.map((r) => r.durationSec));

  // 声を出した日を「記録できた日（clear）」と「小さな一声の日（tiny）」に分ける
  let clearDays = 0;
  for (const date of activeDates) {
    const hasClear = weekRecords.some((r) => r.date === date && r.cleared);
    if (hasClear) clearDays += 1;
  }
  const tinyDays = activeDays - clearDays;

  // カテゴリ別集計
  const catCount: Record<string, number> = {};
  for (const r of weekRecords) {
    catCount[r.category] = (catCount[r.category] ?? 0) + 1;
  }
  const sortedCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]);
  const allCats = getAllCategories();
  const untriedCats = allCats.filter((c) => !catCount[c]);

  return (
    <div className="p-5 bg-white rounded-3xl shadow-sm border border-purple-100 flex flex-col gap-4">
      <p className="text-xs text-gray-400">今週のふりかえり</p>

      {/* サマリー 2枚 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-pink-50 rounded-2xl p-4">
          <p className="text-2xl font-bold text-pink-500">
            {activeDays}
            <span className="text-sm font-normal ml-1">日</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">声を出せた日</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4">
          <p className="text-xl font-bold text-purple-500">{formatSec(totalSec)}</p>
          <p className="text-xs text-gray-400 mt-1">合計の発話時間</p>
        </div>
      </div>

      {/* カテゴリ別 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">練習したカテゴリ</p>
        <div className="flex flex-col gap-1">
          {sortedCats.map(([cat, cnt]) => (
            <div key={cat} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600">{cat}</span>
              <span className="text-sm font-medium text-purple-400">{cnt}回</span>
            </div>
          ))}
        </div>
        {untriedCats.length > 0 && (
          <p className="text-xs text-gray-300 mt-2 leading-relaxed">
            まだ試していない：{untriedCats.slice(0, 3).join('・')}
            {untriedCats.length > 3 ? `など` : ''}
          </p>
        )}
      </div>

      {/* 一言まとめ */}
      <p className="text-sm text-gray-400 leading-relaxed bg-pink-50 rounded-2xl px-4 py-3">
        今週は{activeDays}日、声を出せました。
        {tinyDays > 0
          ? `そのうち${clearDays}日は記録までできました。`
          : maxSec > 0 && `一番長く話せたのは${formatSec(maxSec)}でした。`}
      </p>
    </div>
  );
}
