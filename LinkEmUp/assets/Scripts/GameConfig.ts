/** 初始化的PointNode布局 */
export const InitialMap: number[][] = [
  [5, 3, 2, 1, 2],
  [5, 8, 2, 1, 2],
  [5, 3, 2, 6, 2],
  [5, 3, 2, 3, 3],
  [5, 5, 7, 5, 5]
];
/** 每个PointNode的宽度 */
export const PointWidth = 66;
/** 每个PointNode的高度 */
export const PointHeight = 66;
/** 每个PointNode之间的间隔 */
export const PointGap = 40;
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
/** 线段宽度 */
export const LineWidth = 10;
export enum PointCategory {
  Base,
  Rwards
}
/** 点类型映射 */
export const PointType = new Map([
  [1, { label: 'Green', value: '#45989d', category: PointCategory.Base }],
  [2, { label: 'Blue', value: '#383781', category: PointCategory.Base }],
  [3, { label: 'Purple', value: '#9879bf', category: PointCategory.Base }],
  [4, { label: 'Orange', value: '#f5824d', category: PointCategory.Base }],
  [5, { label: 'Yellow', value: '#98b657', category: PointCategory.Base }],
  [6, { label: 'Vertical', value: '#617078', category: PointCategory.Rwards, rwardType: ['vertical'] }],
  [7, { label: 'Horizontal', value: '#617078', category: PointCategory.Rwards, rwardType: ['horizontal'] }],
  [8, { label: 'Cross', value: '#617078', category: PointCategory.Rwards, rwardType: ['vertical', 'horizontal'] }]
]);
/** 根据方向向量映射线段锚点位置以及类型，从而控制线段方向。 tyoe：0-横线 1-竖线 */
export const LineInfoMap = new Map([
  ['0,1', { anchorX: 0.5, anchorY: 0, status: 1 }],
  ['0,-1', { anchorX: 0.5, anchorY: 1, status: 1 }],
  ['-1,0', { anchorX: 1, anchorY: 0.5, status: 0 }],
  ['1,0', { anchorX: 0, anchorY: 0.5, status: 0 }]
]);
