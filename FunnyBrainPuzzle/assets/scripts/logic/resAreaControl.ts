const { ccclass, property } = cc._decorator;

@ccclass
export default class ResAreaControl extends cc.Component {
  /** 整个游戏区域 */
  @property({ type: cc.Node, tooltip: '整个游戏区域' })
  wrap: cc.Node = null;

  /** 当前选中的资源 */
  curRes: cc.Node = null;

  /** 当前选中的资源源位置 */
  curResOriPos: cc.Vec2 = cc.v2(0, 0);

  init() {
    gi.Event.on('touchRes', this.onTouchStart, this);

    this.node.children.forEach(resNode => {
      resNode.on(
        cc.Node.EventType.TOUCH_START,
        (event: cc.Event.EventTouch) => {
          gi.Event.emit('touchRes', { event, resNode });
        },
        this
      );
    });

    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onTouchStart({ event, resNode }: { event: cc.Event.EventTouch; resNode: cc.Node }) {
    const _curRes = this.getEffectiveResNode();
    this.setCurRes(_curRes);
    gi.Event.emit('touchStart', event);
  }

  onTouchMove(event: cc.Event.EventTouch) {
    const touchPos = event.getLocation();
    const pos = this.node.convertToNodeSpaceAR(touchPos);
    this.curRes.setPosition(pos);
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    gi.Event.emit('touchEnd', event);
  }

  /** 获取一个场上还可以拖动的资源节点 */
  getEffectiveResNode() {
    const copyArray = this.node.children.slice();
    const _curRes = copyArray.reverse().find(resNode => cc.isValid(resNode));
    return _curRes;
  }

  /** 设置选中的资源 */
  setCurRes(node: cc.Node) {
    this.curRes = node;
    this.curResOriPos = this.curRes.getPosition();
  }

  /** 销毁选中的资源 */
  destroyCurRes() {
    if (cc.isValid(this.curRes)) {
      this.curRes.destroy();
    }
  }

  /** 取消选中的资源 */
  cancleCurRes() {
    if (cc.isValid(this.curRes)) {
      (cc.tween(this.curRes) as cc.Tween).to(0.2, { position: this.curResOriPos }).start();
    }

    this.curResOriPos = cc.v2(0, 0);
    this.curRes = null;
  }
}
