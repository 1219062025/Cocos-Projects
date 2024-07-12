interface MoveOptions {
  /** 单次移动时间 */
  time: number;
  /** 引导节点 */
  guide: cc.Node;
  /** 移动时附带的节点 */
  node?: cc.Node;
}

export default class Guide {
  /** 当前引导步骤 */
  private static _step: number = 1;

  /** 当前是否处于引导中 */
  static inGuide: boolean = false;

  /** 引导时携带的节点 */
  private static _copyNode: cc.Node = null;

  /** 设置当前引导步骤 */
  static setStep(step: number) {
    this._step = step;
  }

  /** 获取当前引导步骤 */
  static getStep() {
    return this._step;
  }

  /** 下一步引导 */
  static nextStep() {
    this._step++;
  }

  /**
   * 得到一个从位置from移动到位置to的缓动
   * @param {cc.Vec2} from 起始位置
   * @param {cc.Vec2} to 终点位置
   */
  static fromToPos(from: cc.Vec2, to: cc.Vec2, options: MoveOptions) {
    return this.move(from, to, options);
  }

  /**
   * 得到一个从节点from的位置移动到节点to的位置的缓动
   * @param {cc.Node} from 起始节点
   * @param {cc.Node} to 终点节点
   */
  static fromToNode(fromNode: cc.Node, toNode: cc.Node, options: MoveOptions) {
    const from = options.guide.parent.convertToNodeSpaceAR(fromNode.convertToWorldSpaceAR(cc.v2(0, 0)));
    const to = options.guide.parent.convertToNodeSpaceAR(toNode.convertToWorldSpaceAR(cc.v2(0, 0)));
    return this.move(from, to, options);
  }

  private static move(from: cc.Vec2, to: cc.Vec2, options: MoveOptions) {
    if (options.node) {
      options.node.opacity = 160;
      options.node.setParent(options.guide);
      options.node.setPosition(0, 0);
      options.node.setSiblingIndex(0);
      this.destroyCopyNode();
      this._copyNode = options.node;
    }

    const moveTween = (cc.tween() as cc.Tween)
      .call(() => {
        options.guide.setPosition(from);
        options.guide.active = true;
        if (this._copyNode) {
          this._copyNode.active = true;
        }
      })
      .to(options.time, { position: to })
      .call(() => {
        if (this._copyNode) {
          this._copyNode.active = false;
        }
      });

    return (cc.tween(options.guide) as cc.Tween).then(moveTween);
  }

  /** 销毁附带的节点 */
  static destroyCopyNode() {
    if (!cc.isValid(this._copyNode)) return;
    this._copyNode.destroy();
  }
}
