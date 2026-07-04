import Link from "next/link";

const APPS = [
  {
    href: "/talk",
    title: "はなす日記",
    description: "毎日1分のスピーキング練習。話して育てる相棒アプリ。",
    emoji: "🗣️",
  },
  {
    href: "/game",
    title: "放課後タクティクス",
    description: "3対3のリアルタイム演習バトル。科目スキルで戦況を動かす。",
    emoji: "⚔️",
  },
  {
    href: "/study",
    title: "じぶん自習校",
    description: "25分の自習でスマホ逃避を卒業。旅する自習室モードも。",
    emoji: "📚",
  },
] as const;

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-2xl font-bold text-center">やることポータル</h1>
      <div className="grid w-full max-w-md gap-4">
        {APPS.map((app) => (
          <Link
            key={app.href}
            href={app.href}
            className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm transition hover:shadow-md"
          >
            <span className="text-3xl">{app.emoji}</span>
            <span>
              <span className="block font-semibold">{app.title}</span>
              <span className="block text-sm text-foreground/70">
                {app.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
