import type { GameState } from "@/types/game";
import { updateEnemySkillAI, updateUnitAI } from "./ai";
import { aliveCount, getUnit, isAlive, setNotice } from "./combat";
import { applyKnockback, followPath, separateUnits } from "./movement";
import { castSkill } from "./skills";

/**
 * メインのシミュレーションtick(固定タイムステップで呼ばれる)。
 * phase が playing でなければ何もしない(勝敗決定後に時間・演出が進まない)。
 */
export function tick(state: GameState, dt: number): void {
  if (state.phase !== "playing") return;

  state.gameTime += dt;

  // 1. クールダウン・経路エイジの進行
  for (const u of state.units) {
    if (!isAlive(u)) continue;
    u.attackCooldown = Math.max(0, u.attackCooldown - dt);
    u.skillCooldown = Math.max(0, u.skillCooldown - dt);
    u.pathAge += dt;
  }

  // 2. プレイヤー入力(スキル発動指示)の消化
  if (state.inputQueue.length > 0) {
    const queue = state.inputQueue.splice(0, state.inputQueue.length);
    for (const order of queue) {
      const u = getUnit(state, order.unitId);
      if (u && u.team === "ally") castSkill(state, u, order.dir);
    }
  }

  // 3. AI(ターゲット選択・攻撃・経路確保)
  for (const u of state.units) {
    updateUnitAI(state, u);
  }

  // 4. 移動(ノックバック優先、それ以外は経路追従)+ 押し離し
  for (const u of state.units) {
    if (!isAlive(u)) continue;
    if (u.knockback) applyKnockback(state, u, dt);
    else if (u.aiState === "moving") followPath(state, u, dt);
  }
  separateUnits(state);

  // 5. 敵の簡易スキルAI
  for (const u of state.units) {
    updateEnemySkillAI(state, u);
  }

  // 6. 演出の寿命処理
  if (state.effects.length > 0) {
    state.effects = state.effects.filter((e) => e.until > state.gameTime);
  }
  if (state.notice && state.notice.until <= state.gameTime) {
    state.notice = null;
  }

  // 7. 勝敗判定
  const enemies = aliveCount(state, "enemy");
  const allies = aliveCount(state, "ally");
  if (enemies === 0) {
    state.phase = "won";
    state.effects = [];
    setNotice(state, "演習終了 — 勝利!", 999);
  } else if (allies === 0) {
    state.phase = "lost";
    state.effects = [];
    setNotice(state, "演習終了 — 敗北…", 999);
  }
}
