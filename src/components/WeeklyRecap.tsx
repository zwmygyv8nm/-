'use client';

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

export default function WeeklyRecap({ records }: WeeklyRecapProps) {
  const last7 = new Set(getLast7Days());
  const weekRecords = records.filter((r) => last7.has(r.date));

  const activeDays = new Set(weekRecords.map((r) => r.date)).size;
  const totalSec = weekRecords.reduce((sum, r) => sum + r.durationSec, 0);
  const clearCount = weekRecords.filter((r) => r.cleared).length;
  const maxSec = weekRecords.length > 0 ? Math.max(...weekRecords.map((r) => r.durationSec)) : 0;
  const totalXp = weekRecords.reduce((sum, r) => sum + r.xpEarned, 0);

  const formatSec = (sec: number) => {
    if (sec === 0) return '0秒';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}秒`;
    if (s === 0) return `${m}分`;
    return `${m}分${s}秒`;
  };

  if (weekRecords.length === 0) {
    return (
      <div className="p-5 bg-white rounded-3xl shadow-sm border border-purple-100">
        <p className="text-xs text-gray-400 mb-1">今週のふりかえり</p>
        <p className="text-sm text-gray-400 leading-relaxed">
          まだ今週の記録がありません。<br />今日、最初の一声を出してみましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white rounded-3xl shadow-sm border border-purple-100">
      <p className="text-xs text-gray-400 mb-4">今週のふりかえり</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-pink-50 rounded-2xl p-4">
          <p className="text-2xl font-bold text-pink-500">{activeDays}<span className="text-sm font-normal ml-1">日</span></p>
          <p className="text-xs text-gray-400 mt-1">声を出せた日</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4">
          <p className="text-2xl font-bold text-purple-500">{formatSec(totalSec)}</p>
          <p className="text-xs text-gray-400 mt-1">合計の発話時間</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-2xl font-bold text-green-500">{clearCount}<span className="text-sm font-normal ml-1">回</span></p>
          <p className="text-xs text-gray-400 mt-1">クリアした回数</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-2xl font-bold text-blue-500">{formatSec(maxSec)}</p>
          <p className="text-xs text-gray-400 mt-1">一番長く話した時間</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl px-4 py-3 text-sm text-gray-500 leading-relaxed">
        今週は{activeDays}日、声を出せました。
        {totalSec > 0 && `合計${formatSec(totalSec)}話しています。`}
        {maxSec > 0 && `一番長く話せたのは${formatSec(maxSec)}でした。`}
        {totalXp > 0 && (
          <span className="block mt-1 text-xs text-gray-400">獲得XP: +{totalXp}</span>
        )}
      </div>
    </div>
  );
}
