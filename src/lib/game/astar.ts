import type { CellCoord, GridDef, Vec2 } from "@/types/game";
import { cellCenter, cellIndex, inBounds, isBlockedCell } from "./grid";

// 小さいグリッド(14x10)前提の素朴なA*。openリストは線形走査で十分。
// 斜め移動は許可するが、両隣の直交セルが空いている場合のみ(角抜け禁止)。

const SQRT2 = Math.SQRT2;

interface Dir {
  dc: number;
  dr: number;
  cost: number;
}

const DIRS: Dir[] = [
  { dc: 1, dr: 0, cost: 1 },
  { dc: -1, dr: 0, cost: 1 },
  { dc: 0, dr: 1, cost: 1 },
  { dc: 0, dr: -1, cost: 1 },
  { dc: 1, dr: 1, cost: SQRT2 },
  { dc: 1, dr: -1, cost: SQRT2 },
  { dc: -1, dr: 1, cost: SQRT2 },
  { dc: -1, dr: -1, cost: SQRT2 },
];

function octile(c0: number, r0: number, c1: number, r1: number): number {
  const dx = Math.abs(c0 - c1);
  const dz = Math.abs(r0 - r1);
  return Math.max(dx, dz) + (SQRT2 - 1) * Math.min(dx, dz);
}

/**
 * from セルから to セルへの経路を、セル中心のワールド座標列で返す。
 * 先頭は from の「次」のセル。到達不能・同一セルの場合は空配列。
 */
export function findPath(grid: GridDef, from: CellCoord, to: CellCoord): Vec2[] {
  if (from.col === to.col && from.row === to.row) return [];
  if (!inBounds(to.col, to.row) || isBlockedCell(grid, to.col, to.row)) return [];
  if (!inBounds(from.col, from.row)) return [];

  const n = grid.cols * grid.rows;
  const g = new Float64Array(n).fill(Infinity);
  const f = new Float64Array(n).fill(Infinity);
  const cameFrom = new Int32Array(n).fill(-1);
  const closed = new Uint8Array(n);
  const open: number[] = [];

  const start = cellIndex(from.col, from.row);
  const goal = cellIndex(to.col, to.row);
  g[start] = 0;
  f[start] = octile(from.col, from.row, to.col, to.row);
  open.push(start);

  while (open.length > 0) {
    // f 最小のノードを線形探索で取り出す。
    let bestI = 0;
    for (let i = 1; i < open.length; i++) {
      if (f[open[i]] < f[open[bestI]]) bestI = i;
    }
    const current = open.splice(bestI, 1)[0];
    if (current === goal) break;
    if (closed[current]) continue;
    closed[current] = 1;

    const cc = current % grid.cols;
    const cr = Math.floor(current / grid.cols);

    for (const d of DIRS) {
      const nc = cc + d.dc;
      const nr = cr + d.dr;
      if (isBlockedCell(grid, nc, nr)) continue;
      // 斜めは両隣の直交セルが空いていること(角抜け禁止)。
      if (
        d.dc !== 0 &&
        d.dr !== 0 &&
        (isBlockedCell(grid, cc + d.dc, cr) || isBlockedCell(grid, cc, cr + d.dr))
      ) {
        continue;
      }
      const ni = cellIndex(nc, nr);
      if (closed[ni]) continue;
      const tentative = g[current] + d.cost;
      if (tentative < g[ni]) {
        g[ni] = tentative;
        f[ni] = tentative + octile(nc, nr, to.col, to.row);
        cameFrom[ni] = current;
        if (!open.includes(ni)) open.push(ni);
      }
    }
  }

  if (cameFrom[goal] === -1) return [];

  const cells: number[] = [];
  let cur = goal;
  while (cur !== start && cur !== -1) {
    cells.push(cur);
    cur = cameFrom[cur];
  }
  cells.reverse();
  return cells.map((i) => cellCenter(i % grid.cols, Math.floor(i / grid.cols)));
}
