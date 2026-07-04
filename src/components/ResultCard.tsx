'use client';

import { useState } from 'react';
import { Hachi_Maru_Pop } from 'next/font/google';
import type { SpeechRecord, UserProgress } from '../types';
import DiaryIllustration from './DiaryIllustration';

const popFont = Hachi_Maru_Pop({ weight: '400', subsets: ['latin'], preload: false });

type ResultCardProps = {
  record: SpeechRecord;
  progress: UserProgress;
  onHome: () => void;
  onMemoChange: (recordId: string, memo: string) => void;
};

const DIARY_TEXT_MAX_LENGTH = 200;

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

function getYearMonthDay(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  return { year: y, month: m, day: d };
}

type SelfRating = 'easy' | 'nervous' | 'better_than_expected' | 'retry';

const RATINGS: { id: SelfRating; label: string }[] = [
  { id: 'easy', label: '話しやすかった' },
  { id: 'nervous', label: 'ちょっと緊張した' },
  { id: 'better_than_expected', label: '思ったより話せた' },
  { id: 'retry', label: 'もう一回やりたい' },
];

export default function ResultCard({ record, progress, onHome, onMemoChange }: ResultCardProps) {
  const [selectedRating, setSelectedRating] = useState<SelfRating | null>(null);
  const [diaryText, setDiaryText] = useState(record.memo ?? '');
  const reaction = getBuddyReaction(record, progress);
  const weather = getDiaryWeather(record.date);
  const { year, month, day } = getYearMonthDay(record.date);

  const handleDiaryTextChange = (value: string) => {
    const next = value.slice(0, DIARY_TEXT_MAX_LENGTH);
    setDiaryText(next);
    onMemoChange(record.id, next);
  };

  return (
    <div className="flex flex-col gap-4 p-6 hanasu-paper border border-stone-200/70 rounded-2xl result-pop">
      {/* 絵日記の絵スペース（お部屋のシーン） */}
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

      {/* 下の部分：縦書きの日記欄（自由に書ける・年月日と天気は右端に）
          罫線は外側の枠（hanasu-vertical-lines）に固定し、
          文字は内側で translate-x により右へ少しずらして重なりを避ける。 */}
      <div className="flex bg-white border-2 border-sky-200 rounded-xl overflow-hidden h-40">
        <div className="relative flex-1 hanasu-vertical-lines overflow-hidden">
          <textarea
            value={diaryText}
            onChange={(e) => handleDiaryTextChange(e.target.value)}
            maxLength={DIARY_TEXT_MAX_LENGTH}
            placeholder={reaction}
            className={`hanasu-vertical-text absolute inset-0 translate-x-1.5 resize-none overflow-auto py-3 pr-2 text-stone-800 font-bold text-[15px] leading-8 bg-transparent border-none outline-none placeholder:text-stone-300 placeholder:font-normal ${popFont.className}`}
          />
        </div>
        <div
          className={`w-12 border-l border-sky-100 bg-sky-50/60 hanasu-vertical-text flex items-center justify-center text-stone-500 text-xs ${popFont.className}`}
        >
          {year}年{month}月{day}日（{weather}）
        </div>
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
