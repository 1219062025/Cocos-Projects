/** Tile的宽度 */
export const TileWidth = 120;
/** Tile的高度 */
export const TileHeight = 120;
/** 初始化有多少行 */
export const InitiaRowCount = 6;
/** 初始化有多少列 */
export const InitiaColCount = 5;
/** 初始化有多少个Tile */
export const InitiaTileCount = InitiaRowCount * InitiaColCount;
/** 游戏区域节点宽度 */
export const GameAreaWidth = InitiaColCount * TileWidth;
/** 游戏区域节点高度 */
export const GameAreaHeight = InitiaRowCount * TileHeight;
/** Tile类型Sprite映射 */
export const TileType = new Map([
  [1, { maxLevel: 2, label: '1_', type: 1 }],
  [2, { maxLevel: 2, label: '2_', type: 2 }],
  [3, { maxLevel: 2, label: '3_', type: 3 }],
  [4, { maxLevel: 3, label: '4_', type: 4 }],
  [5, { maxLevel: 1, label: '5_', type: 5 }]
]);

export enum CellType {
  CELL = 0,
  CELLLOCK = -1,
  TILE1_0 = '1_0',
  TILE1_1 = '1_1',
  TILE1_2 = '1_2',
  TILE1_3 = '1_3',
  TILE2_0 = '2_0',
  TILE2_1 = '2_1',
  TILE2_2 = '2_2',
  TILE3_0 = '3_0',
  TILE3_1 = '3_1',
  TILE3_2 = '3_2',
  TILE4_0 = '4_0',
  TILE4_1 = '4_1',
  TILE4_2 = '4_2',
  TILE4_3 = '4_3',
  TILE5_0 = '5_0',
  TILE5_1 = '5_1'
}
