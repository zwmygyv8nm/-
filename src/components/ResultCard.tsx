'use client';

import { useState } from 'react';
import type { SpeechRecord, UserProgress } from '../types';

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
    return '少しだけでも声を出せたなら、それで十分だよ。';
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
    '声を出せたね。今日はそれで十分。',
    '短くても、ちゃんと記録になったよ。',
    '今日の一声、残しておいたよ。',
    'また話したくなったら、いつでも戻ってきてね。',
    '今日もいっしょに過ごせてよかった。',
    '声が聞けてよかった。',
    '話せた分だけ、積み重なってるよ。',
    '今日の練習、しっかり記録したよ。',
    'また明日も待ってるよ。',
  ];
  return normals[(record.xpEarned + durationSec) % normals.length];
}

function getAchievementLabel(sec: number): string {
  if (sec >= 60) return '1分チャレンジ達成';
  if (sec >= 30) return 'しっかり話せた';
  if (sec >= 10) return '今日の練習クリア';
  if (sec >= 5) return '一声できた';
  return '小さな一声';
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
  const achievement = getAchievementLabel(record.durationSec);

  return (
    <div className="flex flex-col gap-5 p-6 bg-white rounded-2xl border border-stone-100 result-pop">
      <div className="text-center">
        <h2 className="text-xl font-bold text-stone-700">今日の記録が残りました</h2>
      </div>

      {/* 達成ラベル */}
      <div className="text-center py-3 px-4 rounded-xl bg-rose-50 text-rose-600 text-sm font-medium">
        {achievement}
      </div>

      {/* 数値 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 bg-stone-50 rounded-xl">
          <p className="text-xl font-semibold text-stone-700">{record.durationSec}</p>
          <p className="text-xs text-stone-400 mt-0.5">秒間</p>
        </div>
        <div className="flex flex-col items-center p-3 bg-stone-50 rounded-xl">
          <p className="text-xl font-semibold text-rose-500">+{record.xpEarned}</p>
          <p className="text-xs text-stone-400 mt-0.5">XP</p>
        </div>
        <div className="flex flex-col items-center p-3 bg-stone-50 rounded-xl">
          <p className="text-xl font-semibold text-stone-700">{progress.streakDays}</p>
          <p className="text-xs text-stone-400 mt-0.5">日連続</p>
        </div>
      </div>

      <p className="text-xs text-stone-400 text-center -mt-2">
        短くても、ちゃんと積み上がっています。
      </p>

      {/* 相棒の反応 */}
      <div className="bg-stone-50 rounded-xl p-4 text-center">
        <p className="text-stone-500 text-sm leading-relaxed">{reaction}</p>
      </div>

      {/* 一言メモ（あれば日記カードのように表示） */}
      {record.memo && (
        <div className="hanasu-diary-note bg-white border border-stone-100 rounded-xl p-4">
          <p className="text-xs text-stone-400 mb-1">今日のひとこと日記</p>
          <p className="text-sm text-stone-600 leading-relaxed">{record.memo}</p>
        </div>
      )}

      {/* 自己評価（任意） */}
      <div>
        <p className="text-xs text-stone-300 mb-2 text-center">今日の感想（なくてもOK）</p>
        <div className="grid grid-cols-2 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRating(r.id)}
              className={`py-3 px-2 rounded-xl text-sm transition-colors ${
                selectedRating === r.id
                  ? 'bg-rose-500 text-white'
                  : 'bg-stone-50 text-stone-500 active:scale-95 border border-stone-100'
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
