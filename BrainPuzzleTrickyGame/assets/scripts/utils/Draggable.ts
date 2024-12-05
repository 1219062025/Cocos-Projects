const { ccclass, property } = cc._decorator;

/** 拖拽控制脚本 */
@ccclass
export default class Draggable extends cc.Component {
  /** 拖拽开始回调 */
  dragStartCallback: Function = null;

  /** 拖拽移动回调 */
  dragMoveCallback: Function = null;

  /** 拖拽结束回调 */
  dragEndCallback: Function = null;

  /** 是否拖拽中 */
  private _isDragging: boolean = false;

  onLoad() {
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onTouchStart(event: cc.Event.EventTouch) {
    this._isDragging = true;

    if (this.dragStartCallback) {
      this.dragStartCallback(this.node, event);
    }
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (!this._isDragging) return;

    const touchPos = this.node.parent.convertToNodeSpaceAR(event.getLocation());
    this.node.setPosition(touchPos);

    if (this.dragMoveCallback) {
      this.dragMoveCallback(this.node, event);
    }
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    this._isDragging = false;
    if (this.dragEndCallback) {
      this.dragEndCallback(this.node, event);
    }
  }
}
