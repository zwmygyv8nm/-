'use client';

import { useState } from 'react';
import type { SpeechRecord } from '../types';
import type { UserProgress } from '../types';

type ResultCardProps = {
  record: SpeechRecord;
  progress: UserProgress;
  onHome: () => void;
};

const BUDDY_REACTIONS = [
  '話してくれてよかった！',
  'また聞かせてね',
  '声が聞けてうれしいよ',
  '続けることが一番大事だよ',
  'ゆっくりでいいんだよ',
];

type SelfRating = 'easy' | 'nervous' | 'better_than_expected' | 'retry';

const RATINGS: { id: SelfRating; label: string }[] = [
  { id: 'easy', label: '話しやすかった' },
  { id: 'nervous', label: 'ちょっと緊張した' },
  { id: 'better_than_expected', label: '思ったより話せた' },
  { id: 'retry', label: 'もう一度やりたい' },
];

export default function ResultCard({ record, progress, onHome }: ResultCardProps) {
  const [selectedRating, setSelectedRating] = useState<SelfRating | null>(null);
  const reactionIndex = record.xpEarned % BUDDY_REACTIONS.length;
  const reaction = BUDDY_REACTIONS[reactionIndex];

  return (
    <div className="flex flex-col gap-5 p-6 bg-white rounded-3xl shadow-sm border border-purple-100">
      <div className="text-center">
        <p className="text-2xl">🎉</p>
        <h2 className="text-xl font-bold text-gray-800 mt-1">今日も話せました</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 bg-pink-50 rounded-2xl">
          <p className="text-2xl font-bold text-pink-500">{record.durationSec}</p>
          <p className="text-xs text-gray-500 mt-1">秒間</p>
        </div>
        <div className="flex flex-col items-center p-3 bg-purple-50 rounded-2xl">
          <p className="text-2xl font-bold text-purple-500">+{record.xpEarned}</p>
          <p className="text-xs text-gray-500 mt-1">XP</p>
        </div>
        <div className="flex flex-col items-center p-3 bg-mint-50 bg-green-50 rounded-2xl">
          <p className="text-2xl font-bold text-green-500">{progress.streakDays}</p>
          <p className="text-xs text-gray-500 mt-1">日連続</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 text-center">
        <p className="text-gray-600 text-sm">{reaction}</p>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-2 text-center">今日の感想（任意）</p>
        <div className="grid grid-cols-2 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRating(r.id)}
              className={`py-2 px-3 rounded-xl text-sm transition-all ${
                selectedRating === r.id
                  ? 'bg-purple-400 text-white'
                  : 'bg-gray-100 text-gray-600 active:scale-95'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onHome}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium active:scale-95 transition-transform"
      >
        ホームに戻る
      </button>
    </div>
  );
}
