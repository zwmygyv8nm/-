import { describe, expect, it } from "vitest";
import type { GameState, Unit } from "@/types/game";
import { isAlive } from "../combat";
import { createInitialState, DT } from "../defs";
import {
  FIELD_MAX_X,
  FIELD_MAX_Z,
  FIELD_MIN_X,
  FIELD_MIN_Z,
  isBlockedAtWorld,
} from "../grid";
import { tick } from "../simulate";

function downUnit(u: Unit) {
  u.hp = 0;
  u.aiState = "down";
  u.targetId = null;
  u.knockback = null;
}

function runTicks(state: GameState, n: number) {
  for (let i = 0; i < n; i++) tick(state, DT);
}

describe("tick", () => {
  it("敵が全滅したら won になり、その後は時間が進まない", () => {
    const state = createInitialState();
    for (const u of state.units) {
      if (u.team === "enemy") downUnit(u);
    }
    tick(state, DT);
    expect(state.phase).toBe("won");

    const frozen = state.gameTime;
    runTicks(state, 30);
    expect(state.gameTime).toBe(frozen); // 勝敗決定後にtickが進み続けない
  });

  it("味方が全滅したら lost になる", () => {
    const state = createInitialState();
    for (const u of state.units) {
      if (u.team === "ally") downUnit(u);
    }
    tick(state, DT);
    expect(state.phase).toBe("lost");
  });

  it("ターゲットがダウンしたら次のtickで生存中の敵に取り直す", () => {
    const state = createInitialState();
    const ally = state.units.find((u) => u.id === "ally-english")!;
    const oldTarget = state.units.find((u) => u.id === "enemy-math")!;
    ally.targetId = oldTarget.id;
    downUnit(oldTarget);

    tick(state, DT);
    expect(ally.targetId).not.toBe(oldTarget.id);
    expect(ally.targetId).not.toBeNull();
    const newTarget = state.units.find((u) => u.id === ally.targetId)!;
    expect(isAlive(newTarget)).toBe(true);
  });

  it("入力キューの味方スキル指示が消化される", () => {
    const state = createInitialState();
    const math = state.units.find((u) => u.id === "ally-math")!;
    math.skillCooldown = 0;
    state.inputQueue.push(math.id);
    tick(state, DT);
    expect(state.inputQueue).toEqual([]);
    expect(math.skillCooldown).toBeGreaterThan(0); // 発動してCDが入った
  });

  it("敵ユニットのスキル指示は入力キューから無視される", () => {
    const state = createInitialState();
    const enemy = state.units.find((u) => u.id === "enemy-math")!;
    // 敵AI自身が同tickで発動しないよう、射線の通らない位置に置く。
    enemy.pos = { x: 1.5, z: 1.5 };
    enemy.skillCooldown = 0;
    state.inputQueue.push(enemy.id);
    tick(state, DT);
    // 敵はプレイヤー入力では発動しない(直前スキル記録もされない)。
    expect(state.lastSkillByTeam.enemy).toBeNull();
    expect(enemy.skillCooldown).toBe(0);
  });

  it("20秒回してもユニットが場外・遮蔽物内・NaNにならない(統合サニティ)", () => {
    const state = createInitialState();
    let dealtDamage = false;

    for (let i = 0; i < 600; i++) {
      tick(state, DT);
      for (const u of state.units) {
        expect(Number.isFinite(u.pos.x)).toBe(true);
        expect(Number.isFinite(u.pos.z)).toBe(true);
        if (!isAlive(u)) continue;
        expect(u.pos.x).toBeGreaterThanOrEqual(FIELD_MIN_X);
        expect(u.pos.x).toBeLessThanOrEqual(FIELD_MAX_X);
        expect(u.pos.z).toBeGreaterThanOrEqual(FIELD_MIN_Z);
        expect(u.pos.z).toBeLessThanOrEqual(FIELD_MAX_Z);
        expect(isBlockedAtWorld(state.grid, u.pos)).toBe(false);
      }
      if (state.units.some((u) => u.hp < u.maxHp)) dealtDamage = true;
      if (state.phase !== "playing") break;
    }
    expect(dealtDamage).toBe(true); // 自動戦闘が実際に進行している
  });
});
