import { gi } from "../../../@framework/gi";
import DragObject from "../../entities/DragObject";
import Constant from "../Constant";

/** 拖拽物组 */
export default class DragObjectGroup {
  /** 唯一标识 */
  public key: string = "";

  /** 拖拽物数组 */
  private _dragObjects: DragObject[] = [];
  /** 当前组里选中的拖拽物 */
  private _currentObject: DragObject;

  constructor(key: string) {
    this.key = key;

    gi.EventManager.on(Constant.EVENT.DRAG.DRAG_START, this.onDragStart, this);
    gi.EventManager.on(Constant.EVENT.DRAG.DRAG_MOVE, this.onDragMove, this);
    gi.EventManager.on(Constant.EVENT.DRAG.DRAG_END, this.onDragEnd, this);
  }

  private getHightPriorityObject() {
    if (this._dragObjects.length === 0) {
      throw new Error(`The length of Group ${this.key} is 0`);
    }
    // 对组内的对象按照优先级排序
    return this._dragObjects.sort((a, b) => b.priority - a.priority)[0];
  }

  private onDragStart(event: cc.Event.EventTouch) {
    if (this._currentObject) return;

    this._currentObject = this.getHightPriorityObject();
    this._currentObject.handleDragStart(this._currentObject.node, event);
  }

  private onDragMove(event: cc.Event.EventTouch) {
    this._currentObject.handleDragMove(this._currentObject.node, event);
  }

  private onDragEnd(event: cc.Event.EventTouch) {
    this._currentObject.handleDragEnd(this._currentObject.node, event);
    this._currentObject = null;
  }

  public add(object: DragObject) {
    this._dragObjects.push(object);
  }
}
