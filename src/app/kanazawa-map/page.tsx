import type { Metadata } from "next";
import KanazawaMap3D from "@/components/KanazawaMap3D";

export const metadata: Metadata = {
  title: "金沢高等学校 3Dキャンパスマップ",
  description:
    "石川県金沢市泉本町の私立金沢高等学校のキャンパスをイメージ再現した、操作できる3Dマップ。校舎・体育館・人工芝グラウンドなどの施設を紹介します。",
};

export default function KanazawaMapPage() {
  return <KanazawaMap3D />;
}
