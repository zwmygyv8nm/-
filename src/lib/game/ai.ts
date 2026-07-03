import type { GameState, Unit } from "@/types/game";
import { findPath } from "./astar";
import { addEffect, applyDamage, getUnit, isAlive, nearestFoe } from "./combat";
import { SKILL_PARAMS, SUBJECT_COLOR } from "./defs";
import { cellIndex, worldToCell } from "./grid";
import { hasLineOfSight } from "./los";
import { castSkill } from "./skills";
import { dist, normalize, sub, yawFromDir } from "./vec";

/** 経路の定期再計算間隔(秒)。 */
const PATH_RECOMPUTE_INTERVAL = 0.6;

/**
 * ユニット1体のAI: ターゲット選択 → 射程内かつ射線ありなら攻撃、
 * それ以外は moving にして経路を確保する(移動の適用は movement 側)。
 */
export function updateUnitAI(state: GameState, unit: Unit): void {
  if (!isAlive(unit)) return;

  // ターゲット検証: 未設定 or ダウン済みなら最も近い敵に取り直す。
  let target = unit.targetId ? getUnit(state, unit.targetId) : undefined;
  if (!target || !isAlive(target)) {
    const next = nearestFoe(state, unit);
    unit.targetId = next?.id ?? null;
    unit.path = [];
    unit.pathTargetCell = -1;
    target = next ?? undefined;
  }
  if (!target) {
    unit.aiState = "idle";
    return;
  }

  // ノックバック中は行動不能(移動処理側で押し出しだけ消化される)。
  if (unit.knockback) {
    unit.aiState = "moving";
    return;
  }

  const d = dist(unit.pos, target.pos);
  const canShoot =
    d <= unit.attackRange && hasLineOfSight(state.grid, unit.pos, target.pos);

  if (canShoot) {
    unit.aiState = "attacking";
    unit.path = [];
    unit.pathTargetCell = -1;
    unit.facing = yawFromDir(normalize(sub(target.pos, unit.pos)));
    if (unit.attackCooldown <= 0) {
      unit.attackCooldown = unit.attackInterval;
      applyDamage(state, target, unit.attackDamage);
      addEffect(state, "shot", unit.pos, target.pos, 0.15, SUBJECT_COLOR[unit.subject]);
    }
  } else {
    unit.aiState = "moving";
    ensurePath(state, unit, target);
  }
}

/** 経路が古い・無い・ターゲットセルが変わった場合にA*を引き直す。 */
function ensurePath(state: GameState, unit: Unit, target: Unit): void {
  const targetCell = worldToCell(target.pos);
  const targetIdx = cellIndex(targetCell.col, targetCell.row);
  const stale =
    unit.path.length === 0 ||
    unit.pathAge >= PATH_RECOMPUTE_INTERVAL ||
    unit.pathTargetCell !== targetIdx;
  if (!stale) return;

  unit.path = findPath(state.grid, worldToCell(unit.pos), targetCell);
  unit.pathAge = 0;
  unit.pathTargetCell = targetIdx;
}

/**
 * 敵ユニットの簡易スキルAI: クールダウンが明けていて発動条件を満たしたら即使用。
 * 条件は castSkill 側の検証と同じなので、ここでは軽い事前チェックだけ行う。
 */
export function updateEnemySkillAI(state: GameState, unit: Unit): void {
  if (unit.team !== "enemy" || !isAlive(unit) || unit.skillCooldown > 0) return;
  const target = unit.targetId ? getUnit(state, unit.targetId) : undefined;
  if (!target || !isAlive(target)) return;

  switch (unit.skillId) {
    case "linearFunction":
      if (hasLineOfSight(state.grid, unit.pos, target.pos)) castSkill(state, unit);
      break;
    case "knockback":
      if (
        dist(unit.pos, target.pos) <= SKILL_PARAMS.knockbackRange &&
        hasLineOfSight(state.grid, unit.pos, target.pos)
      ) {
        castSkill(state, unit);
      }
      break;
    case "dokkai":
      castSkill(state, unit);
      break;
    case "shadowing": {
      const last = state.lastSkillByTeam[unit.team];
      if (last && last.skillId !== "shadowing") castSkill(state, unit);
      break;
    }
  }
}
