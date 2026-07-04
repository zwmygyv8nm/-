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

  // 同日2回目以上
  const sameDay = records.filter((r) => r.date === date);
  if (sameDay.length >= 2) {
    return 'もう一度来てくれたんだね。短くても大丈夫。';
  }

  // 5秒未満（クリアなし）
  if (!cleared) {
    return '少しだけでも声を出せたなら、それで十分だよ。';
  }

  // 60秒以上
  if (durationSec >= 60) {
    return '1分話せたね。長く続けられたんだ。';
  }

  // 30秒以上
  if (durationSec >= 30) {
    return '今日は少し長めに話せたね。';
  }

  // 7日連続
  if (streakDays >= 7) {
    return '7日続いたね。声を出すことが習慣になってきたかも。';
  }

  // 3日連続
  if (streakDays === 3) {
    return '3日続いたね。少しずつ習慣になってきたかも。';
  }

  // 初回クリア（クリアレコードが1件だけ）
  const clearedCount = records.filter((r) => r.cleared).length;
  if (clearedCount === 1) {
    return 'はじめの一声、ちゃんと残ったよ。';
  }

  // 通常クリア（複数候補からランダム）
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

function getAchievementLabel(sec: number): { label: string; icon: string; color: string } {
  if (sec >= 60) return { label: '1分チャレンジ達成', icon: '🌟', color: 'text-purple-600 bg-purple-50 border-purple-100' };
  if (sec >= 30) return { label: 'しっかり話せた',   icon: '🎵', color: 'text-sky-600 bg-sky-50 border-sky-100' };
  if (sec >= 10) return { label: '今日の練習クリア', icon: '🎈', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
  if (sec >= 5)  return { label: '一声できた',       icon: '🌼', color: 'text-pink-600 bg-pink-50 border-pink-100' };
  return                { label: '小さな一声',       icon: '🌱', color: 'text-amber-600 bg-amber-50 border-amber-100' };
}

type SelfRating = 'easy' | 'nervous' | 'better_than_expected' | 'retry';

const RATINGS: { id: SelfRating; label: string; emoji: string }[] = [
  { id: 'easy',                 label: '話しやすかった',   emoji: '😊' },
  { id: 'nervous',              label: 'ちょっと緊張した', emoji: '😅' },
  { id: 'better_than_expected', label: '思ったより話せた', emoji: '✨' },
  { id: 'retry',                label: 'もう一回やりたい', emoji: '🔄' },
];

export default function ResultCard({ record, progress, onHome }: ResultCardProps) {
  const [selectedRating, setSelectedRating] = useState<SelfRating | null>(null);
  const reaction = getBuddyReaction(record, progress);
  const achievement = getAchievementLabel(record.durationSec);

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-7 bg-white rounded-[1.75rem] shadow-sm border border-purple-100 result-pop">
      <div className="text-center">
        <p className="text-3xl mb-2">{record.cleared ? '🎉' : '🌱'}</p>
        <h2 className="text-xl font-bold text-gray-700">今日の記録が残りました</h2>
      </div>

      {/* 達成ラベル（カード風） */}
      <div className={`flex items-center justify-center gap-2 text-center py-3 px-4 rounded-2xl border text-sm font-medium ${achievement.color}`}>
        <span className="text-lg" aria-hidden>{achievement.icon}</span>
        <span>{achievement.label}</span>
      </div>

      {/* 数値（スタンプ風タイル） */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 bg-pink-50/70 rounded-2xl">
          <span className="text-base" aria-hidden>⏱️</span>
          <p className="text-xl font-semibold text-pink-500 mt-0.5">{record.durationSec}</p>
          <p className="text-xs text-gray-400 mt-0.5">秒間</p>
        </div>
        <div className="flex flex-col items-center p-3 bg-amber-50/70 rounded-2xl">
          <span className="text-base" aria-hidden>✨</span>
          <p className="text-xl font-semibold text-amber-500 mt-0.5">+{record.xpEarned}</p>
          <p className="text-xs text-gray-400 mt-0.5">XP</p>
        </div>
        <div className="flex flex-col items-center p-3 bg-sky-50/70 rounded-2xl">
          <span className="text-base" aria-hidden>🔥</span>
          <p className="text-xl font-semibold text-sky-500 mt-0.5">{progress.streakDays}</p>
          <p className="text-xs text-gray-400 mt-0.5">日連続</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center -mt-2">
        短くても、ちゃんと積み上がっています。
      </p>

      {/* 相棒の反応 */}
      <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-4 text-center">
        <p className="text-gray-500 text-sm leading-relaxed">{reaction}</p>
      </div>

      {/* 一言メモ（あれば日記カードのように表示） */}
      {record.memo && (
        <div className="hanasu-diary-note bg-amber-50/60 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs text-amber-500 mb-1">📔 今日のひとこと日記</p>
          <p className="text-sm text-gray-600 leading-relaxed">{record.memo}</p>
        </div>
      )}

      {/* 自己評価（任意） */}
      <div>
        <p className="text-xs text-gray-300 mb-2 text-center">今日の感想（なくてもOK）</p>
        <div className="grid grid-cols-2 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRating(r.id)}
              className={`py-3 px-2 rounded-2xl text-sm transition-all flex items-center gap-1 justify-center ${
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
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-400 to-orange-300 text-white font-medium active:scale-95 transition-transform"
      >
        ホームに戻る
      </button>
    </div>
  );
}
