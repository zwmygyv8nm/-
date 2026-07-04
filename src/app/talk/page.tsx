import type { Metadata } from "next";
import TalkApp from "@/components/TalkApp";

export const metadata: Metadata = {
  title: "はなす日記",
  description:
    "話すのが苦手な人のための、毎日1分スピーキング練習アプリ。お題に答えて声を録音すると、相棒が育ち、話す時間・連続日数・カテゴリ別の練習状況が記録されます。採点なし・音声ファイル非保存。",
  keywords: ["スピーキング練習", "発話練習", "日本語", "話す習慣", "録音"],
};

export default function TalkPage() {
  return <TalkApp />;
}
