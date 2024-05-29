const { ccclass, property } = cc._decorator;

@ccclass
export default class CellControl extends cc.Component {
  @property({ type: cc.Sprite, tooltip: '投影Sprite' })
  ghostingSprite: cc.Sprite = null;
  /** 格子所处行 */
  row: number;
  /** 格子所处列 */
  col: number;

  init({ row, col }: gi.Ranks) {
    this.row = row;
    this.col = col;
  }

  setProjection(type: number, category: number) {
    const spriteFrame = gi.getBlockSprite(type, category);
    this.ghostingSprite.spriteFrame = spriteFrame;
    this.ghostingSprite.node.active = true;
  }

  cancleProjection() {
    this.ghostingSprite.node.active = false;
  }
}
