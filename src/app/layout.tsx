import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "はなす日記",
  description:
    "話すのが苦手な人のための、毎日1分スピーキング練習アプリ。お題に答えて声を録音すると、相棒が育ち、話す時間・連続日数・カテゴリ別の練習状況が記録されます。採点なし・音声ファイル非保存。",
  keywords: ["スピーキング練習", "発話練習", "日本語", "話す習慣", "録音"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
