const { ccclass, property, disallowMultiple } = cc._decorator;

type DragCallback = (node: cc.Node, event: cc.Event.EventTouch) => void;

/** 拖拽控制脚本 */
@ccclass
@disallowMultiple
export default class Draggable extends cc.Component {
  /** 拖拽开始回调 */
  dragStartCallback: DragCallback = null;

  /** 拖拽移动回调 */
  dragMoveCallback: DragCallback = null;

  /** 拖拽结束回调 */
  dragEndCallback: DragCallback = null;

  private _isDragging: boolean = false;

  disable: boolean = false;

  onEnable() {
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  onDisable() {
    this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
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
