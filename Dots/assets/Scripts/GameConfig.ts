/** 初始化的点布局 */
export const InitialMap: number[][] = [
  [5, 3, 2, 1, 2],
  [5, 3, 2, 1, 2],
  [5, 3, 2, 2, 2],
  [5, 3, 3, 3, 3],
  [5, 5, 5, 5, 5]
];
/** 每个点的宽度 */
export const PointWidth = 66;
/** 每个点的高度 */
export const PointHeight = 66;
/** 每个点之间的间隔 */
export const PointGap = 20;
/** 初始化有多少行 */
export const InitiaRowCount = 5;
/** 初始化有多少列 */
export const InitiaColCount = 5;
/** 初始化有多少个PointNode */
export const InitiaPointCount = InitiaRowCount * InitiaColCount;
/** 游戏区域节点宽度 */
export const GameAreaWidth = InitiaColCount * PointWidth + (InitiaColCount - 1) * PointGap;
/** 游戏区域节点高度 */
export const GameAreaHeight = InitiaRowCount * PointHeight + (InitiaRowCount - 1) * PointGap;
/** 点类型映射 */
export const PointType = new Map([
  [1, { label: 'Green', value: '#45989d' }],
  [2, { label: 'Blue', value: '#383781' }],
  [3, { label: 'Purple', value: '#9879bf' }],
  [4, { label: 'Orange', value: '#f5824d' }],
  [5, { label: 'Yellow', value: '#98b657' }]
]);
