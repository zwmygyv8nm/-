/**
 * イラスト画像レジストリ
 *
 * public/illustrations/ に画像を置くだけで自動適用される。
 * 画像がない場合は各コンポーネントがCSSフォールバックを表示する。
 *
 * ── 命名規則 ──
 * キャラクター:  public/illustrations/characters/{id}.png
 *   例) neko.png / shiro.png / kuma.png
 *
 * 机アイテム:   public/illustrations/desk/{item}.png
 *   pen.png / eraser.png / pencil-case.png /
 *   water-bottle.png / sticky-note.png / notebook.png
 *
 * その他UIパーツ: public/illustrations/ui/{name}.png
 */

const BASE = "/-/illustrations";

/* ── キャラクター ── */
export const CHARACTER_IDS = ["neko", "shiro", "kuma"] as const;
export type CharacterId = typeof CHARACTER_IDS[number];

export function characterIllustration(id: string): string {
  return `${BASE}/characters/${id}.png`;
}

/* ── 机アイテム ── */
export type DeskItemId =
  | "pen"
  | "eraser"
  | "pencil-case"
  | "water-bottle"
  | "sticky-note"
  | "notebook";

export function deskItemIllustration(item: DeskItemId): string {
  return `${BASE}/desk/${item}.png`;
}

/* ── その他UIパーツ ── */
export function uiIllustration(name: string): string {
  return `${BASE}/ui/${name}.png`;
}
