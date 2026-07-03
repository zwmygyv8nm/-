import { describe, expect, it } from "vitest";
import type { Obstacle, Vec2 } from "@/types/game";
import { findPath } from "../astar";
import { buildGrid, isBlockedAtWorld, worldToCell } from "../grid";

function wall(col: number, rows: number[]): Obstacle[] {
  return rows.map((row) => ({
    id: `w-${col}-${row}`,
    kind: "desk" as const,
    col,
    row,
    cols: 1,
    rows: 1,
  }));
}

function stepsAreAdjacent(path: Vec2[], start: Vec2): boolean {
  let prev = start;
  for (const p of path) {
    const d = Math.hypot(p.x - prev.x, p.z - prev.z);
    if (d > Math.SQRT2 + 1e-6) return false;
    prev = p;
  }
  return true;
}

describe("findPath", () => {
  it("障害物のない経路はほぼ直線で見つかる", () => {
    const grid = buildGrid([]);
    const path = findPath(grid, { col: 1, row: 4 }, { col: 12, row: 4 });
    expect(path.length).toBeGreaterThan(0);
    const goal = path[path.length - 1];
    expect(worldToCell(goal)).toEqual({ col: 12, row: 4 });
  });

  it("壁を回り込む経路を見つけ、遮蔽セルを通らない", () => {
    // col=6 を row0..8 まで塞ぎ、row9 だけ開ける。
    const obstacles = wall(6, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const grid = buildGrid(obstacles);
    const path = findPath(grid, { col: 2, row: 2 }, { col: 10, row: 2 });
    expect(path.length).toBeGreaterThan(0);
    for (const p of path) {
      expect(isBlockedAtWorld(grid, p)).toBe(false);
    }
    // 唯一の通路 row9 帯(z > 3)を通過しているはず。
    expect(path.some((p) => p.z > 3)).toBe(true);
    expect(stepsAreAdjacent(path, { x: -4.5, z: -2.5 })).toBe(true);
  });

  it("斜め移動で遮蔽物の角を抜けない(角抜け禁止)", () => {
    // (6,4) だけ塞ぐ。始点(5,4)→終点(6,5)... ではなく、
    // 角抜けが起きうる配置: (6,4)と(5,5)を塞ぎ、(5,4)→(6,5)は斜め直行不可。
    const obstacles = [...wall(6, [4]), ...wall(5, [5])];
    const grid = buildGrid(obstacles);
    const path = findPath(grid, { col: 5, row: 4 }, { col: 6, row: 5 });
    expect(path.length).toBeGreaterThan(1); // 1歩の斜め移動では行けない=迂回する
    for (const p of path) {
      expect(isBlockedAtWorld(grid, p)).toBe(false);
    }
  });

  it("到達不能なら空配列", () => {
    const obstacles = wall(6, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const grid = buildGrid(obstacles);
    const path = findPath(grid, { col: 2, row: 2 }, { col: 10, row: 2 });
    expect(path).toEqual([]);
  });

  it("目的地が塞がっていたら空配列", () => {
    const grid = buildGrid(wall(6, [4]));
    expect(findPath(grid, { col: 2, row: 2 }, { col: 6, row: 4 })).toEqual([]);
  });
});
