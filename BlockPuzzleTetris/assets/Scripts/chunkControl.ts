import { centerChildren } from './CommonScripts/Utils';
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
    this.type = Math.floor(Math.random() * gi.BASEBLOCKCOUNT) + 1;

    // 遍历生成方块
    blocks.forEach(blockInfo => {
      const { difRows, difCols } = blockInfo;
      const block = this.blockBuilder(this.type).ctrl;
      // 根据行、列的差值计算坐标
      const x = difCols * gi.BLOCKWIDTH;
      const y = -difRows * gi.BLOCKHEIGHT;
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
    this.node.setContentSize(cols * gi.BLOCKWIDTH, rows * gi.BLOCKHEIGHT);
    // 居中
    centerChildren(this.node);
  }

  setType(type: number) {
    this.type = type;
    this.data.blocks.forEach(blockInfo => {
      const block = blockInfo.self.getComponent(BlockControl);
      block.setType(8);
    });
  }

  /** 方块生成器 */
  blockBuilder(type: number) {
    const res = gi.prefabBuilder(this.blockPrefab, BlockControl);
    res.ctrl.init(type);
    return res;
  }
}
