import BranchController from "../BranchController";
import Command from "./Command";
const { ccclass, property, menu } = cc._decorator;

enum ActionOptions {
  CLICK,
  DOUBLE_CLICK,
  UP,
  BOTTOM,
  LEFT,
  RIGHT,
}

enum OperateOptions {
  ON,
  ONCE,
}

@ccclass
@menu("Fungus/Command/Event | ActionCommand")
export class ActionCommand extends Command {
  @property({
    type: cc.Enum(ActionOptions),
    tooltip:
      "CLICK：单击\nDOUBLE_CLICK：双击\nUP：上滑\nBOTTOM：下滑\nLEFT：左滑\nRIGHT：右滑",
  })
  type: number = ActionOptions.CLICK;

  @property({
    type: cc.Enum(OperateOptions),
    tooltip: "ON：监听\nONCE：一次性监听",
  })
  operate: number = OperateOptions.ONCE;

  @property({
    displayName: "滑动阈值",
    tooltip: "滑动事件的阈值，单位像素。",
    min: 1,
    visible() {
      return this._valid(
        this.type,
        ActionOptions.UP,
        ActionOptions.BOTTOM,
        ActionOptions.LEFT,
        ActionOptions.RIGHT
      );
    },
  })
  threshold: number = 50; // 默认滑动阈值

  @property({
    displayName: "单击阈值",
    tooltip: "单击事件的阈值，用于判断是否为单击还是拖动，单位像素",
    min: 1,
    visible() {
      return this._valid(this.type, ActionOptions.CLICK);
    },
  })
  clickThreshold: number = 10; // 默认单击阈值

  @property({
    displayName: "双击阈值",
    tooltip: "双击事件的阈值，用于判断是否为有效双击，单位ms",
    min: 1,
    visible() {
      return this._valid(this.type, ActionOptions.DOUBLE_CLICK);
    },
  })
  doubleClickThreshold: number = 300; // 默认双击阈值

  @property({
    displayName: "阻止事件传递",
    tooltip: "调用event.stopPropagation()",
    visible() {
      return this._valid(
        this.type,
        ActionOptions.CLICK,
        ActionOptions.DOUBLE_CLICK
      );
    },
  })
  stopPropagation: boolean = false;

  @property({
    displayName: "冒泡传递",
    tooltip: "监听事件时useCapture传递true",
    visible() {
      return this._valid(
        this.type,
        ActionOptions.CLICK,
        ActionOptions.DOUBLE_CLICK
      );
    },
  })
  useCapture: boolean = false;

  @property({
    type: [cc.String],
    tooltip: "事件触发后调用BranchController解析表达式",
  })
  expressions: string[] = [];

  execute() {
    switch (this.type) {
      case ActionOptions.CLICK:
        this._listenClickEvent();
        break;
      case ActionOptions.DOUBLE_CLICK:
        this._listenDoubleClickEvent();
        break;
      case ActionOptions.UP:
      case ActionOptions.BOTTOM:
      case ActionOptions.LEFT:
      case ActionOptions.RIGHT:
        this._listenSwipeEvent();
        break;
    }
    return Promise.resolve();
  }

  /** 单击事件的监听 */
  private _listenClickEvent() {
    let startTouchPosition: cc.Vec2;

    const StartEvent = (event: cc.Event.EventTouch) => {
      startTouchPosition = event.getLocation();

      if (this.stopPropagation) event.stopPropagation();
    };

    const EndEvent = (event: cc.Event.EventTouch) => {
      const moveDistance = startTouchPosition
        .subtract(event.getLocation())
        .mag();
      if (moveDistance <= this.clickThreshold) {
        this._off(StartEvent, null, EndEvent);
        this._onEventTriggered();
      }

      if (this.stopPropagation) event.stopPropagation();
    };

    this.node.on(
      cc.Node.EventType.TOUCH_START,
      StartEvent,
      this,
      this.useCapture
    );
    this.node.on(cc.Node.EventType.TOUCH_END, EndEvent, this, this.useCapture);
  }

  /** 双击事件的监听 */
  private _listenDoubleClickEvent() {
    let lastTapTime = 0;

    const EndEvent = (event: cc.Event.EventTouch) => {
      const currentTime = cc.director.getTotalTime();
      if (currentTime - lastTapTime <= this.doubleClickThreshold) {
        // 判断双击
        this._off(null, null, EndEvent);
        this._onEventTriggered();
      }
      lastTapTime = currentTime;

      if (this.stopPropagation) event.stopPropagation();
    };

    this.node.on(cc.Node.EventType.TOUCH_END, EndEvent, this, this.useCapture);
  }

  /** 滑动事件监听 */
  private _listenSwipeEvent() {
    let startTouchPosition: cc.Vec2;
    let endTouchPosition: cc.Vec2;

    const StartEvent = (event: cc.Event.EventTouch) => {
      startTouchPosition = event.getLocation();
    };

    const EndEvent = (event: cc.Event.EventTouch) => {
      endTouchPosition = event.getLocation();

      const deltaX = endTouchPosition.x - startTouchPosition.x;
      const deltaY = endTouchPosition.y - startTouchPosition.y;

      // 水平滑动
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) <= this.threshold) return; // 滑动没到阈值

        if (deltaX > 0 && this.type === ActionOptions.RIGHT) {
          // deltaX > 0意味着用户操作向右滑
          this._off(StartEvent, null, EndEvent);
          this._onEventTriggered();
          return;
        } else if (deltaX < 0 && this.type === ActionOptions.LEFT) {
          // deltaX < 0意味着用户操作向左滑
          this._off(StartEvent, null, EndEvent);
          this._onEventTriggered();
          return;
        }
      }

      // 水平滑动
      if (Math.abs(deltaX) < Math.abs(deltaY)) {
        if (Math.abs(deltaY) <= this.threshold) return; // 滑动没到阈值

        if (deltaY > 0 && this.type === ActionOptions.UP) {
          // deltaY > 0意味着用户操作向上滑
          this._off(StartEvent, null, EndEvent);
          this._onEventTriggered();
          return;
        } else if (deltaY < 0 && this.type === ActionOptions.BOTTOM) {
          // deltaY < 0意味着用户操作向下滑
          this._off(StartEvent, null, EndEvent);
          this._onEventTriggered();
          return;
        }
      }
    };

    // 滑动事件的监听
    this.node.on(cc.Node.EventType.TOUCH_START, StartEvent, this);
    this.node.on(cc.Node.EventType.TOUCH_END, EndEvent, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, EndEvent, this);
  }

  private _onEventTriggered() {
    // 事件触发后可以执行其他操作
    console.log("事件已触发: ", this.type);

    if (this.expressions) {
      const branch = this.node.getComponent(BranchController);
      if (branch) {
        branch.expressions = this.expressions;
        branch.executeBranch();
      }
    }
  }

  private _valid(type: number, ...args: number[]) {
    const valid = [...args];
    return valid.includes(type);
  }

  private _off(start: Function, move: Function, end: Function) {
    if (this.operate === OperateOptions.ONCE) {
      if (start) this.node.off(cc.Node.EventType.TOUCH_START, start, this);
      if (move) this.node.off(cc.Node.EventType.TOUCH_MOVE, move, this);
      if (end) this.node.off(cc.Node.EventType.TOUCH_END, end, this);
      if (end) this.node.off(cc.Node.EventType.TOUCH_CANCEL, end, this);
    }
  }
}
