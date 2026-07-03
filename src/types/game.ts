// 放課後タクティクス: ゲームロジック用の型定義。
// ここにある型は three.js / React に依存しない(lib/game 全体の共通規約)。

export type Subject = "english" | "math" | "japanese" | "physics";

export type Team = "ally" | "enemy";

export type SkillId = "shadowing" | "linearFunction" | "dokkai" | "knockback";

export type UnitAIState = "idle" | "moving" | "attacking" | "down";

export type GamePhase = "playing" | "won" | "lost";

/** 論理座標は XZ 平面の2Dのみ。高さ(Y)は描画側だけの概念。 */
export interface Vec2 {
  x: number;
  z: number;
}

export interface CellCoord {
  col: number;
  row: number;
}

export type ObstacleKind = "desk" | "bookshelf" | "locker";

/** 遮蔽物はグリッド矩形。移動不可かつ射線も遮る(高さ概念なし)。 */
export interface Obstacle {
  id: string;
  kind: ObstacleKind;
  col: number;
  row: number;
  cols: number;
  rows: number;
}

export interface GridDef {
  cols: number;
  rows: number;
  /** 1マスの一辺(ワールド単位)。MVPでは常に1。 */
  cellSize: number;
  /** col + row * cols で引く占有フラグ。true = 移動不可・射線遮断。 */
  blocked: boolean[];
}

export interface Knockback {
  dir: Vec2;
  /** 残り押し出し距離(ワールド単位) */
  remaining: number;
}

export interface Unit {
  id: string;
  name: string;
  team: Team;
  subject: Subject;
  skillId: SkillId;

  hp: number;
  maxHp: number;
  moveSpeed: number;
  attackRange: number;
  attackInterval: number;
  attackDamage: number;

  pos: Vec2;
  /** ヨー角(rad)。描画とスキル方向の参考用。 */
  facing: number;
  aiState: UnitAIState;
  targetId: string | null;

  attackCooldown: number;
  skillCooldown: number;
  /** スキルのクールダウン全長(表示用) */
  skillCooldownMax: number;

  /** A*経路(ワールド座標のウェイポイント列)。先頭が次の目的地。 */
  path: Vec2[];
  /** 経路を計算してからの経過秒。定期再計算に使う。 */
  pathAge: number;
  /** 経路計算時のターゲットセル(cellIndex)。ターゲット移動の検知用。 */
  pathTargetCell: number;

  /** ノックバック中は通常移動より優先される。 */
  knockback: Knockback | null;

  /** 読解: この gameTime までターゲット表示線を描画する。 */
  revealedUntil: number;
  /** 被弾フラッシュ演出の終了時刻(gameTime)。 */
  hitFlashUntil: number;
  /** スキル発動演出の終了時刻(gameTime)。 */
  castFlashUntil: number;
}

/** シャドーイングのコピー元として記録するイベント。チームごとに直前1件。 */
export interface SkillEvent {
  skillId: SkillId;
  casterId: string;
  at: number;
}

export type VisualEffectKind = "beam" | "shot";

/** ロジックに影響しない短命の描画物。描画側がプールに割り当てる。 */
export interface VisualEffect {
  id: number;
  kind: VisualEffectKind;
  from: Vec2;
  to: Vec2;
  /** gameTime がこの値を超えたら消滅。 */
  until: number;
  /** 表示寿命(フェード計算用) */
  duration: number;
  color: string;
}

export interface Notice {
  text: string;
  until: number;
}

export interface GameState {
  phase: GamePhase;
  /** シミュレーション経過秒(固定タイムステップで加算)。 */
  gameTime: number;
  units: Unit[];
  grid: GridDef;
  obstacles: Obstacle[];
  /** チームごとの「直前に使われたスキル」。シャドーイング自身は記録しない。 */
  lastSkillByTeam: Record<Team, SkillEvent | null>;
  /** プレイヤー入力キュー(スキル発動したい味方ユニットid)。tick先頭で消化。 */
  inputQueue: string[];
  effects: VisualEffect[];
  /** effects の id 採番用。 */
  nextEffectId: number;
  /** HUDに出す短文(スキル発動・失敗理由など)。 */
  notice: Notice | null;
}

export interface CastResult {
  ok: boolean;
  reason?: string;
}
