'use client';

type BuddyCardProps = {
  buddyStage: number;
  totalXp: number;
};

const BUDDY_DATA = [
  {
    stage: 1,
    emoji: '🌱',
    ring: 'from-amber-50 to-rose-50',
    decoration: null,
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
    ring: 'from-emerald-50 to-teal-50',
    decoration: '🍃',
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
    ring: 'from-pink-50 to-fuchsia-50',
    decoration: '✨',
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
    ring: 'from-orange-50 to-amber-100',
    decoration: '🌤️',
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
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className={`w-28 h-28 rounded-full bg-gradient-to-br ${data.ring} flex items-center justify-center text-6xl shadow-sm buddy-float`}
        >
          {data.emoji}
        </div>
        {data.decoration && (
          <span className="absolute -top-1 -right-1 text-xl select-none" aria-hidden>
            {data.decoration}
          </span>
        )}
      </div>

      {/* 小さな吹き出し */}
      <div className="relative bg-white/85 rounded-2xl px-4 py-2.5 max-w-[240px] shadow-sm">
        <span className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white/85 rotate-45" />
        <p className="relative text-center text-gray-500 text-sm leading-relaxed">{line}</p>
      </div>

      <p className="text-xs text-gray-300">相棒 Lv.{buddyStage}</p>
    </div>
  );
}
