import type { Metadata } from "next";
import StudyApp from "@/components/study/StudyApp";

export const metadata: Metadata = {
  title: "じぶん自習校",
  description:
    "スマホ逃避を、25分の自習に変える。自分専用のバーチャル自習校アプリ。",
};

export default function StudyPage() {
  return <StudyApp />;
}
