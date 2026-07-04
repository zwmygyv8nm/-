"use client";

import { Line } from "@react-three/drei";
import { useMemo } from "react";
import {
  FIELD_MAX_X,
  FIELD_MAX_Z,
  FIELD_MIN_X,
  FIELD_MIN_Z,
  GRID_COLS,
  GRID_ROWS,
} from "@/lib/game/grid";

const WALL_HEIGHT = 1.6;
/** カメラ手前側(+x, +z)の壁は視界を遮らないよう低い巾木にする。 */
const CURB_HEIGHT = 0.35;
const WALL_THICKNESS = 0.3;
const WALL_COLOR = "#e7dfd0";

/** 床・外周の壁・黒板・マス目。すべて静的なので一度マウントされるだけ。 */
export function Field() {
  const gridPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let c = 0; c <= GRID_COLS; c++) {
      pts.push([FIELD_MIN_X + c, 0.012, FIELD_MIN_Z], [FIELD_MIN_X + c, 0.012, FIELD_MAX_Z]);
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      pts.push([FIELD_MIN_X, 0.012, FIELD_MIN_Z + r], [FIELD_MAX_X, 0.012, FIELD_MIN_Z + r]);
    }
    return pts;
  }, []);

  return (
    <group>
      {/* 床(教室の木フローリング) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[GRID_COLS, GRID_ROWS]} />
        <meshStandardMaterial color="#b5895a" />
      </mesh>
      {/* マス目 */}
      <Line
        segments
        points={gridPoints}
        color="#7c5c3a"
        lineWidth={1}
        transparent
        opacity={0.35}
      />

      {/* 奥側の壁(フルハイト): 北(-z)と西(-x) */}
      <mesh position={[0, WALL_HEIGHT / 2, FIELD_MIN_Z - WALL_THICKNESS / 2]}>
        <boxGeometry args={[GRID_COLS + WALL_THICKNESS * 2, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[FIELD_MIN_X - WALL_THICKNESS / 2, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, GRID_ROWS + WALL_THICKNESS * 2]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      {/* 手前側の壁(低い巾木): 南(+z)と東(+x) */}
      <mesh position={[0, CURB_HEIGHT / 2, FIELD_MAX_Z + WALL_THICKNESS / 2]}>
        <boxGeometry args={[GRID_COLS + WALL_THICKNESS * 2, CURB_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[FIELD_MAX_X + WALL_THICKNESS / 2, CURB_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, CURB_HEIGHT, GRID_ROWS + WALL_THICKNESS * 2]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      {/* 黒板(北壁の内側): 枠+盤面 */}
      <mesh position={[0, 1.05, FIELD_MIN_Z + 0.03]}>
        <boxGeometry args={[5.4, 1.35, 0.06]} />
        <meshStandardMaterial color="#8b5e34" />
      </mesh>
      <mesh position={[0, 1.05, FIELD_MIN_Z + 0.07]}>
        <boxGeometry args={[5.0, 1.1, 0.04]} />
        <meshStandardMaterial color="#2f5233" />
      </mesh>
    </group>
  );
}
