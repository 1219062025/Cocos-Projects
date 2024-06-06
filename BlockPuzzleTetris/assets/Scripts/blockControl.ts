import { BlockCategory } from './Type/Enum';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockControl extends cc.Component {
  @property({ type: cc.Sprite, tooltip: '方块Sprite' })
  blockSprite: cc.Sprite = null;

  /** 方块类目 */
  category: BlockCategory;
  /** 当前所属方块类目下的类型 */
  type: number;
  /** 行 */
  row: number;
  /** 列 */
  col: number;

  init(type: number) {
    this.category = BlockCategory.BASEBLOCK;
    this.type = type;
    const categoryName = BlockCategory[this.category];
    const path = `${categoryName}/${this.type}`;
    const spriteFrame = cc.loader.getRes(path, cc.SpriteFrame) as cc.SpriteFrame;
    this.blockSprite.spriteFrame = spriteFrame;

    this.node.setContentSize(gi.blockWidth, gi.blockHeight);
    this.blockSprite.node.setContentSize(gi.blockWidth, gi.blockHeight);
  }

  setRanks({ row, col }: gi.Ranks) {
    this.row = row;
    this.col = col;
  }
}
