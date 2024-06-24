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
    const copyArray = this.node.children.slice();
    const _curRes = copyArray.reverse().find(resNode => cc.isValid(resNode));

    this.setCurRes(_curRes);
  }

  onTouchMove(event: cc.Event.EventTouch) {
    const touchPos = event.getLocation();
    const pos = this.node.convertToNodeSpaceAR(touchPos);
    this.curRes.setPosition(pos);
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    gi.Event.emit('touchEnd', event);
  }

  decRes() {
    this.curRes.destroy();
  }

  /** 设置当前资源 */
  setCurRes(node: cc.Node) {
    this.curRes = node;
    this.curResOriPos = this.curRes.getPosition();
  }

  /** 取消选中的资源 */
  cancleCurRes() {
    if (cc.isValid(this.curRes)) {
      (cc.tween(this.curRes) as cc.Tween).to(0.2, { position: this.curResOriPos }).start();
      this.curRes = null;
      this.curResOriPos = cc.v2(0, 0);
    }
  }
}
