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
    <div className="p-5 bg-white rounded-2xl border border-stone-100">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs text-stone-400">直近4週間の記録</p>
        {clearedCount > 0 && (
          <p className="text-xs text-rose-500">{clearedCount}日 練習した</p>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.date}
            title={day.date}
            className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-all ${
              day.status === 'clear'
                ? 'bg-rose-400 text-white font-medium'
                : day.status === 'tiny'
                ? 'bg-rose-50 text-rose-300'
                : 'bg-stone-50 text-stone-300'
            }`}
          >
            {day.label}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-stone-400 mt-3">
        <span className="flex items-center gap-1.5">
          <i className="inline-block w-2.5 h-2.5 rounded-full bg-rose-400" />
          記録した日
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block w-2.5 h-2.5 rounded-full bg-rose-50 border border-rose-200" />
          小さな一声
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block w-2.5 h-2.5 rounded-full bg-stone-50 border border-stone-200" />
          おやすみの日
        </span>
      </div>
      {tinyCount > 0 && (
        <p className="text-xs text-stone-300 mt-2">そのほか{tinyCount}日、小さな一声がありました</p>
      )}
    </div>
  );
}
