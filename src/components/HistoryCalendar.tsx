'use client';

import type { SpeechRecord } from '../types';

type HistoryCalendarProps = {
  records: SpeechRecord[];
};

export default function HistoryCalendar({ records }: HistoryCalendarProps) {
  const today = new Date();
  const days: { date: string; label: string; cleared: boolean }[] = [];

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const cleared = records.some((r) => r.date === dateStr && r.cleared);
    days.push({ date: dateStr, label: String(d.getDate()), cleared });
  }

  const clearedCount = days.filter((d) => d.cleared).length;

  return (
    <div className="p-5 bg-white rounded-3xl shadow-sm border border-green-100">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs text-gray-400">直近4週間の記録</p>
        {clearedCount > 0 && (
          <p className="text-xs text-green-500">{clearedCount}日 練習した</p>
        )}
      </div>
      {/* 7列 × 4行 = 28日。360px / 7 ≈ 51px/cell で余裕あり */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <div
            key={day.date}
            title={day.date}
            className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-all ${
              day.cleared
                ? 'bg-gradient-to-br from-pink-300 to-purple-300 text-white font-medium'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {day.label}
          </div>
        ))}
      </div>
    </div>
  );
}
