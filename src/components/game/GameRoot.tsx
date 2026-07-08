"use client";

import { useGameStore } from "@/lib/game/store";
import { GameCanvas } from "./GameCanvas";
import { BattleHud } from "./ui/BattleHud";
import { SkillPanel } from "./ui/SkillPanel";

/** ゲーム画面全体。Canvasの上にDOMのUIを重ねる。 */
export default function GameRoot() {
  // 一次関数の方向指定中は照準カーソルにする。
  const aiming = useGameStore((s) => s.aimingUnitId !== null);
  return (
    <div
      className={`fixed inset-0 overflow-hidden bg-slate-950 text-slate-100 ${
        aiming ? "cursor-crosshair" : ""
      }`}
    >
      <div className="absolute inset-0">
        <GameCanvas />
      </div>
      <BattleHud />
      <SkillPanel />
    </div>
  );
}
