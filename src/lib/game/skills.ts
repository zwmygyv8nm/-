import type { CastResult, GameState, SkillId, Unit } from "@/types/game";
import {
  addEffect,
  applyDamage,
  getUnit,
  isAlive,
  nearestFoe,
  setNotice,
} from "./combat";
import { SKILL_COOLDOWN, SKILL_LABEL, SKILL_PARAMS, SUBJECT_COLOR } from "./defs";
import { hasLineOfSight, traceBeam } from "./los";
import { dist, distPointToSegment, normalize, sub, yawFromDir } from "./vec";

interface CastOpts {
  /** ダメージ・距離・時間に掛かる倍率。シャドーイングのコピーは0.5。 */
  powerScale: number;
  /** シャドーイング経由の再実行かどうか。コピーは記録・CDを触らない。 */
  isCopy: boolean;
}

/**
 * スキル発動の入口。クールダウン・生存チェックを行い、成功時のみ
 * クールダウン設定と「直前スキル」の記録(シャドーイング以外)を行う。
 * 失敗時はクールダウンを消費しない。
 */
export function castSkill(state: GameState, caster: Unit): CastResult {
  if (state.phase !== "playing") return { ok: false, reason: "戦闘終了" };
  if (!isAlive(caster)) return { ok: false, reason: "ダウン中" };
  if (caster.skillCooldown > 0) return { ok: false, reason: "クールダウン中" };

  const result = executeSkill(state, caster, caster.skillId, {
    powerScale: 1,
    isCopy: false,
  });

  if (result.ok) {
    caster.skillCooldown = SKILL_COOLDOWN[caster.skillId];
    caster.castFlashUntil = state.gameTime + 0.4;
    if (caster.skillId !== "shadowing") {
      // シャドーイング自身はコピー対象として記録しない(自己コピー・再帰防止)。
      state.lastSkillByTeam[caster.team] = {
        skillId: caster.skillId,
        casterId: caster.id,
        at: state.gameTime,
      };
    }
  } else if (caster.team === "ally" && result.reason) {
    setNotice(
      state,
      `${caster.name}: ${SKILL_LABEL[caster.skillId]}は発動できない(${result.reason})`,
      2,
    );
  }
  return result;
}

function executeSkill(
  state: GameState,
  caster: Unit,
  skillId: SkillId,
  opts: CastOpts,
): CastResult {
  switch (skillId) {
    case "linearFunction":
      return castLinearFunction(state, caster, opts);
    case "knockback":
      return castKnockback(state, caster, opts);
    case "dokkai":
      return castDokkai(state, caster, opts);
    case "shadowing":
      return castShadowing(state, caster, opts);
  }
}

/** 現在のターゲット(生存時)か、いなければ最も近い敵。 */
function resolveTarget(state: GameState, caster: Unit): Unit | null {
  const current = caster.targetId ? getUnit(state, caster.targetId) : undefined;
  if (current && isAlive(current)) return current;
  return nearestFoe(state, caster);
}

function noticePrefix(caster: Unit): string {
  return caster.team === "enemy" ? `敵・${caster.name}` : caster.name;
}

function copySuffix(opts: CastOpts): string {
  return opts.isCopy ? "(コピー・弱)" : "";
}

/** 数学「一次関数」: ターゲット方向へ直線ビーム。遮蔽物で止まり、線上の敵を貫通ヒット。 */
function castLinearFunction(
  state: GameState,
  caster: Unit,
  opts: CastOpts,
): CastResult {
  const target = resolveTarget(state, caster);
  if (!target) return { ok: false, reason: "ターゲットなし" };

  const dir = normalize(sub(target.pos, caster.pos));
  caster.facing = yawFromDir(dir);
  const end = traceBeam(state.grid, caster.pos, dir, SKILL_PARAMS.beamMaxLength);
  const damage = SKILL_PARAMS.beamDamage * opts.powerScale;

  let hits = 0;
  for (const u of state.units) {
    if (u.team === caster.team || !isAlive(u)) continue;
    if (distPointToSegment(u.pos, caster.pos, end) <= SKILL_PARAMS.beamHitRadius) {
      applyDamage(state, u, damage);
      hits++;
    }
  }

  addEffect(state, "beam", caster.pos, end, 0.35, SUBJECT_COLOR.math);
  setNotice(
    state,
    `${noticePrefix(caster)}: 一次関数${copySuffix(opts)}! ${hits}体ヒット`,
  );
  return { ok: true };
}

/** 物理「ノックバック」: 射程内かつ射線が通る敵を外向きに押し出す。 */
function castKnockback(
  state: GameState,
  caster: Unit,
  opts: CastOpts,
): CastResult {
  const target = resolveTarget(state, caster);
  if (!target) return { ok: false, reason: "ターゲットなし" };
  const d = dist(caster.pos, target.pos);
  if (d > SKILL_PARAMS.knockbackRange) return { ok: false, reason: "射程外" };
  if (!hasLineOfSight(state.grid, caster.pos, target.pos)) {
    return { ok: false, reason: "射線が通らない" };
  }

  const dir = normalize(sub(target.pos, caster.pos));
  target.knockback = {
    dir,
    remaining: SKILL_PARAMS.knockbackDistance * opts.powerScale,
  };
  applyDamage(state, target, SKILL_PARAMS.knockbackDamage * opts.powerScale);
  addEffect(state, "shot", caster.pos, target.pos, 0.2, SUBJECT_COLOR.physics);
  setNotice(
    state,
    `${noticePrefix(caster)}: ノックバック${copySuffix(opts)}! ${target.name}を押し出した`,
  );
  return { ok: true };
}

/** 国語「読解」: 対象の狙い(ターゲットへの線)を数秒間表示する。ロジックには影響しない。 */
function castDokkai(state: GameState, caster: Unit, opts: CastOpts): CastResult {
  const target = resolveTarget(state, caster);
  if (!target) return { ok: false, reason: "ターゲットなし" };

  target.revealedUntil =
    state.gameTime + SKILL_PARAMS.revealDuration * opts.powerScale;
  const aim = target.targetId ? getUnit(state, target.targetId) : undefined;
  setNotice(
    state,
    `${noticePrefix(caster)}: 読解${copySuffix(opts)}! ${target.name}は${aim ? `${aim.name}を狙っている` : "様子をうかがっている"}`,
  );
  return { ok: true };
}

/**
 * 英語「シャドーイング」: 味方チームが直前に使ったスキルを弱体版(0.5倍)で再実行。
 * lastSkillByTeam にシャドーイングは記録されないため、自己コピー・無限再帰は構造上起きない。
 */
function castShadowing(
  state: GameState,
  caster: Unit,
  opts: CastOpts,
): CastResult {
  const last = state.lastSkillByTeam[caster.team];
  if (!last || last.skillId === "shadowing") {
    return { ok: false, reason: "コピーできるスキルがない" };
  }
  return executeSkill(state, caster, last.skillId, {
    powerScale: opts.powerScale * SKILL_PARAMS.copyPowerScale,
    isCopy: true,
  });
}
