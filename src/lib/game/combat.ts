import type {
  GameState,
  Team,
  Unit,
  Vec2,
  VisualEffectKind,
} from "@/types/game";
import { dist } from "./vec";

export function isAlive(unit: Unit): boolean {
  return unit.aiState !== "down";
}

export function getUnit(state: GameState, id: string): Unit | undefined {
  return state.units.find((u) => u.id === id);
}

export function aliveCount(state: GameState, team: Team): number {
  return state.units.filter((u) => u.team === team && isAlive(u)).length;
}

/** unit から見て最も近い生存中の敵対ユニット。 */
export function nearestFoe(state: GameState, unit: Unit): Unit | null {
  let best: Unit | null = null;
  let bestDist = Infinity;
  for (const u of state.units) {
    if (u.team === unit.team || !isAlive(u)) continue;
    const d = dist(unit.pos, u.pos);
    if (d < bestDist) {
      bestDist = d;
      best = u;
    }
  }
  return best;
}

/** ダメージ適用。HPが0になったらその場で down にし、参照される状態を掃除する。 */
export function applyDamage(state: GameState, target: Unit, amount: number): void {
  if (!isAlive(target)) return;
  target.hp = Math.max(0, target.hp - amount);
  target.hitFlashUntil = state.gameTime + 0.18;
  if (target.hp <= 0) {
    target.aiState = "down";
    target.knockback = null;
    target.targetId = null;
    target.path = [];
    target.revealedUntil = 0;
  }
}

export function addEffect(
  state: GameState,
  kind: VisualEffectKind,
  from: Vec2,
  to: Vec2,
  duration: number,
  color: string,
): void {
  state.effects.push({
    id: state.nextEffectId++,
    kind,
    from: { ...from },
    to: { ...to },
    until: state.gameTime + duration,
    duration,
    color,
  });
}

export function setNotice(state: GameState, text: string, duration = 2.5): void {
  state.notice = { text, until: state.gameTime + duration };
}
