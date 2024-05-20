import { BlockInfoMap, BlockType } from './Config/GameConfig';
import { Ranks } from './Game';

const { ccclass, property } = cc._decorator;

@ccclass
export class CellControl extends cc.Component {
  @property({ type: cc.Sprite, tooltip: '格子颜色图片' })
  CellSprite: cc.Sprite = null;

  @property({ type: cc.Sprite, tooltip: '方块可放置时投影在格子上的颜色图片' })
  ProjectionSprite: cc.Sprite = null;

  /** ___DEBUG START___ */
  @property(cc.Label)
  RanksLabel: cc.Label = null;
  /** ___DEBUG END___ */

  /** CellNode的id */
  id: number = Infinity;
  /** CellNode在哪行 */
  rows: number = -1;
  /** CellNode在哪列 */
  cols: number = -1;

  Init(rows: number, cols: number) {
    this.SetRanks({ rows, cols });
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);

    this.RanksLabel.string = `${rows + 1},${cols + 1}`;
  }

  /** 打开投影 */
  OpenProjection(ChunkType: BlockType) {
    const BlockInfo = BlockInfoMap.get(ChunkType);
    const SpriteFrame = cc.loader.getRes(BlockInfo.path, cc.SpriteFrame) as cc.SpriteFrame;
    this.ProjectionSprite.spriteFrame = SpriteFrame;
    this.ProjectionSprite.node.active = true;
  }

  /** 取消投影 */
  CancelProjection() {
    this.ProjectionSprite.node.active = false;
  }

  SetRanks({ rows, cols }: Ranks) {
    this.rows = rows;
    this.cols = cols;
  }
}
