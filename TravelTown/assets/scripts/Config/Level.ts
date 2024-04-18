export const Level = {
  Level1: {
    CellArea: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [-1, 0, 0, 0, 0],
      [-1, -1, -1, -1, -1],
      [-1, -1, -1, -2, -1],
      [-1, -1, -1, -1, -1]
    ],
    GeneratingPointRow: 0,
    GeneratingPointCol: 3,
    SequenceInit: [1, 1, 2, 2, 2, 6]
  }
};

export type Level = {
  /** 格子布局 */
  CellArea: number[][];
  /** 生产点所处行 */
  GeneratingPointRow: number;
  /** 生产点所处列 */
  GeneratingPointCol: number;
  /** 存在元素时，优先使用数组元素的类型生成 */
  SequenceInit: number[];
};
