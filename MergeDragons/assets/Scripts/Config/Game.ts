/** 初始化有多少行 */
export const InitiaRowCount = 20;
/** 初始化有多少列 */
export const InitiaColCount = 15;
/** 初始化有多少个地块Plot */
export const InitiaPlotCount = InitiaRowCount * InitiaColCount;
export enum Plot {
  RedPlot = 1,
  OrangePlot = 2,
  YellowPlot = 3,
  GreenPlot = 4,
  BluePlot = 5,
  PurplePlot = 6,
  HorizontalPlot = 7,
  VerticalPlot = 8,
  ColorPlot = 9
}
export enum Category {
  BasePlot = 1,
  HorizontalPlot = 2,
  VerticalPlot = 3,
  ColorPlot = 4
}
/** Plot类型Sprite映射 */
export const PlotType = new Map([
  [Plot.RedPlot, { category: Category.BasePlot, path: Plot[Plot.RedPlot] }],
  [Plot.OrangePlot, { category: Category.BasePlot, path: Plot[Plot.OrangePlot] }],
  [Plot.YellowPlot, { category: Category.BasePlot, path: Plot[Plot.YellowPlot] }],
  [Plot.GreenPlot, { category: Category.BasePlot, path: Plot[Plot.GreenPlot] }],
  [Plot.BluePlot, { category: Category.BasePlot, path: Plot[Plot.BluePlot] }],
  [Plot.PurplePlot, { category: Category.BasePlot, path: Plot[Plot.PurplePlot] }],
  [Plot.HorizontalPlot, { category: Category.HorizontalPlot, path: Plot[Plot.HorizontalPlot] }],
  [Plot.VerticalPlot, { category: Category.VerticalPlot, path: Plot[Plot.VerticalPlot] }],
  [Plot.ColorPlot, { category: Category.ColorPlot, path: Plot[Plot.ColorPlot] }]
]);
