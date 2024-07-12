import ResControl from './resControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResAreaControl extends cc.Component {
  /** 整个游戏区域 */
  @property({ type: cc.Node, tooltip: '整个游戏区域' })
  wrap: cc.Node = null;

  /** 当前选中的资源 */
  curRes: ResControl = null;

  /** 当前选中的资源源位置 */
  curResOriPos: cc.Vec2 = cc.v2(0, 0);

  init() {
    gi.Event.on('touchRes', this.onTouchStart, this);

    this.node.children.forEach(resNode => {
      resNode.on(
        cc.Node.EventType.TOUCH_START,
        (event: cc.Event.EventTouch) => {
          const res = resNode.getComponent(ResControl);
          gi.Event.emit('touchRes', { event, res });
        },
        this
      );
    });

    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onTouchStart({ event, res }: { event: cc.Event.EventTouch; res: ResControl }) {
    const _curResNode = res.unique ? res.node : this.getEffectiveResNode(res.tag);
    if (_curResNode) {
      this.setCurRes(_curResNode.getComponent(ResControl));
      gi.Event.emit('touchStart', event);
    }
  }

  onTouchMove(event: cc.Event.EventTouch) {
    const touchPos = event.getLocation();
    const pos = this.node.convertToNodeSpaceAR(touchPos);
    this.curRes.node.setPosition(pos);
    gi.Event.emit('touchMove', event);
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    gi.Event.emit('touchEnd', event);
  }

  /** 获取指定tag一个还可以拖动的资源节点 */
  getEffectiveResNode(tag: number) {
    const copyArray = this.node.children.slice();
    const _curResNode = copyArray.reverse().find(resNode => {
      return cc.isValid(resNode) && resNode.getComponent(ResControl).tag === tag;
    });
    return _curResNode;
  }

  /** 获取随机一个还可以拖动的资源节点 */
  getRandomEffectiveResNode() {
    const copyArray = this.node.children.slice();
    const _curResNode = copyArray.reverse().find(resNode => cc.isValid(resNode));
    return _curResNode;
  }

  /** 设置选中的资源 */
  setCurRes(res: ResControl) {
    this.curRes = res;
    this.curResOriPos = this.curRes.node.getPosition();
  }

  /** 销毁选中的资源 */
  destroyCurRes() {
    if (cc.isValid(this.curRes.node)) {
      this.node.removeChild(this.curRes.node);
      this.curRes.node.destroy();
      console.log(this.node.childrenCount);
      if (this.node.childrenCount === 0) {
        gi.Event.emit('notHaveRes');
      }
    }
  }

  /** 取消选中的资源 */
  cancleCurRes() {
    if (cc.isValid(this.curRes.node)) {
      (cc.tween(this.curRes.node) as cc.Tween).to(0.2, { position: this.curResOriPos }).start();
    }

    this.curResOriPos = cc.v2(0, 0);
    this.curRes = null;
  }
}
