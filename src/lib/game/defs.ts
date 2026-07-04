import type {
  GameState,
  Obstacle,
  SkillId,
  Subject,
  Team,
  Unit,
} from "@/types/game";
import { buildGrid, cellCenter } from "./grid";

/** シミュレーションの固定タイムステップ(30Hz)。 */
export const DT = 1 / 30;
/** タブ復帰などで delta が跳ねたときのクランプ上限(秒)。 */
export const MAX_FRAME_DELTA = 0.1;
/** 1フレームで消化する最大tick数(スパイラル防止)。 */
export const MAX_TICKS_PER_FRAME = 4;

export const SUBJECT_LABEL: Record<Subject, string> = {
  english: "英語",
  math: "数学",
  japanese: "国語",
  physics: "物理",
};

export const SUBJECT_COLOR: Record<Subject, string> = {
  english: "#3b82f6",
  math: "#10b981",
  japanese: "#ef4444",
  physics: "#f59e0b",
};

export const TEAM_COLOR: Record<Team, string> = {
  ally: "#22d3ee",
  enemy: "#f43f5e",
};

export const SKILL_LABEL: Record<SkillId, string> = {
  shadowing: "シャドーイング",
  linearFunction: "一次関数",
  dokkai: "読解",
  knockback: "ノックバック",
};

// 教室レイアウト(14x10)。左右対称(col c ↔ 13-c)で3レーン構成:
// 上(ロッカー間)・中央(机の切れ目)・下(本棚の内側)。
export const OBSTACLES: Obstacle[] = [
  { id: "locker-l", kind: "locker", col: 3, row: 0, cols: 2, rows: 1 },
  { id: "locker-r", kind: "locker", col: 9, row: 0, cols: 2, rows: 1 },
  { id: "desk-l1", kind: "desk", col: 4, row: 2, cols: 1, rows: 1 },
  { id: "desk-l2", kind: "desk", col: 4, row: 5, cols: 1, rows: 1 },
  { id: "desk-l3", kind: "desk", col: 4, row: 7, cols: 1, rows: 1 },
  { id: "desk-r1", kind: "desk", col: 9, row: 2, cols: 1, rows: 1 },
  { id: "desk-r2", kind: "desk", col: 9, row: 5, cols: 1, rows: 1 },
  { id: "desk-r3", kind: "desk", col: 9, row: 7, cols: 1, rows: 1 },
  { id: "desk-c1", kind: "desk", col: 6, row: 3, cols: 1, rows: 1 },
  { id: "desk-c2", kind: "desk", col: 7, row: 3, cols: 1, rows: 1 },
  { id: "desk-c3", kind: "desk", col: 6, row: 6, cols: 1, rows: 1 },
  { id: "desk-c4", kind: "desk", col: 7, row: 6, cols: 1, rows: 1 },
  { id: "shelf-l", kind: "bookshelf", col: 2, row: 7, cols: 1, rows: 2 },
  { id: "shelf-r", kind: "bookshelf", col: 11, row: 7, cols: 1, rows: 2 },
];

export interface SkillParams {
  cooldown: number;
  /** 一次関数: ビーム幅(中心線からのヒット半径)と最大長 */
  beamHitRadius: number;
  beamMaxLength: number;
  beamDamage: number;
  /** ノックバック */
  knockbackRange: number;
  knockbackDistance: number;
  knockbackDamage: number;
  knockbackSpeed: number;
  /** 読解 */
  revealDuration: number;
  /** シャドーイング */
  copyPowerScale: number;
}

export const SKILL_COOLDOWN: Record<SkillId, number> = {
  shadowing: 8,
  linearFunction: 7,
  dokkai: 6,
  knockback: 7,
};

export const SKILL_PARAMS = {
  beamHitRadius: 0.6,
  beamMaxLength: 16,
  beamDamage: 20,
  knockbackRange: 2.4,
  knockbackDistance: 1.8,
  knockbackDamage: 10,
  knockbackSpeed: 6,
  revealDuration: 4,
  copyPowerScale: 0.5,
} as const;

interface UnitDef {
  id: string;
  name: string;
  team: Team;
  subject: Subject;
  skillId: SkillId;
  hp: number;
  moveSpeed: number;
  attackRange: number;
  attackInterval: number;
  attackDamage: number;
  spawnCell: { col: number; row: number };
  initialSkillCooldown: number;
}

// 味方: 英語・数学・物理 / 敵: 国語・数学・物理。
// ステータスは科目ごとに左右共通(公平性のため)。
export const UNIT_DEFS: UnitDef[] = [
  {
    id: "ally-english",
    name: "蒼井エマ",
    team: "ally",
    subject: "english",
    skillId: "shadowing",
    hp: 100,
    moveSpeed: 2.3,
    attackRange: 4.0,
    attackInterval: 1.1,
    attackDamage: 7,
    spawnCell: { col: 1, row: 2 },
    initialSkillCooldown: 2,
  },
  {
    id: "ally-math",
    name: "加藤カズ",
    team: "ally",
    subject: "math",
    skillId: "linearFunction",
    hp: 88,
    moveSpeed: 2.0,
    attackRange: 5.2,
    attackInterval: 1.4,
    attackDamage: 10,
    spawnCell: { col: 1, row: 4 },
    initialSkillCooldown: 2,
  },
  {
    id: "ally-physics",
    name: "力石リキ",
    team: "ally",
    subject: "physics",
    skillId: "knockback",
    hp: 132,
    moveSpeed: 2.6,
    attackRange: 1.7,
    attackInterval: 0.9,
    attackDamage: 6,
    spawnCell: { col: 1, row: 7 },
    initialSkillCooldown: 2,
  },
  {
    id: "enemy-japanese",
    name: "綾瀬アヤ",
    team: "enemy",
    subject: "japanese",
    skillId: "dokkai",
    hp: 96,
    moveSpeed: 2.2,
    attackRange: 4.6,
    attackInterval: 1.2,
    attackDamage: 8,
    spawnCell: { col: 12, row: 2 },
    initialSkillCooldown: 5,
  },
  {
    id: "enemy-math",
    name: "相馬レイ",
    team: "enemy",
    subject: "math",
    skillId: "linearFunction",
    hp: 88,
    moveSpeed: 2.0,
    attackRange: 5.2,
    attackInterval: 1.4,
    attackDamage: 10,
    spawnCell: { col: 12, row: 4 },
    initialSkillCooldown: 6.5,
  },
  {
    id: "enemy-physics",
    name: "大森ゴウ",
    team: "enemy",
    subject: "physics",
    skillId: "knockback",
    hp: 132,
    moveSpeed: 2.6,
    attackRange: 1.7,
    attackInterval: 0.9,
    attackDamage: 6,
    spawnCell: { col: 12, row: 7 },
    initialSkillCooldown: 8,
  },
];

function makeUnit(def: UnitDef): Unit {
  return {
    id: def.id,
    name: def.name,
    team: def.team,
    subject: def.subject,
    skillId: def.skillId,
    hp: def.hp,
    maxHp: def.hp,
    moveSpeed: def.moveSpeed,
    attackRange: def.attackRange,
    attackInterval: def.attackInterval,
    attackDamage: def.attackDamage,
    pos: cellCenter(def.spawnCell.col, def.spawnCell.row),
    facing: def.team === "ally" ? Math.PI / 2 : -Math.PI / 2,
    aiState: "idle",
    targetId: null,
    attackCooldown: 0,
    skillCooldown: def.initialSkillCooldown,
    skillCooldownMax: SKILL_COOLDOWN[def.skillId],
    path: [],
    pathAge: 0,
    pathTargetCell: -1,
    knockback: null,
    revealedUntil: 0,
    hitFlashUntil: 0,
    castFlashUntil: 0,
  };
}

export function createInitialState(): GameState {
  return {
    phase: "playing",
    gameTime: 0,
    units: UNIT_DEFS.map(makeUnit),
    grid: buildGrid(OBSTACLES),
    obstacles: OBSTACLES,
    lastSkillByTeam: { ally: null, enemy: null },
    inputQueue: [],
    effects: [],
    nextEffectId: 1,
    notice: null,
  };
}
