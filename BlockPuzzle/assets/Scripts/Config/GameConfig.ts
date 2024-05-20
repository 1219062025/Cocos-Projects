import { BlockInfo } from '../Game';
/** Block的宽度 */
export const BlockWidth = 124;
/** Block的高度 */
export const BlockHeight = 124;
/** Cell的宽度 */
export const CellWidth = 124;
/** Cell的高度 */
export const CellHeight = 124;
/** 初始化有多少行 */
export const InitiaRowCount = 8;
/** 初始化有多少列 */
export const InitiaColCount = 8;
/** 游戏区域节点宽度 */
export const GameAreaWidth = InitiaColCount * CellWidth;
/** 游戏区域节点高度 */
export const GameAreaHeight = InitiaRowCount * CellHeight;

export enum BlockType {
  RedBlock = 0,
  OrangeBlock = 1,
  YellowBlock = 2,
  GreenBlock = 3,
  BlueBlock = 4,
  PurpleBlock = 5,
  SkyblueBlock = 6,
  Collection1 = 7,
  Collection2 = 8,
  Collection3 = 9
}
export enum Goal {
  Goal1 = BlockType.Collection1,
  Goal2 = BlockType.Collection2,
  Goal3 = BlockType.Collection3
}
export enum BlockCategory {
  BaseBlock = 0,
  GoalBlock = 1
}
/** Block类型Sprite映射 */
export const BlockInfoMap = new Map<BlockType, BlockInfo>([
  [BlockType.RedBlock, { category: BlockCategory.BaseBlock, path: BlockType[BlockType.RedBlock] }],
  [BlockType.OrangeBlock, { category: BlockCategory.BaseBlock, path: BlockType[BlockType.OrangeBlock] }],
  [BlockType.YellowBlock, { category: BlockCategory.BaseBlock, path: BlockType[BlockType.YellowBlock] }],
  [BlockType.GreenBlock, { category: BlockCategory.BaseBlock, path: BlockType[BlockType.GreenBlock] }],
  [BlockType.BlueBlock, { category: BlockCategory.BaseBlock, path: BlockType[BlockType.BlueBlock] }],
  [BlockType.PurpleBlock, { category: BlockCategory.BaseBlock, path: BlockType[BlockType.PurpleBlock] }],
  [BlockType.SkyblueBlock, { category: BlockCategory.BaseBlock, path: BlockType[BlockType.SkyblueBlock] }],
  [BlockType.Collection1, { category: BlockCategory.GoalBlock, path: BlockType[BlockType.Collection1] }],
  [BlockType.Collection2, { category: BlockCategory.GoalBlock, path: BlockType[BlockType.Collection2] }],
  [BlockType.Collection3, { category: BlockCategory.GoalBlock, path: BlockType[BlockType.Collection3] }]
]);
