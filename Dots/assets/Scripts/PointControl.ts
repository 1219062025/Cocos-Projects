import { PointType, PointWidth, PointHeight, InitiaRowCount, GameAreaWidth, GameAreaHeight, PointGap } from './GameConfig';
const { ccclass, property } = cc._decorator;

@ccclass
export default class PointControl extends cc.Component {
  /** PointNode的id */
  id: number = Infinity;
  /** PointNode类型，根据类型确定PointNode的颜色以及连线的颜色 */
  type: number = Infinity;
  /** PointNode在哪行 */
  row: number = -1;
  /** PointNode在哪列 */
  col: number = -1;
  /** 是否被选中 */
  isSelect: boolean = false;

  onLoad() {}

  async Init(type: number, row: number, col: number, position: cc.Vec2, parent: cc.Node) {
    this.type = type;
    this.row = row;
    this.col = col;
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    cc.loader.loadRes(`point/${PointType.get(this.type).label}Item`, cc.SpriteFrame, (err, res) => (this.node.getComponent(cc.Sprite).spriteFrame = res));
    if (parent) {
      this.node.setParent(parent);
      this.PlayFallAnimation(position, true);
    }
  }

  Remove() {
    this.node.destroy();
  }

  Select() {
    this.isSelect = true;
  }

  unSelect() {
    this.isSelect = false;
  }

  /** 播放下落动画 */
  PlayFallAnimation(position: cc.Vec2, isInit: boolean = false) {
    this.node.x = position.x;
    this.node.y = !isInit ? this.node.y : (GameAreaHeight + PointHeight) / 2 + (InitiaRowCount - this.row) * (PointHeight + PointGap);
    return new Promise(resolve => {
      cc.tween(this.node)
        .to(0.25, { position })
        .call(() => {
          resolve({ row: this.row, col: this.col });
        })
        .start();
    });
  }
}
