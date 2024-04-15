export const CellWidth = 120;
export const CellHeight = 120;
/** Tile类型Sprite映射 */
export const TileType = new Map([
  [1, { maxlevel: 3, label: '1_', type: 1 }],
  [2, { maxlevel: 3, label: '2_', type: 2 }],
  [3, { maxlevel: 3, label: '3_', type: 3 }],
  [4, { maxlevel: 4, label: '4_', type: 4 }],
  [5, { maxlevel: 2, label: '5_', type: 5 }]
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
