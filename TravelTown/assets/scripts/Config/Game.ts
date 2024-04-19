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
/** Tile类型映射 */
export const TileType = new Map([
  [1, { maxLevel: 2, label: '1_', type: 1, isAward: false }],
  [2, { maxLevel: 2, label: '2_', type: 2, isAward: false }],
  [3, { maxLevel: 2, label: '3_', type: 3, isAward: false }],
  [4, { maxLevel: 3, label: '4_', type: 4, isAward: false }],
  [5, { maxLevel: 1, label: '5_', type: 5, isAward: false }],
  [6, { maxLevel: 0, label: '6_', type: 6, isAward: true }]
]);
/** Cell类型映射 */
export const CellType = new Map([
  [-1, { value: ['cellLock1', 'cellLock2'], isRandomValue: true, isAward: false, awardMatch: Infinity }],
  [-2, { value: 'cellEliminate', isRandomValue: false, isAward: true, awardMatch: 6 }]
]);
/** Award类型映射 */
export const AwardType = new Map([[6, { value: 'reap' }]]);
