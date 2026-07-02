import type { CellCoord, GridDef, Obstacle, Vec2 } from "@/types/game";

// フィールドは 14 x 10 マス(1マス = 1ワールド単位)、原点はフィールド中心。
// ワールド座標: x ∈ [-7, 7], z ∈ [-5, 5]。グリッド座標: gx = x + 7, gz = z + 5。
export const GRID_COLS = 14;
export const GRID_ROWS = 10;
export const CELL_SIZE = 1;

export const FIELD_MIN_X = -GRID_COLS / 2;
export const FIELD_MAX_X = GRID_COLS / 2;
export const FIELD_MIN_Z = -GRID_ROWS / 2;
export const FIELD_MAX_Z = GRID_ROWS / 2;

/** ユニットの当たり半径。壁クランプ・押し離しに使う。 */
export const UNIT_RADIUS = 0.32;

export function cellIndex(col: number, row: number): number {
  return col + row * GRID_COLS;
}

export function inBounds(col: number, row: number): boolean {
  return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
}

export function worldToCell(pos: Vec2): CellCoord {
  return {
    col: Math.floor(pos.x - FIELD_MIN_X),
    row: Math.floor(pos.z - FIELD_MIN_Z),
  };
}

/** セル中心のワールド座標。 */
export function cellCenter(col: number, row: number): Vec2 {
  return {
    x: FIELD_MIN_X + (col + 0.5) * CELL_SIZE,
    z: FIELD_MIN_Z + (row + 0.5) * CELL_SIZE,
  };
}

export function isBlockedCell(grid: GridDef, col: number, row: number): boolean {
  // フィールド外は壁扱い(移動不可・射線遮断)。
  if (!inBounds(col, row)) return true;
  return grid.blocked[cellIndex(col, row)];
}

export function isBlockedAtWorld(grid: GridDef, pos: Vec2): boolean {
  const { col, row } = worldToCell(pos);
  return isBlockedCell(grid, col, row);
}

export function buildGrid(obstacles: Obstacle[]): GridDef {
  const blocked = new Array<boolean>(GRID_COLS * GRID_ROWS).fill(false);
  for (const ob of obstacles) {
    for (let r = ob.row; r < ob.row + ob.rows; r++) {
      for (let c = ob.col; c < ob.col + ob.cols; c++) {
        if (inBounds(c, r)) blocked[cellIndex(c, r)] = true;
      }
    }
  }
  return { cols: GRID_COLS, rows: GRID_ROWS, cellSize: CELL_SIZE, blocked };
}

/** フィールドの壁の内側(ユニット半径ぶんマージン)にクランプする。 */
export function clampToField(pos: Vec2, radius = UNIT_RADIUS): Vec2 {
  return {
    x: Math.min(FIELD_MAX_X - radius, Math.max(FIELD_MIN_X + radius, pos.x)),
    z: Math.min(FIELD_MAX_Z - radius, Math.max(FIELD_MIN_Z + radius, pos.z)),
  };
}
