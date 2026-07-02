import type { Metadata } from "next";
import GameClient from "@/components/game/GameClient";

export const metadata: Metadata = {
  title: "放課後タクティクス | 3Dリアルタイム演習バトル",
  description:
    "放課後の教室を舞台にした3対3のリアルタイム演習バトル。ユニットは自動で戦い、プレイヤーは科目スキルの発動タイミングを指示する。",
};

export default function GamePage() {
  return <GameClient />;
}
