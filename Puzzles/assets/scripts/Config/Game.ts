/** Tile的宽度 */
export const TileWidth = 116;
/** Tile的高度 */
export const TileHeight = 116;
/** 初始化有多少行 */
export const InitiaRowCount = 16;
/** 初始化有多少列 */
export const InitiaColCount = 8;
/** 初始化有多少个Tile */
export const InitiaTileCount = InitiaRowCount * InitiaColCount;
/** 游戏区域节点宽度 */
export const GameAreaWidth = InitiaColCount * TileWidth;
/** 游戏区域节点高度 */
export const GameAreaHeight = InitiaRowCount * TileHeight;
/** Tile类型Sprite映射 */
export const TileType = new Map([
  [1, { label: 'BaseTile', value: 'tile_1' }],
  [2, { label: 'BaseTile', value: 'tile_2' }],
  [3, { label: 'BaseTile', value: 'tile_3' }]
]);
