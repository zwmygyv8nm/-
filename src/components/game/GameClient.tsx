"use client";

import dynamic from "next/dynamic";

// three.js / R3F は window に依存するため、SSR(プリレンダー)を無効にして
// クライアントでのみ読み込む。`ssr: false` は Client Component 内でのみ有効
// (Next.js 16 同梱ドキュメント lazy-loading.md 参照)なので、この薄い
// クライアント層を挟んでいる。
const GameRoot = dynamic(() => import("./GameRoot"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 grid place-items-center bg-slate-950 text-sm text-slate-300">
      演習フィールドを準備中…
    </div>
  ),
});

export default function GameClient() {
  return <GameRoot />;
}
