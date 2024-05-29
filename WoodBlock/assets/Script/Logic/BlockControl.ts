import { BlockCategory } from '../Type/Enum';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockControl extends cc.Component {
  @property({ type: cc.Sprite, tooltip: '方块Sprite' })
  blockSprite: cc.Sprite = null;

  @property({ type: cc.Sprite, tooltip: '变色Sprite' })
  changeSprite: cc.Sprite = null;

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
  }

  setRanks({ row, col }: gi.Ranks) {
    this.row = row;
    this.col = col;
  }

  setChange(type: number, category: number) {
    const spriteFrame = gi.getBlockSprite(type, category);
    this.changeSprite.spriteFrame = spriteFrame;
    this.changeSprite.node.active = true;
  }

  cancleChange() {
    this.changeSprite.node.active = false;
  }
}
