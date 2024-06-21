const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideIcon extends cc.Component {
  @property(cc.Node)
  private upIcon: cc.Node = null;

  @property(cc.Node)
  private downIcon: cc.Node = null;

  copyNode: cc.Node = null;

  onLoad() {
    this.node.setParent(cc.Canvas.instance.node);
    this.upIcon.setSiblingIndex(2);
    this.downIcon.setSiblingIndex(2);
  }

  click() {
    this.down();
    this.scheduleOnce(this.up, 0.1);
  }

  up() {
    this.upIcon.active = true;
    this.downIcon.active = false;
  }

  down() {
    this.upIcon.active = false;
    this.downIcon.active = true;
  }

  movePos(from: cc.Vec2, to: cc.Vec2, options: MoveOptions) {
    return this.move(from, to, options);
  }

  moveNode(fromNode: cc.Node, toNode: cc.Node, options: MoveOptions) {
    const canvas = cc.Canvas.instance.node;

    const from = canvas.convertToNodeSpaceAR(fromNode.convertToWorldSpaceAR(cc.v2(0, 0)));
    const to = canvas.convertToNodeSpaceAR(toNode.convertToWorldSpaceAR(cc.v2(0, 0)));
    return this.move(from, to, options);
  }

  private move(from: cc.Vec2, to: cc.Vec2, options: MoveOptions) {
    if (options.node) {
      options.node.opacity = 160;
      options.node.setParent(this.node);
      options.node.setPosition(0, 0);
      options.node.setSiblingIndex(0);
      this.copyNode = options.node;
    }

    const moveTween = (cc.tween() as cc.Tween).to(options.time, { position: to });

    return (cc.tween(this.node) as cc.Tween)
      .call(() => {
        this.node.setPosition(from);
      })
      .then(moveTween);
  }

  /** 提示点击 */
  promptClick() {
    (cc.tween(this.node) as cc.Tween)
      .delay(1)
      .call(() => {
        this.click();
      })
      .union()
      .repeatForever()
      .start();
  }

  destroyCopyNode() {
    if (!this.copyNode) return;
    this.copyNode.destroy();
  }
}

interface MoveOptions {
  /** 单次移动时间 */
  time: number;
  /** 移动时附带的节点 */
  node?: cc.Node;
}
