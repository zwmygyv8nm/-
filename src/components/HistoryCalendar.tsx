'use client';

import type { SpeechRecord } from '../types';

type HistoryCalendarProps = {
  records: SpeechRecord[];
};

type DayStatus = 'clear' | 'tiny' | 'none';

export default function HistoryCalendar({ records }: HistoryCalendarProps) {
  const today = new Date();
  const days: { date: string; label: string; status: DayStatus }[] = [];

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const dayRecords = records.filter((r) => r.date === dateStr);
    const hasClear = dayRecords.some((r) => r.cleared);
    const status: DayStatus = hasClear ? 'clear' : dayRecords.length > 0 ? 'tiny' : 'none';
    days.push({ date: dateStr, label: String(d.getDate()), status });
  }

  const clearedCount = days.filter((d) => d.status === 'clear').length;
  const tinyCount = days.filter((d) => d.status === 'tiny').length;

  return (
    <div className="p-5 bg-white rounded-3xl shadow-sm border border-green-100">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-xs text-gray-400">直近4週間の記録</p>
        {clearedCount > 0 && (
          <p className="text-xs text-green-500">{clearedCount}日 練習した</p>
        )}
      </div>
      {tinyCount > 0 && (
        <p className="text-xs text-gray-300 mb-2">そのほか{tinyCount}日、小さな一声</p>
      )}
      {/* 7列 × 4行 = 28日。360px / 7 ≈ 51px/cell で余裕あり */}
      <div className="grid grid-cols-7 gap-1.5 mt-2">
        {days.map((day) => (
          <div
            key={day.date}
            title={day.date}
            className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-all ${
              day.status === 'clear'
                ? 'bg-gradient-to-br from-pink-300 to-purple-300 text-white font-medium'
                : day.status === 'tiny'
                ? 'bg-pink-50 border border-pink-200 text-pink-300'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {day.label}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-300 mt-3">
        濃い印：記録した日　薄い印：小さな一声
      </p>
    </div>
  );
}
