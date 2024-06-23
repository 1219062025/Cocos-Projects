const { ccclass, property } = cc._decorator;

@ccclass
export default class ResAreaControl extends cc.Component {
  /** 整个游戏区域 */
  @property({ type: cc.Node, tooltip: '整个游戏区域' })
  wrap: cc.Node = null;

  @property({ type: [cc.Node], tooltip: '资源' })
  resNodes: cc.Node[] = [];

  /** 当前选中的资源 */
  curRes: cc.Node = null;

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
    const _curRes = this.resNodes.find(resNode => cc.isValid(resNode));

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

  /** 设置当前资源 */
  setCurRes(node: cc.Node) {
    this.curRes = node;
  }

  /** 取消选中的资源 */
  cancleCurRes() {
    this.curRes.setPosition(0, 0);
    this.curRes = null;
  }
}
