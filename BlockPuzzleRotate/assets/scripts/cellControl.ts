const { ccclass, property } = cc._decorator;

@ccclass
export default class CellControl extends cc.Component {
  @property({ type: cc.Sprite, tooltip: '投影Sprite' })
  ghostingSprite: cc.Sprite = null;

  /** 行 */
  row: number;
  /** 列 */
  col: number;

  setProjection(type: number, category: string) {
    const spriteFrame = gi.getBlockSprite(type, category);
    this.ghostingSprite.spriteFrame = spriteFrame;
    this.ghostingSprite.node.active = true;
  }

  cancleProjection() {
    this.ghostingSprite.node.active = false;
  }

  setRanks({ row, col }: gi.Ranks) {
    this.row = row;
    this.col = col;
  }
}
