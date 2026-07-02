import type { GridDef, Vec2 } from "@/types/game";
import {
  FIELD_MAX_X,
  FIELD_MAX_Z,
  FIELD_MIN_X,
  FIELD_MIN_Z,
  isBlockedCell,
} from "./grid";

// 射線判定は three.js の Raycaster を使わず、グリッドDDA(Amanatides & Woo)で行う。
// 斜め45°で格子点をちょうど通るケースは、両隣のセルどちらかが塞がっていれば
// 「遮られた」とみなす(遮蔽物の角のすき間をすり抜けさせないための保守的判定)。

const EPS = 1e-9;
const MAX_STEPS = 64;

/** a から b まで遮蔽物に遮られず見通せるか。 */
export function hasLineOfSight(grid: GridDef, a: Vec2, b: Vec2): boolean {
  const gx0 = a.x - FIELD_MIN_X;
  const gz0 = a.z - FIELD_MIN_Z;
  const gx1 = b.x - FIELD_MIN_X;
  const gz1 = b.z - FIELD_MIN_Z;

  let col = Math.floor(gx0);
  let row = Math.floor(gz0);
  const endCol = Math.floor(gx1);
  const endRow = Math.floor(gz1);

  if (isBlockedCell(grid, col, row)) return false;

  const dx = gx1 - gx0;
  const dz = gz1 - gz0;
  const stepX = dx > 0 ? 1 : -1;
  const stepZ = dz > 0 ? 1 : -1;
  const tDeltaX = dx !== 0 ? Math.abs(1 / dx) : Infinity;
  const tDeltaZ = dz !== 0 ? Math.abs(1 / dz) : Infinity;
  // t は線分全体を [0,1] とするパラメータ。
  let tMaxX =
    dx !== 0 ? (dx > 0 ? (col + 1 - gx0) / dx : (col - gx0) / dx) : Infinity;
  let tMaxZ =
    dz !== 0 ? (dz > 0 ? (row + 1 - gz0) / dz : (row - gz0) / dz) : Infinity;

  for (let i = 0; i < MAX_STEPS; i++) {
    if (col === endCol && row === endRow) return true;

    if (Math.abs(tMaxX - tMaxZ) < EPS && tMaxX !== Infinity) {
      // ちょうど格子点を通過する: 角をはさむ2セルのどちらかが塞がっていれば遮断。
      if (tMaxX > 1 + EPS) return true;
      if (
        isBlockedCell(grid, col + stepX, row) ||
        isBlockedCell(grid, col, row + stepZ)
      ) {
        return false;
      }
      col += stepX;
      row += stepZ;
      tMaxX += tDeltaX;
      tMaxZ += tDeltaZ;
    } else if (tMaxX < tMaxZ) {
      if (tMaxX > 1 + EPS) return true;
      col += stepX;
      tMaxX += tDeltaX;
    } else {
      if (tMaxZ > 1 + EPS) return true;
      row += stepZ;
      tMaxZ += tDeltaZ;
    }

    if (isBlockedCell(grid, col, row)) return false;
  }
  return true;
}

/**
 * from から dir 方向へ最大 maxDist まで直線を伸ばし、
 * 最初に遮蔽物または外壁に当たる点(なければ maxDist 先)を返す。
 * 一次関数ビームの終端計算用。dir は正規化済みであること。
 */
export function traceBeam(
  grid: GridDef,
  from: Vec2,
  dir: Vec2,
  maxDist: number,
): Vec2 {
  // まず外壁(フィールド境界)までの距離に丸める。
  let maxT = maxDist;
  if (dir.x > EPS) maxT = Math.min(maxT, (FIELD_MAX_X - from.x) / dir.x);
  else if (dir.x < -EPS) maxT = Math.min(maxT, (FIELD_MIN_X - from.x) / dir.x);
  if (dir.z > EPS) maxT = Math.min(maxT, (FIELD_MAX_Z - from.z) / dir.z);
  else if (dir.z < -EPS) maxT = Math.min(maxT, (FIELD_MIN_Z - from.z) / dir.z);
  maxT = Math.max(0, maxT);

  const gx0 = from.x - FIELD_MIN_X;
  const gz0 = from.z - FIELD_MIN_Z;
  let col = Math.floor(gx0);
  let row = Math.floor(gz0);

  const stepX = dir.x > 0 ? 1 : -1;
  const stepZ = dir.z > 0 ? 1 : -1;
  const tDeltaX = Math.abs(dir.x) > EPS ? Math.abs(1 / dir.x) : Infinity;
  const tDeltaZ = Math.abs(dir.z) > EPS ? Math.abs(1 / dir.z) : Infinity;
  // t はワールド距離そのもの(cellSize=1 前提)。
  let tMaxX =
    Math.abs(dir.x) > EPS
      ? (dir.x > 0 ? (col + 1 - gx0) : (col - gx0)) / dir.x
      : Infinity;
  let tMaxZ =
    Math.abs(dir.z) > EPS
      ? (dir.z > 0 ? (row + 1 - gz0) : (row - gz0)) / dir.z
      : Infinity;

  const at = (t: number): Vec2 => ({ x: from.x + dir.x * t, z: from.z + dir.z * t });

  for (let i = 0; i < MAX_STEPS; i++) {
    let t: number;
    if (Math.abs(tMaxX - tMaxZ) < EPS && tMaxX !== Infinity) {
      t = tMaxX;
      if (t >= maxT) return at(maxT);
      if (
        isBlockedCell(grid, col + stepX, row) ||
        isBlockedCell(grid, col, row + stepZ)
      ) {
        return at(t);
      }
      col += stepX;
      row += stepZ;
      tMaxX += tDeltaX;
      tMaxZ += tDeltaZ;
    } else if (tMaxX < tMaxZ) {
      t = tMaxX;
      if (t >= maxT) return at(maxT);
      col += stepX;
      tMaxX += tDeltaX;
    } else {
      t = tMaxZ;
      if (t >= maxT) return at(maxT);
      row += stepZ;
      tMaxZ += tDeltaZ;
    }
    if (isBlockedCell(grid, col, row)) return at(t);
  }
  return at(maxT);
}
