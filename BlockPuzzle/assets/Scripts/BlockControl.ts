import { Ranks, BlockInfo } from './Game';
import { BlockType, BlockCategory, BlockInfoMap } from './Config/GameConfig';
const { ccclass, property } = cc._decorator;

@ccclass
export class BlockControl extends cc.Component {
  @property({ type: cc.Sprite, tooltip: '方块颜色图片' })
  BlockSprite: cc.Sprite = null;

  @property({ type: cc.Sprite, tooltip: '匹配成功时方块变化颜色图片' })
  MateSprite: cc.Sprite = null;

  /** 方块的id */
  id: number = Infinity;
  /** 方块的类型 */
  type: BlockType = Infinity;
  /** 方块在哪行 */
  rows: number = -1;
  /** 方块在哪列 */
  cols: number = -1;
  /** 方块信息 */
  BlockInfo: BlockInfo = null;

  Init(type: BlockType) {
    this.type = type;
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    this.BlockInfo = BlockInfoMap.get(type);
    this.SetBlockSprite();
  }

  SetBlockSprite() {
    const SpriteFrame = cc.loader.getRes(this.BlockInfo.path, cc.SpriteFrame) as cc.SpriteFrame;
    this.BlockSprite.spriteFrame = SpriteFrame;
  }

  /** 打开变色 */
  OpenMate(type: BlockType) {
    const BlockInfo = BlockInfoMap.get(type);
    const SpriteFrame = cc.loader.getRes(BlockInfo.path, cc.SpriteFrame) as cc.SpriteFrame;
    this.MateSprite.spriteFrame = SpriteFrame;
    this.MateSprite.node.active = true;
  }

  /** 取消变色 */
  CancelMate() {
    this.MateSprite.node.active = false;
  }

  SetRanks({ rows, cols }: Ranks) {
    this.rows = rows;
    this.cols = cols;
  }
}
