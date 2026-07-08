import Link from "next/link";

interface AppCard {
  href: string | null; // null = 近日公開
  external?: boolean;
  title: string;
  description: string;
  emoji: string;
  tag: string;
  accent: string; // カード左端のアクセントカラー
}

// wt-battle-sim は別プロジェクト(React + Vite)として公開予定。
// URLが決まったら href を入れるだけでカードが有効になる。
const APPS: AppCard[] = [
  {
    href: "/talk",
    title: "はなす日記",
    description: "毎日1分のスピーキング練習。採点なし、話して育てる相棒アプリ。",
    emoji: "🗣️",
    tag: "はなす",
    accent: "#fb7185",
  },
  {
    href: "/game",
    title: "放課後タクティクス",
    description: "3対3のリアルタイム演習バトル。科目スキルで戦況を動かす3Dゲーム。",
    emoji: "⚔️",
    tag: "あそぶ",
    accent: "#818cf8",
  },
  {
    href: "/study",
    title: "じぶん自習校",
    description: "25分の自習でスマホ逃避を卒業。全国を旅する自習室モードも。",
    emoji: "📚",
    tag: "まなぶ",
    accent: "#34d399",
  },
  {
    href: null,
    external: true,
    title: "wt-battle-sim",
    description: "戦闘シミュレータ(React + Vite製)。別プロジェクトとして公開予定。",
    emoji: "🛡️",
    tag: "近日公開",
    accent: "#94a3b8",
  },
];

function CardBody({ app }: { app: AppCard }) {
  const disabled = app.href === null;
  return (
    <span
      className={`flex items-center gap-4 rounded-2xl border bg-white/70 p-5 shadow-sm transition ${
        disabled
          ? "border-black/5 opacity-55"
          : "border-black/10 hover:shadow-md hover:-translate-y-0.5"
      }`}
      style={{ borderLeftWidth: 5, borderLeftColor: app.accent }}
    >
      <span className="text-3xl" aria-hidden>
        {app.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-semibold">{app.title}</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ background: app.accent }}
          >
            {app.tag}
          </span>
        </span>
        <span className="mt-0.5 block text-sm text-foreground/70">
          {app.description}
        </span>
      </span>
      {!disabled && (
        <span className="text-foreground/30" aria-hidden>
          →
        </span>
      )}
    </span>
  );
}

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-foreground/40">
          TALK / PLAY / STUDY
        </p>
        <h1 className="mt-2 text-3xl font-bold">やることポータル</h1>
        <p className="mt-2 text-sm text-foreground/60">
          話す・遊ぶ・学ぶを、ぜんぶここから。
        </p>
      </div>

      <div className="grid w-full max-w-md gap-4">
        {APPS.map((app) =>
          app.href === null ? (
            <div key={app.title} aria-disabled>
              <CardBody app={app} />
            </div>
          ) : app.external ? (
            <a
              key={app.title}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CardBody app={app} />
            </a>
          ) : (
            <Link key={app.title} href={app.href}>
              <CardBody app={app} />
            </Link>
          ),
        )}
      </div>

      <p className="text-xs text-foreground/30">
        アカウント不要・データは端末内にのみ保存されます
      </p>
    </main>
  );
}
