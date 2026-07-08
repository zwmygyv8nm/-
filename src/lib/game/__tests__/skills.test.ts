import { beforeEach, describe, expect, it } from "vitest";
import type { GameState, Unit } from "@/types/game";
import { createInitialState, SKILL_COOLDOWN, SKILL_PARAMS } from "../defs";
import { castSkill } from "../skills";

let state: GameState;
let english: Unit; // シャドーイング持ち
let math: Unit; // 一次関数持ち
let physics: Unit; // ノックバック持ち
let enemyTarget: Unit;

// row4(z=-0.5)は遮蔽物のない行。テストはこの行に一直線に並べる。
beforeEach(() => {
  state = createInitialState();
  english = state.units.find((u) => u.id === "ally-english")!;
  math = state.units.find((u) => u.id === "ally-math")!;
  physics = state.units.find((u) => u.id === "ally-physics")!;
  enemyTarget = state.units.find((u) => u.id === "enemy-math")!;

  for (const u of state.units) u.skillCooldown = 0;

  // 邪魔にならない位置へ退避(row9帯)。
  for (const u of state.units) {
    if (u === english || u === math || u === enemyTarget) continue;
    u.pos = { x: u.team === "ally" ? -6.5 : 6.5, z: 4.5 };
  }
  math.pos = { x: -3.5, z: -0.5 };
  english.pos = { x: -5.5, z: -0.5 };
  enemyTarget.pos = { x: 3.5, z: -0.5 };
  math.targetId = enemyTarget.id;
  english.targetId = enemyTarget.id;
});

describe("一次関数(数学)", () => {
  it("直線上の敵にダメージを与え、直前スキルとして記録される", () => {
    const before = enemyTarget.hp;
    const res = castSkill(state, math);
    expect(res.ok).toBe(true);
    expect(enemyTarget.hp).toBe(before - SKILL_PARAMS.beamDamage);
    expect(state.lastSkillByTeam.ally?.skillId).toBe("linearFunction");
    expect(math.skillCooldown).toBe(SKILL_COOLDOWN.linearFunction);
  });

  it("遮蔽物の向こうの敵には当たらない(ビームが止まる)", () => {
    // 中央机(6,6)の後ろ: row6 は (6,6),(7,6) が塞がっている。
    math.pos = { x: -3.5, z: 1.5 };
    enemyTarget.pos = { x: 3.5, z: 1.5 };
    const before = enemyTarget.hp;
    const res = castSkill(state, math);
    expect(res.ok).toBe(true); // 発動自体はする(手前で止まる)
    expect(enemyTarget.hp).toBe(before);
  });

  it("方向指定(エイム)するとターゲット方向ではなく指定方向へ撃つ", () => {
    // 指定方向(+z)上に別の敵を置き、現在のターゲットは線から外れた位置に置く。
    const aimVictim = state.units.find((u) => u.id === "enemy-physics")!;
    aimVictim.pos = { x: -3.5, z: 3.5 }; // math(-3.5,-0.5) の真下(+z)
    const targetBefore = enemyTarget.hp; // ターゲットは (3.5,-0.5) = +x 方向
    const victimBefore = aimVictim.hp;

    const res = castSkill(state, math, { x: 0, z: 1 });
    expect(res.ok).toBe(true);
    expect(aimVictim.hp).toBe(victimBefore - SKILL_PARAMS.beamDamage);
    expect(enemyTarget.hp).toBe(targetBefore); // ターゲットには当たらない
    expect(state.lastSkillByTeam.ally?.skillId).toBe("linearFunction");
  });
});

describe("シャドーイング(英語)", () => {
  it("直前の味方スキルを0.5倍でコピーする", () => {
    castSkill(state, math);
    const before = enemyTarget.hp;
    const res = castSkill(state, english);
    expect(res.ok).toBe(true);
    expect(enemyTarget.hp).toBe(
      before - SKILL_PARAMS.beamDamage * SKILL_PARAMS.copyPowerScale,
    );
  });

  it("シャドーイング自身は記録されない(自己コピー・無限再帰しない)", () => {
    castSkill(state, math);
    castSkill(state, english);
    // コピー実行後も「直前スキル」は一次関数のまま。
    expect(state.lastSkillByTeam.ally?.skillId).toBe("linearFunction");
    // 連続で使ってもシャドーイングがコピーされることはない。
    english.skillCooldown = 0;
    const res2 = castSkill(state, english);
    expect(res2.ok).toBe(true);
    expect(state.lastSkillByTeam.ally?.skillId).toBe("linearFunction");
  });

  it("コピー元が無ければ失敗し、クールダウンを消費しない", () => {
    const res = castSkill(state, english);
    expect(res.ok).toBe(false);
    expect(english.skillCooldown).toBe(0);
  });

  it("直前スキルがシャドーイングでも失敗する(異常データ防御)", () => {
    state.lastSkillByTeam.ally = {
      skillId: "shadowing",
      casterId: english.id,
      at: 0,
    };
    const res = castSkill(state, english);
    expect(res.ok).toBe(false);
  });
});

describe("ノックバック(物理)", () => {
  it("射程内の敵を外向きに押し出す状態にする", () => {
    physics.pos = { x: 2.0, z: -0.5 };
    physics.targetId = enemyTarget.id;
    const res = castSkill(state, physics);
    expect(res.ok).toBe(true);
    expect(enemyTarget.knockback).not.toBeNull();
    expect(enemyTarget.knockback!.dir.x).toBeGreaterThan(0); // 自分から見て外向き
    expect(enemyTarget.knockback!.remaining).toBeCloseTo(
      SKILL_PARAMS.knockbackDistance,
      5,
    );
  });

  it("射程外なら失敗してクールダウンを消費しない", () => {
    physics.pos = { x: -6, z: -0.5 };
    physics.targetId = enemyTarget.id;
    const res = castSkill(state, physics);
    expect(res.ok).toBe(false);
    expect(physics.skillCooldown).toBe(0);
  });
});

describe("読解(国語)", () => {
  it("対象の revealedUntil を設定する(ロジックへの影響なし)", () => {
    const dokkaiEnemy = state.units.find((u) => u.id === "enemy-japanese")!;
    dokkaiEnemy.pos = { x: 3.5, z: -1.5 };
    dokkaiEnemy.targetId = math.id;
    const posBefore = { ...math.pos };
    const hpBefore = math.hp;
    const res = castSkill(state, dokkaiEnemy);
    expect(res.ok).toBe(true);
    expect(math.revealedUntil).toBeGreaterThan(state.gameTime);
    expect(math.hp).toBe(hpBefore);
    expect(math.pos).toEqual(posBefore);
  });
});

describe("ダウン中の発動", () => {
  it("ダウンしたユニットはスキルを使えない", () => {
    math.aiState = "down";
    const res = castSkill(state, math);
    expect(res.ok).toBe(false);
  });
});
