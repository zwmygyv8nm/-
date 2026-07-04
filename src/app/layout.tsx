import type { Metadata, Viewport } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

const mPlusRounded = M_PLUS_Rounded_1c({
  variable: "--font-klee",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "やることポータル",
  description:
    "はなす日記(スピーキング練習)・放課後タクティクス(3Dリアルタイム演習バトル)・じぶん自習校(自習タイマー)をまとめたミニアプリポータル。",
  keywords: ["スピーキング練習", "3Dバトル", "自習タイマー", "学習アプリ", "ポータル"],
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
    <html lang="ja" className={`${mPlusRounded.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
