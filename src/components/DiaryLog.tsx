'use client';

import { useState } from 'react';
import { Hachi_Maru_Pop } from 'next/font/google';
import type { SpeechRecord } from '../types';

const popFont = Hachi_Maru_Pop({ weight: '400', subsets: ['latin'], preload: false });

type DiaryLogProps = {
  records: SpeechRecord[];
};

const WEATHER_WORDS = ['はれ', 'くもり', 'あめ', 'ほし'];

function getDiaryWeather(dateStr: string): string {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) % WEATHER_WORDS.length;
  }
  return WEATHER_WORDS[hash];
}

function formatListDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  return `${y}/${m}/${d}`;
}

function getYearMonthDay(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  return { year: y, month: m, day: d };
}

export default function DiaryLog({ records }: DiaryLogProps) {
  const [selected, setSelected] = useState<SpeechRecord | null>(null);

  // 新しい記録が上に来るように並べる
  const sorted = [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (sorted.length === 0) {
    return (
      <div className="p-5 bg-white rounded-2xl border border-stone-100">
        <p className="text-xs text-stone-400 mb-2">つけた日記</p>
        <p className="text-sm text-stone-400 leading-relaxed">
          まだ日記のページがありません。話してみると、ここに残っていきます。
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 bg-white rounded-2xl border border-stone-100">
        <p className="text-xs text-stone-400 mb-3">つけた日記（{sorted.length}件）</p>
        <div className="flex flex-col gap-2">
          {sorted.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="flex items-center justify-between gap-3 px-3 py-2.5 bg-stone-50 rounded-lg text-left active:scale-[0.98] transition-transform"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-stone-400">
                  {formatListDate(r.date)}　{getDiaryWeather(r.date)}
                </p>
                <p className="text-sm text-stone-700 truncate mt-0.5">
                  {r.memo || `「${r.prompt}」`}
                </p>
              </div>
              <span
                className={`shrink-0 text-[11px] px-2 py-1 rounded-full ${
                  r.cleared ? 'bg-rose-50 text-rose-500' : 'bg-stone-100 text-stone-400'
                }`}
              >
                {r.cleared ? `${r.durationSec}秒` : '小さな一声'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <DiaryDetail record={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function DiaryDetail({ record, onClose }: { record: SpeechRecord; onClose: () => void }) {
  const weather = getDiaryWeather(record.date);
  const { year, month, day } = getYearMonthDay(record.date);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm hanasu-paper border border-stone-200/70 rounded-2xl p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-xs text-stone-400 mb-1">
            {record.cleared ? 'きょうの一声' : '小さな一声'}
          </p>
          <p className="text-stone-700 text-base leading-relaxed">「{record.prompt}」</p>
          <p className="text-xs text-stone-400 mt-2">
            {record.cleared
              ? `${record.durationSec}秒、声に出せた`
              : '少しだけ声を出せました。それも、ちゃんとその日のページです。'}
          </p>
        </div>

        <div className="flex bg-white border-2 border-sky-200 rounded-xl overflow-hidden h-40">
          <div
            className={`flex-1 hanasu-vertical-lines hanasu-vertical-text overflow-auto py-3 pr-2 text-stone-800 font-bold text-[15px] leading-8 ${popFont.className}`}
          >
            {record.memo || ''}
          </div>
          <div
            className={`w-12 border-l border-sky-100 bg-sky-50/60 hanasu-vertical-text flex items-center justify-center text-stone-500 text-xs ${popFont.className}`}
          >
            {year}年{month}月{day}日（{weather}）
          </div>
        </div>

        {record.xpEarned > 0 && (
          <p className="text-xs text-stone-300">+{record.xpEarned} 成長ポイント</p>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl border border-stone-200 text-stone-500 text-sm active:scale-95 transition-transform"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
