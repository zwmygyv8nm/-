'use client';

type BuddyCardProps = {
  buddyStage: number;
  totalXp: number;
};

const BUDDY_DATA = [
  {
    stage: 1,
    emoji: '🌱',
    lines: [
      'はじめまして！いっしょにがんばろう',
      'まず声を出すことが大事だよ',
      'どんな話でも聞いてるよ',
    ],
  },
  {
    stage: 2,
    emoji: '🌿',
    lines: [
      '少しずつ話せてきたね',
      '声が聞けてうれしいよ',
      'いい調子だよ、続けようね',
    ],
  },
  {
    stage: 3,
    emoji: '🌸',
    lines: [
      '声が出てきたね、いい感じだよ',
      'だんだん話すのが楽しくなってきたかな',
      '毎日聞けて楽しいな',
    ],
  },
  {
    stage: 4,
    emoji: '🌳',
    lines: [
      '毎日話してくれてありがとう',
      'ここまで続けてきたね、すごいよ',
      '一緒に成長できてうれしいよ',
    ],
  },
];

export default function BuddyCard({ buddyStage, totalXp }: BuddyCardProps) {
  const data = BUDDY_DATA[Math.min(buddyStage - 1, 3)];
  const lineIndex = totalXp % data.lines.length;
  const line = data.lines[lineIndex];

  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl shadow-sm border border-pink-100">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-5xl shadow-inner">
        {data.emoji}
      </div>
      <p className="text-center text-gray-600 text-sm leading-relaxed px-2">{line}</p>
      <p className="text-xs text-gray-400">相棒 Lv.{buddyStage}</p>
    </div>
  );
}
