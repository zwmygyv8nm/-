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
      'はじめまして。いっしょにいるよ。',
      'どんな話でも聞いてるよ。',
      'まず声を出すことが大事だよ。',
      '短くてもOK。ここにいるよ。',
      'ゆっくりでいいんだよ。',
    ],
  },
  {
    stage: 2,
    emoji: '🌿',
    lines: [
      '少しずつ話せてきたね。',
      '声が聞けてうれしいよ。',
      'いい調子だよ。',
      'また話してね、待ってるよ。',
      '今日も来てくれてよかった。',
    ],
  },
  {
    stage: 3,
    emoji: '🌸',
    lines: [
      '声が出てきたね。いい感じだよ。',
      '毎日聞けて楽しいな。',
      'だんだんと続いてきたね。',
      '今日の声も受け取ったよ。',
      '無理しなくていいんだよ。',
    ],
  },
  {
    stage: 4,
    emoji: '🌳',
    lines: [
      '毎日話してくれてありがとう。',
      'ここまで続けてきたね。',
      '一緒に成長できてうれしいよ。',
      '今日もよく来てくれたね。',
      'これからも声を聞かせてね。',
    ],
  },
];

export default function BuddyCard({ buddyStage, totalXp }: BuddyCardProps) {
  const data = BUDDY_DATA[Math.min(buddyStage - 1, 3)];
  const lineIndex = totalXp % data.lines.length;
  const line = data.lines[lineIndex];

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-sm border border-pink-100">
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-6xl shadow-inner buddy-float">
        {data.emoji}
      </div>
      <p className="text-center text-gray-500 text-sm leading-relaxed px-4">{line}</p>
      <p className="text-xs text-gray-300">相棒 Lv.{buddyStage}</p>
    </div>
  );
}
