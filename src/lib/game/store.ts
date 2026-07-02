import { create } from "zustand";
import type { GamePhase, GameState, Unit } from "@/types/game";
import { aliveCount, isAlive } from "./combat";
import { createInitialState } from "./defs";

// シミュレーション状態は React state に入れない。
// ここの `sim` はミュータブルなシングルトンで、tick が直接書き換え、
// 描画側は useFrame / rAF の中で getSim() を読んで ref を更新する。
// React(zustand の購読)へは、低頻度でしか変わらないスナップショットだけを流す。

let sim: GameState = createInitialState();

export function getSim(): GameState {
  return sim;
}

/** 味方ユニット(スキルカードの並び順)。参照は tick 中も不変。 */
export function getAllies(): Unit[] {
  return sim.units.filter((u) => u.team === "ally");
}

export type AllyCardStatus = "ready" | "cooldown" | "down";

interface ReactiveSnapshot {
  /** リセットごとに増える世代番号。エフェクトプール等の初期化に使う。 */
  epoch: number;
  phase: GamePhase;
  aliveAllies: number;
  aliveEnemies: number;
  /** 味方カードの状態(ready/cooldown/down)をカンマ結合した比較用キー。 */
  allyStatusKey: string;
  notice: string | null;
}

interface GameUiStore extends ReactiveSnapshot {
  enqueueSkill: (unitId: string) => void;
  reset: () => void;
}

function allyStatus(u: Unit, phase: GamePhase): AllyCardStatus {
  if (!isAlive(u)) return "down";
  if (phase !== "playing" || u.skillCooldown > 0) return "cooldown";
  return "ready";
}

function computeSnapshot(epoch: number): ReactiveSnapshot {
  return {
    epoch,
    phase: sim.phase,
    aliveAllies: aliveCount(sim, "ally"),
    aliveEnemies: aliveCount(sim, "enemy"),
    allyStatusKey: getAllies()
      .map((u) => allyStatus(u, sim.phase))
      .join(","),
    notice: sim.notice?.text ?? null,
  };
}

export const useGameStore = create<GameUiStore>((set, get) => ({
  ...computeSnapshot(0),

  enqueueSkill: (unitId: string) => {
    // 実処理は次のtickの先頭で行う(入力とロジックの合流点を1箇所にする)。
    sim.inputQueue.push(unitId);
  },

  reset: () => {
    sim = createInitialState();
    set(computeSnapshot(get().epoch + 1));
  },
}));

/**
 * tick 消化後に毎フレーム呼ばれる。スナップショットに差分があるときだけ
 * setState する(通常は数秒に1回程度で、60fpsの再レンダーは発生しない)。
 */
export function syncReactiveState(): void {
  const prev = useGameStore.getState();
  const next = computeSnapshot(prev.epoch);
  if (
    next.phase !== prev.phase ||
    next.aliveAllies !== prev.aliveAllies ||
    next.aliveEnemies !== prev.aliveEnemies ||
    next.allyStatusKey !== prev.allyStatusKey ||
    next.notice !== prev.notice
  ) {
    useGameStore.setState(next);
  }
}
