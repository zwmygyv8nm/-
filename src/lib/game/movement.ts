import type { GameState, Unit } from "@/types/game";
import { SKILL_PARAMS } from "./defs";
import { clampToField, isBlockedAtWorld, UNIT_RADIUS } from "./grid";
import { isAlive } from "./combat";
import { dist, normalize, sub, yawFromDir } from "./vec";

/** ウェイポイント到達とみなす距離。 */
const WAYPOINT_REACHED = 0.15;

/** A*経路(なければターゲットへの直進)に沿って1tickぶん移動する。 */
export function followPath(state: GameState, unit: Unit, dt: number): void {
  const step = unit.moveSpeed * dt;

  // 経路が無い場合のフォールバック: ターゲットへ直進(塞がったセルには入らない)。
  if (unit.path.length === 0) {
    const target = state.units.find((u) => u.id === unit.targetId);
    if (!target) return;
    const dir = normalize(sub(target.pos, unit.pos));
    const cand = clampToField({
      x: unit.pos.x + dir.x * step,
      z: unit.pos.z + dir.z * step,
    });
    if (!isBlockedAtWorld(state.grid, cand)) {
      unit.pos = cand;
      unit.facing = yawFromDir(dir);
    }
    return;
  }

  let waypoint = unit.path[0];
  if (dist(unit.pos, waypoint) < WAYPOINT_REACHED) {
    unit.path.shift();
    if (unit.path.length === 0) return;
    waypoint = unit.path[0];
  }

  const toWp = sub(waypoint, unit.pos);
  const d = Math.hypot(toWp.x, toWp.z);
  const dir = normalize(toWp);
  if (step >= d) {
    unit.pos = { ...waypoint };
    unit.path.shift();
  } else {
    unit.pos = { x: unit.pos.x + dir.x * step, z: unit.pos.z + dir.z * step };
  }
  unit.facing = yawFromDir(dir);
}

/**
 * ノックバックを1tickぶん消化する。壁・遮蔽物に当たったらそこで停止し、
 * めり込まない(先端=ユニット半径ぶん先のセルで判定する)。
 */
export function applyKnockback(state: GameState, unit: Unit, dt: number): void {
  const kb = unit.knockback;
  if (!kb) return;

  const step = Math.min(kb.remaining, SKILL_PARAMS.knockbackSpeed * dt);
  const next = {
    x: unit.pos.x + kb.dir.x * step,
    z: unit.pos.z + kb.dir.z * step,
  };

  // 壁チェック: クランプで座標が変わる=壁に当たった。
  const clamped = clampToField(next);
  const hitWall = clamped.x !== next.x || clamped.z !== next.z;

  // 遮蔽物チェック: 進行方向の先端で判定。
  const lead = {
    x: next.x + kb.dir.x * UNIT_RADIUS,
    z: next.z + kb.dir.z * UNIT_RADIUS,
  };
  if (hitWall || isBlockedAtWorld(state.grid, lead)) {
    unit.pos = clamped.x !== next.x || clamped.z !== next.z ? clamped : unit.pos;
    unit.knockback = null;
    return;
  }

  unit.pos = next;
  kb.remaining -= step;
  if (kb.remaining <= 1e-6) unit.knockback = null;
}

/**
 * ユニット同士の重なりを簡易的に押し離す(物理エンジンなし)。
 * 押した先が遮蔽物・壁の中になる場合はその押しを取り消す。
 */
export function separateUnits(state: GameState): void {
  const alive = state.units.filter(isAlive);
  const minDist = UNIT_RADIUS * 2;

  const tryShift = (unit: Unit, dx: number, dz: number) => {
    const cand = clampToField({ x: unit.pos.x + dx, z: unit.pos.z + dz });
    if (!isBlockedAtWorld(state.grid, cand)) unit.pos = cand;
  };

  for (let i = 0; i < alive.length; i++) {
    for (let j = i + 1; j < alive.length; j++) {
      const a = alive[i];
      const b = alive[j];
      const d = dist(a.pos, b.pos);
      if (d >= minDist) continue;
      if (d < 1e-6) {
        // 完全に重なったら決め打ちでずらす。
        tryShift(a, 0.06, 0.02);
        tryShift(b, -0.06, -0.02);
        continue;
      }
      const push = (minDist - d) / 2;
      const dir = normalize(sub(a.pos, b.pos));
      tryShift(a, dir.x * push, dir.z * push);
      tryShift(b, -dir.x * push, -dir.z * push);
    }
  }

  for (const u of alive) {
    u.pos = clampToField(u.pos);
  }
}
