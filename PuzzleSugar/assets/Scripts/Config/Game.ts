/** Tile的宽度 */
export const TileWidth = 100;
/** Tile的高度 */
export const TileHeight = 100;
/** Tile的宽度 */
export const CellWidth = 120;
/** Tile的高度 */
export const CellHeight = 120;
/** 初始化有多少行 */
export const InitiaRowCount = 5;
/** 初始化有多少列 */
export const InitiaColCount = 5;
/** 初始化有多少个Tile */
export const InitiaTileCount = InitiaRowCount * InitiaColCount;
/** 游戏区域节点宽度 */
export const GameAreaWidth = InitiaColCount * CellWidth;
/** 游戏区域节点高度 */
export const GameAreaHeight = InitiaRowCount * CellHeight;
export enum Tile {
  RedTile = 1,
  OrangeTile = 2,
  YellowTile = 3,
  GreenTile = 4,
  BlueTile = 5,
  PurpleTile = 6,
  HorizontalTile = 7,
  VerticalTile = 8,
  ColorTile = 9
}
export enum Category {
  BaseTile = 1,
  HorizontalTile = 2,
  VerticalTile = 3,
  ColorTile = 4
}
/** Tile类型Sprite映射 */
export const TileType = new Map([
  [Tile.RedTile, { category: Category.BaseTile, path: Tile[Tile.RedTile] }],
  [Tile.OrangeTile, { category: Category.BaseTile, path: Tile[Tile.OrangeTile] }],
  [Tile.YellowTile, { category: Category.BaseTile, path: Tile[Tile.YellowTile] }],
  [Tile.GreenTile, { category: Category.BaseTile, path: Tile[Tile.GreenTile] }],
  [Tile.BlueTile, { category: Category.BaseTile, path: Tile[Tile.BlueTile] }],
  [Tile.PurpleTile, { category: Category.BaseTile, path: Tile[Tile.PurpleTile] }],
  [Tile.HorizontalTile, { category: Category.HorizontalTile, path: Tile[Tile.HorizontalTile] }],
  [Tile.VerticalTile, { category: Category.VerticalTile, path: Tile[Tile.VerticalTile] }],
  [Tile.ColorTile, { category: Category.ColorTile, path: Tile[Tile.ColorTile] }]
]);
