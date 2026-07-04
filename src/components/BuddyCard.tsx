'use client';

type BuddyCardProps = {
  buddyStage: number;
  totalXp: number;
};

// 育ち具合を「色相を変える」のではなく「同じ色の濃淡」で表す
const BUDDY_DATA = [
  {
    stage: 1,
    emoji: '🌱',
    ring: 'from-rose-50 to-orange-50',
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
    ring: 'from-rose-100 to-orange-50',
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
    ring: 'from-rose-100 to-rose-50',
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
    ring: 'from-rose-200 to-rose-100',
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
    <div className="flex flex-col items-center gap-3">
      <div
        className={`w-24 h-24 rounded-full bg-gradient-to-br ${data.ring} flex items-center justify-center text-5xl shadow-sm buddy-float`}
      >
        {data.emoji}
      </div>

      {/* 小さな吹き出し */}
      <div className="relative bg-white rounded-2xl px-4 py-2.5 max-w-[240px] shadow-sm">
        <span className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
        <p className="relative text-center text-stone-500 text-sm leading-relaxed">{line}</p>
      </div>

      <p className="text-xs text-stone-300">相棒 Lv.{buddyStage}</p>
    </div>
  );
}
