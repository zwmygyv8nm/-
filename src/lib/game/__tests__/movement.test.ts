import { describe, expect, it } from "vitest";
import type { GameState } from "@/types/game";
import { createInitialState, DT } from "../defs";
import {
  buildGrid,
  FIELD_MAX_X,
  isBlockedAtWorld,
  UNIT_RADIUS,
} from "../grid";
import { applyKnockback, separateUnits } from "../movement";

function stateWithGrid(obstacles: Parameters<typeof buildGrid>[0]): GameState {
  const state = createInitialState();
  state.obstacles = obstacles;
  state.grid = buildGrid(obstacles);
  return state;
}

describe("applyKnockback", () => {
  it("壁に当たったら壁の内側で止まる(めり込まない)", () => {
    const state = stateWithGrid([]);
    const unit = state.units[0];
    unit.pos = { x: 6.0, z: 0 };
    unit.knockback = { dir: { x: 1, z: 0 }, remaining: 5 };

    for (let i = 0; i < 120 && unit.knockback; i++) {
      applyKnockback(state, unit, DT);
    }
    expect(unit.knockback).toBeNull();
    expect(unit.pos.x).toBeLessThanOrEqual(FIELD_MAX_X - UNIT_RADIUS + 1e-6);
  });

  it("遮蔽物に当たったら手前で止まる(セルに入らない)", () => {
    // セル(9,5) = x∈[2,3], z∈[0,1] を塞ぐ。
    const state = stateWithGrid([
      { id: "d", kind: "desk", col: 9, row: 5, cols: 1, rows: 1 },
    ]);
    const unit = state.units[0];
    unit.pos = { x: 0.5, z: 0.5 };
    unit.knockback = { dir: { x: 1, z: 0 }, remaining: 5 };

    for (let i = 0; i < 120 && unit.knockback; i++) {
      applyKnockback(state, unit, DT);
    }
    expect(unit.knockback).toBeNull();
    // 本体中心セルは塞がっていない位置で止まり、先端も遮蔽セルに入らない。
    expect(isBlockedAtWorld(state.grid, unit.pos)).toBe(false);
    expect(unit.pos.x + UNIT_RADIUS).toBeLessThanOrEqual(2 + 1e-6);
  });

  it("何にも当たらなければ指定距離だけ押される", () => {
    const state = stateWithGrid([]);
    const unit = state.units[0];
    unit.pos = { x: 0, z: 0 };
    unit.knockback = { dir: { x: 0, z: 1 }, remaining: 1.8 };

    for (let i = 0; i < 120 && unit.knockback; i++) {
      applyKnockback(state, unit, DT);
    }
    expect(unit.pos.z).toBeCloseTo(1.8, 4);
  });
});

describe("separateUnits", () => {
  it("重なったユニットを押し離し、遮蔽セルには押し込まない", () => {
    const state = stateWithGrid([]);
    const [a, b] = state.units;
    a.pos = { x: 0, z: 0 };
    b.pos = { x: 0.1, z: 0 };
    // 他のユニットは遠くへ。
    for (const u of state.units.slice(2)) u.pos = { x: -6, z: u.pos.z };

    for (let i = 0; i < 30; i++) separateUnits(state);

    const d = Math.hypot(a.pos.x - b.pos.x, a.pos.z - b.pos.z);
    expect(d).toBeGreaterThanOrEqual(UNIT_RADIUS * 2 - 1e-3);
    for (const u of state.units) {
      expect(isBlockedAtWorld(state.grid, u.pos)).toBe(false);
    }
  });
});
