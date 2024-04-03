import { PointType, PointWidth, PointHeight, InitiaRowCount, GameAreaWidth, GameAreaHeight, PointGap } from './GameConfig';
const { ccclass, property } = cc._decorator;

@ccclass
export default class PointControl extends cc.Component {
  @property({ type: cc.Node, tooltip: '用来展示选中节点时动画效果的节点' })
  SelectAnimationNode: cc.Node = null;
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

  /** 初始化PointNode */
  async Init(type: number, row: number, col: number, position: cc.Vec2, parent: cc.Node) {
    this.type = type;
    this.row = row;
    this.col = col;
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    cc.loader.loadRes(`Fortunedots/point/${PointType.get(this.type).label}Item`, cc.SpriteFrame, (err, res) => {
      this.node.width = PointWidth;
      this.node.height = PointHeight;
      this.node.getComponent(cc.Sprite).spriteFrame = res;
      this.InitSelectAnimationNode(res);
    });
    if (parent) {
      this.node.setParent(parent);
      this.PlayFallAnimation(position, true);
    }
  }

  /** 初始化动画节点 */
  InitSelectAnimationNode(res: cc.SpriteFrame) {
    this.SelectAnimationNode.width = PointWidth;
    this.SelectAnimationNode.height = PointHeight;
    this.SelectAnimationNode.getComponent(cc.Sprite).spriteFrame = res;
  }

  /** 选中PointNode */
  Select() {
    this.isSelect = true;
    this.PlaySelectAnimation();
  }

  /** 取消选中PointNode */
  unSelect() {
    this.isSelect = false;
  }

  /** 播放选中动画 */
  PlaySelectAnimation() {
    this.SelectAnimationNode.getComponent(cc.Animation).play();
  }

  /** 播放下落动画 */
  PlayFallAnimation(position: cc.Vec2, isInit: boolean = false, time: number = 0.25) {
    this.node.x = position.x;
    this.node.y = !isInit ? this.node.y : (GameAreaHeight + PointHeight) / 2 + (InitiaRowCount - this.row) * (PointHeight + PointGap);
    return new Promise(resolve => {
      cc.tween(this.node)
        .to(time, { position })
        .call(() => {
          resolve({ row: this.row, col: this.col });
        })
        .start();
    });
  }

  /** 播放消除动画 */
  PlayDieAnimation() {
    return new Promise<void>(resovle => {
      const animation = this.node.getComponent(cc.Animation);
      animation.play();
      animation.on(cc.Animation.EventType.FINISHED, () => resovle(), this);
    });
  }

  Remove() {
    return new Promise<void>(async resolve => {
      await this.PlayDieAnimation();
      this.node.destroy();
      resolve();
    });
  }
}
