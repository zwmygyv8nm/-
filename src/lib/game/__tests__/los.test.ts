import { describe, expect, it } from "vitest";
import type { Obstacle } from "@/types/game";
import { buildGrid, cellCenter } from "../grid";
import { hasLineOfSight, traceBeam } from "../los";

function desk(id: string, col: number, row: number): Obstacle {
  return { id, kind: "desk", col, row, cols: 1, rows: 1 };
}

describe("hasLineOfSight", () => {
  it("遮蔽物のない直線は見通せる", () => {
    const grid = buildGrid([]);
    expect(hasLineOfSight(grid, cellCenter(1, 4), cellCenter(12, 4))).toBe(true);
  });

  it("間に遮蔽物があると射線が通らない(水平)", () => {
    const grid = buildGrid([desk("d", 6, 4)]);
    expect(hasLineOfSight(grid, cellCenter(2, 4), cellCenter(10, 4))).toBe(false);
  });

  it("間に遮蔽物があると射線が通らない(斜め)", () => {
    const grid = buildGrid([desk("d", 6, 5)]);
    expect(hasLineOfSight(grid, cellCenter(4, 3), cellCenter(8, 7))).toBe(false);
  });

  it("遮蔽物の横は見通せる", () => {
    const grid = buildGrid([desk("d", 6, 4)]);
    expect(hasLineOfSight(grid, cellCenter(2, 5), cellCenter(10, 5))).toBe(true);
  });

  it("斜めに接する遮蔽物の角のすき間は貫通しない", () => {
    // (6,4) と (7,5) が斜めに接する。セル(6,5)→(7,4)の対角線は
    // ちょうど格子点 (7,5) を通るが、射線は遮られる扱いにする。
    const grid = buildGrid([desk("a", 6, 4), desk("b", 7, 5)]);
    expect(hasLineOfSight(grid, cellCenter(6, 5), cellCenter(7, 4))).toBe(false);
    expect(hasLineOfSight(grid, cellCenter(7, 4), cellCenter(6, 5))).toBe(false);
  });

  it("始点セルが塞がっている場合は見通せない扱い", () => {
    const grid = buildGrid([desk("d", 3, 3)]);
    expect(hasLineOfSight(grid, cellCenter(3, 3), cellCenter(5, 3))).toBe(false);
  });
});

describe("traceBeam", () => {
  it("遮蔽物の手前で止まる", () => {
    const grid = buildGrid([desk("d", 6, 4)]);
    const from = cellCenter(2, 4); // x = -4.5
    const end = traceBeam(grid, from, { x: 1, z: 0 }, 16);
    // セル(6,4)の左端は x = -1
    expect(end.x).toBeCloseTo(-1, 5);
    expect(end.z).toBeCloseTo(from.z, 5);
  });

  it("遮蔽物がなければ外壁で止まる", () => {
    const grid = buildGrid([]);
    const from = cellCenter(2, 4);
    const end = traceBeam(grid, from, { x: 1, z: 0 }, 16);
    expect(end.x).toBeCloseTo(7, 5);
  });

  it("最大距離を超えない", () => {
    const grid = buildGrid([]);
    const from = cellCenter(2, 4);
    const end = traceBeam(grid, from, { x: 1, z: 0 }, 3);
    expect(end.x).toBeCloseTo(from.x + 3, 5);
  });
});
