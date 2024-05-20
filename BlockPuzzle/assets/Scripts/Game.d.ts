import { BlockType, BlockCategory } from 'db://assets/Scripts/Config/GameConfig';

/** 行、列位置信息 */
export type Ranks = {
  /** 行 */
  rows: number;
  /** 列 */
  cols: number;
};

/** 方块信息 */
export type BlockInfo = {
  /** 方块类别 */
  category: BlockCategory;
  /** 方块静态资源path */
  path: string;
};

/** 方块集合信息 */
export type ChunkTemplate = {
  /** 方块集合有多少行 */
  rows: number;
  /** 方块集合有多少列 */
  cols: number;
  /** 方块集合内部的方块 */
  blockInfoList: ChunkBlockInfo[];
};

/** 方块集合内部单个方块的信息 */
export type ChunkBlockInfo = {
  /** 该方块相对于方块集合起始块行的差值 */
  difRows: number;
  /** 该方块相对于方块集合起始块列的差值 */
  difCols: number;
  /** 方块节点本身 */
  blockNode?: cc.Node;
  /** 方块类型 */
  goalType?: BlockType;
  /** 方块类别 */
  category?: BlockCategory;
};
