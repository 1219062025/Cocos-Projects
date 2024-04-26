/** 初始化有多少行 */
export const InitiaRowCount = 20;
/** 初始化有多少列 */
export const InitiaColCount = 15;
/** 初始化有多少个地块Plot */
export const InitiaPlotCount = InitiaRowCount * InitiaColCount;
export enum Unit {
  item0,
  item1,
  item2,
  item3,
  item4,
  item5,
  adorn0,
  adorn1,
  adorn2,
  adorn3,
  adorn4,
  adorn5,
  adorn6
}
export enum UnitType {
  Adorn,
  Item
}
/** Unit映射 */
export const UnitInfoMap = new Map([
  [Unit.item0, { unitType: UnitType.Item, maxLevle: 1, path: Unit[Unit.item0] }],
  [Unit.item1, { unitType: UnitType.Item, maxLevle: 2, path: Unit[Unit.item1] }],
  [Unit.item2, { unitType: UnitType.Item, maxLevle: 2, path: Unit[Unit.item2] }],
  [Unit.item3, { unitType: UnitType.Item, maxLevle: 1, path: Unit[Unit.item3] }],
  [Unit.item4, { unitType: UnitType.Item, maxLevle: 1, path: Unit[Unit.item4] }],
  [Unit.item5, { unitType: UnitType.Item, maxLevle: 1, path: Unit[Unit.item5] }],
  [Unit.adorn0, { unitType: UnitType.Adorn, path: Unit[Unit.adorn0] }],
  [Unit.adorn1, { unitType: UnitType.Adorn, path: Unit[Unit.adorn1] }],
  [Unit.adorn2, { unitType: UnitType.Adorn, path: Unit[Unit.adorn2] }],
  [Unit.adorn3, { unitType: UnitType.Adorn, path: Unit[Unit.adorn3] }],
  [Unit.adorn4, { unitType: UnitType.Adorn, path: Unit[Unit.adorn4] }],
  [Unit.adorn5, { unitType: UnitType.Adorn, path: Unit[Unit.adorn5] }],
  [Unit.adorn6, { unitType: UnitType.Adorn, path: Unit[Unit.adorn6] }]
]);
export enum PlotType {
  Empty,
  Base
}
