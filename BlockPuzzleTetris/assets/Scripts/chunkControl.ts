import { centerChildren } from './Common/Utils';
import BlockControl from './blockControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChunkControl extends cc.Component {
  @property({ type: cc.Prefab, tooltip: '方块预制体' })
  blockPrefab: cc.Prefab = null;

  /** 块的主要颜色/特征 */
  type: number = -1;

  /** 块数据 */
  data: gi.ChunkData;

  /** 初始化块 */
  init(chunkData: gi.ChunkData) {
    const { rows, cols, blocks } = chunkData;
    this.type = Math.floor(Math.random() * gi.baseBlockCount);

    // 遍历生成方块
    blocks.forEach(blockInfo => {
      const { difRows, difCols } = blockInfo;
      const block = this.blockBuilder(this.type);
      // 根据行、列的差值计算坐标
      const x = difCols * gi.blockWidth;
      const y = -difRows * gi.blockHeight;
      // 设置坐标系、坐标
      block.node.setParent(this.node);
      block.node.setPosition(x, y);

      // 保存方块引用
      blockInfo.self = block.node;
      blockInfo.type = this.type;

      // 保存起始块引用
      if (difRows === 0 && difCols === 0) {
        chunkData.startBlock = { difRows, difCols, self: block.node };
      }
    });

    this.data = chunkData;
    this.node.setContentSize(cols * gi.blockWidth, rows * gi.blockHeight);
    // 居中
    centerChildren(this.node);
  }

  /** 方块生成器 */
  blockBuilder(type: number) {
    const blockNode = cc.instantiate(this.blockPrefab);
    const block = blockNode.getComponent(BlockControl);
    block.init(type);
    return block;
  }
}
