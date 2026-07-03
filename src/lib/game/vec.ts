import type { Vec2 } from "@/types/game";

export function dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.hypot(dx, dz);
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, z: a.z - b.z };
}

export function normalize(v: Vec2): Vec2 {
  const len = Math.hypot(v.x, v.z);
  if (len < 1e-8) return { x: 1, z: 0 };
  return { x: v.x / len, z: v.z / len };
}

/** 点 p から線分 ab までの最短距離。 */
export function distPointToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const abx = b.x - a.x;
  const abz = b.z - a.z;
  const lenSq = abx * abx + abz * abz;
  if (lenSq < 1e-12) return dist(p, a);
  let t = ((p.x - a.x) * abx + (p.z - a.z) * abz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return dist(p, { x: a.x + abx * t, z: a.z + abz * t });
}

/** 進行方向ベクトルからヨー角を求める(three.js の rotation.y に合わせて +Z 前方基準)。 */
export function yawFromDir(dir: Vec2): number {
  return Math.atan2(dir.x, dir.z);
}
