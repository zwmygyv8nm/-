"use client";

import type { Obstacle, ObstacleKind } from "@/types/game";
import { OBSTACLES } from "@/lib/game/defs";
import { FIELD_MIN_X, FIELD_MIN_Z } from "@/lib/game/grid";

const KIND_STYLE: Record<
  ObstacleKind,
  { height: number; color: string; inset: number }
> = {
  desk: { height: 0.72, color: "#a1703f", inset: 0.1 },
  bookshelf: { height: 1.7, color: "#7a4f2a", inset: 0.08 },
  locker: { height: 1.8, color: "#64748b", inset: 0.08 },
};

function ObstacleMesh({ obstacle }: { obstacle: Obstacle }) {
  const style = KIND_STYLE[obstacle.kind];
  const x = FIELD_MIN_X + obstacle.col + obstacle.cols / 2;
  const z = FIELD_MIN_Z + obstacle.row + obstacle.rows / 2;
  const sx = obstacle.cols - style.inset;
  const sz = obstacle.rows - style.inset;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, style.height / 2, 0]} castShadow>
        <boxGeometry args={[sx, style.height, sz]} />
        <meshStandardMaterial color={style.color} />
      </mesh>
      {/* 机には天板、それ以外は前面パネルで質感を出す(見た目のみ) */}
      {obstacle.kind === "desk" && (
        <mesh position={[0, style.height + 0.02, 0]}>
          <boxGeometry args={[sx + 0.06, 0.04, sz + 0.06]} />
          <meshStandardMaterial color="#c68a52" />
        </mesh>
      )}
    </group>
  );
}

/** 遮蔽物(机・本棚・ロッカー)。判定はロジック側のグリッドが持ち、ここは見た目だけ。 */
export function Obstacles() {
  return (
    <group>
      {OBSTACLES.map((ob) => (
        <ObstacleMesh key={ob.id} obstacle={ob} />
      ))}
    </group>
  );
}
