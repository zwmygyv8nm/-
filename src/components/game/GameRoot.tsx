"use client";

import { GameCanvas } from "./GameCanvas";
import { BattleHud } from "./ui/BattleHud";
import { SkillPanel } from "./ui/SkillPanel";

/** ゲーム画面全体。Canvasの上にDOMのUIを重ねる。 */
export default function GameRoot() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0">
        <GameCanvas />
      </div>
      <BattleHud />
      <SkillPanel />
    </div>
  );
}
