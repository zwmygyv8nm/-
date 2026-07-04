'use client';

import { useState } from 'react';
import type { SpeechRecord, UserProgress } from '../types';
import DiaryIllustration from './DiaryIllustration';

type ResultCardProps = {
  record: SpeechRecord;
  progress: UserProgress;
  onHome: () => void;
};

// 状況を判定して相棒のセリフを返す
function getBuddyReaction(record: SpeechRecord, progress: UserProgress): string {
  const { durationSec, cleared, date } = record;
  const { streakDays, records } = progress;

  const sameDay = records.filter((r) => r.date === date);
  if (sameDay.length >= 2) {
    return 'もう一度来てくれたんだね。短くても大丈夫。';
  }

  if (!cleared) {
    return '今日の声、ここに残ったよ。';
  }

  if (durationSec >= 60) {
    return '1分話せたね。長く続けられたんだ。';
  }

  if (durationSec >= 30) {
    return '今日は少し長めに話せたね。';
  }

  if (streakDays >= 7) {
    return '7日続いたね。声を出すことが習慣になってきたかも。';
  }

  if (streakDays === 3) {
    return '3日続いたね。少しずつ習慣になってきたかも。';
  }

  const clearedCount = records.filter((r) => r.cleared).length;
  if (clearedCount === 1) {
    return 'はじめの一声、ちゃんと残ったよ。';
  }

  const normals = [
    '今日の声、ここに残ったよ。',
    '短くても、ちゃんと一ページになったね。',
    'また話したくなったら、ここに戻ってきてね。',
    '今日もいっしょに過ごせてよかった。',
    '話せた分だけ、積み重なってるよ。',
  ];
  return normals[(record.xpEarned + durationSec) % normals.length];
}

// 実際の天気APIは使わず、日付から一意に決まる「絵日記風」の表示にする
const WEATHER_WORDS = ['はれ', 'くもり', 'あめ', 'ほし'];

function getDiaryWeather(dateStr: string): string {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) % WEATHER_WORDS.length;
  }
  return WEATHER_WORDS[hash];
}

function formatDiaryDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  return `${y}年${m}月${d}日`;
}

type SelfRating = 'easy' | 'nervous' | 'better_than_expected' | 'retry';

const RATINGS: { id: SelfRating; label: string }[] = [
  { id: 'easy', label: '話しやすかった' },
  { id: 'nervous', label: 'ちょっと緊張した' },
  { id: 'better_than_expected', label: '思ったより話せた' },
  { id: 'retry', label: 'もう一回やりたい' },
];

export default function ResultCard({ record, progress, onHome }: ResultCardProps) {
  const [selectedRating, setSelectedRating] = useState<SelfRating | null>(null);
  const reaction = getBuddyReaction(record, progress);
  const weather = getDiaryWeather(record.date);

  return (
    <div className="flex flex-col gap-4 p-6 hanasu-paper border border-stone-200/70 rounded-2xl result-pop">
      {/* 日付・天気 */}
      <p className="text-sm text-stone-400 tracking-wide">
        {formatDiaryDate(record.date)}　{weather}
      </p>

      {/* 絵日記の絵スペース */}
      <DiaryIllustration buddyStage={progress.buddyStage} />

      {/* きょうの一声 / 小さな一声 */}
      <div>
        <p className="text-xs text-stone-400 mb-1">
          {record.cleared ? 'きょうの一声' : '小さな一声'}
        </p>
        <p className="text-stone-700 text-base leading-relaxed">「{record.prompt}」</p>
        <p className="text-xs text-stone-400 mt-2">
          {record.cleared
            ? `${record.durationSec}秒、声に出せた`
            : '今日は少しだけ声を出せました。それも、ちゃんと今日のページです。'}
        </p>
      </div>

      {/* ひとこと（ノート風本文） */}
      {record.memo && (
        <div className="hanasu-diary-note bg-white/70 border border-stone-100 rounded-lg p-4">
          <p className="text-xs text-stone-400 mb-1.5">ひとこと</p>
          <p className="text-sm text-stone-600 leading-relaxed">{record.memo}</p>
        </div>
      )}

      {/* 相棒より */}
      <div>
        <p className="text-xs text-stone-400 mb-1">相棒より</p>
        <p className="text-stone-600 text-sm leading-relaxed">{reaction}</p>
      </div>

      {/* 成長ポイント（控えめに） */}
      {record.xpEarned > 0 && (
        <p className="text-xs text-stone-300">+{record.xpEarned} 成長ポイント</p>
      )}

      {/* 自己評価（任意） */}
      <div className="pt-1">
        <p className="text-xs text-stone-300 mb-2">今日の感想（なくてもOK）</p>
        <div className="grid grid-cols-2 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRating(r.id)}
              className={`py-3 px-2 rounded-lg text-sm transition-colors ${
                selectedRating === r.id
                  ? 'bg-rose-500 text-white'
                  : 'bg-white text-stone-500 active:scale-95 border border-stone-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onHome}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium active:scale-95 transition-transform"
      >
        ホームに戻る
      </button>
    </div>
  );
}
