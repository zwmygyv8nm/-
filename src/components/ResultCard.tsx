'use client';

import { useState } from 'react';
import type { SpeechRecord, UserProgress } from '../types';

type ResultCardProps = {
  record: SpeechRecord;
  progress: UserProgress;
  onHome: () => void;
};

const BUDDY_REACTIONS = [
  '声を出せたね。今日はそれで十分。',
  '短くても、ちゃんと記録になったよ。',
  '少しずつで大丈夫。',
  '今日の一声、残しておいたよ。',
  'また話したくなったら、いつでも戻ってきてね。',
  'よく来てくれたね。',
  '声が聞けてよかった。',
  '続けることが一番大事だよ。',
  '今日もいっしょに過ごせてよかった。',
  'ゆっくりでいいんだよ。',
  '無理しなくていいよ。',
  '今日の声、ちゃんと覚えてるよ。',
  'また明日も待ってるよ。',
  '話せた分だけ、積み重なってるよ。',
  '今日もお疲れさま。',
  '声に出せただけで、もう一歩だよ。',
  '上手じゃなくてもいいんだよ。',
  'また来てね。',
  '今日の練習、しっかり記録したよ。',
  '明日もいっしょにやろうね。',
];

function getAchievementLabel(sec: number): { label: string; color: string } {
  if (sec >= 60) return { label: '1分チャレンジ達成', color: 'text-purple-600 bg-purple-50 border-purple-200' };
  if (sec >= 30) return { label: 'しっかり話せた', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  if (sec >= 10) return { label: '今日の練習クリア', color: 'text-green-600 bg-green-50 border-green-200' };
  return { label: '一声できた', color: 'text-pink-600 bg-pink-50 border-pink-200' };
}

type SelfRating = 'easy' | 'nervous' | 'better_than_expected' | 'retry';

const RATINGS: { id: SelfRating; label: string; emoji: string }[] = [
  { id: 'easy', label: '話しやすかった', emoji: '😊' },
  { id: 'nervous', label: 'ちょっと緊張した', emoji: '😅' },
  { id: 'better_than_expected', label: '思ったより話せた', emoji: '✨' },
  { id: 'retry', label: 'もう一回やりたい', emoji: '🔄' },
];

export default function ResultCard({ record, progress, onHome }: ResultCardProps) {
  const [selectedRating, setSelectedRating] = useState<SelfRating | null>(null);
  const reactionIndex = (record.xpEarned + record.durationSec) % BUDDY_REACTIONS.length;
  const reaction = BUDDY_REACTIONS[reactionIndex];
  const achievement = getAchievementLabel(record.durationSec);

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-3xl shadow-sm border border-purple-100 result-pop">
      <div className="text-center">
        <p className="text-3xl mb-2">🎉</p>
        <h2 className="text-xl font-bold text-gray-700">今日も話せました</h2>
      </div>

      <div className={`text-center py-3 px-4 rounded-2xl border ${achievement.color}`}>
        <p className="font-medium text-sm">{achievement.label}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 bg-pink-50 rounded-2xl">
          <p className="text-2xl font-bold text-pink-500">{record.durationSec}</p>
          <p className="text-xs text-gray-400 mt-1">秒間</p>
        </div>
        <div className="flex flex-col items-center p-3 bg-purple-50 rounded-2xl">
          <p className="text-2xl font-bold text-purple-500">+{record.xpEarned}</p>
          <p className="text-xs text-gray-400 mt-1">XP</p>
        </div>
        <div className="flex flex-col items-center p-3 bg-green-50 rounded-2xl">
          <p className="text-2xl font-bold text-green-500">{progress.streakDays}</p>
          <p className="text-xs text-gray-400 mt-1">日連続</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-5 text-center">
        <p className="text-gray-500 text-sm leading-relaxed">{reaction}</p>
      </div>

      <div>
        <p className="text-xs text-gray-300 mb-3 text-center">今日の感想（なくてもOK）</p>
        <div className="grid grid-cols-2 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRating(r.id)}
              className={`py-3 px-3 rounded-2xl text-sm transition-all flex items-center gap-1 justify-center ${
                selectedRating === r.id
                  ? 'bg-purple-400 text-white'
                  : 'bg-gray-50 text-gray-500 active:scale-95 border border-gray-100'
              }`}
            >
              <span>{r.emoji}</span>
              <span>{r.label}</span>
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
