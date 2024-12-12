import { gi } from "../../@framework/gi";
import GlobalData from "../data/GlobalData";
import Constant from "../gameplay/Constant";
import InteractiveManager from "../gameplay/InteractiveManager";
import Draggable from "../utils/Draggable";

const { ccclass, property, menu } = cc._decorator;

/** 场景中可拖拽物 */
@ccclass
@menu("Interactive/DragObject")
export default class DragObject extends cc.Component {
  @property({
    type: cc.Enum(Constant.DRAG_OBJECT_TYPE),
    displayName: "拖拽物类型",
    tooltip: "INTERACTABLE：可交互物",
  })
  type: number = Constant.DRAG_OBJECT_TYPE.INTERACTABLE;

  @property({
    type: [cc.String],
    tooltip:
      "是否能触发是根据映射表而不是匹配标签，匹配标签用来自动化生成映射关系",
    visible() {
      return this.type === Constant.DRAG_OBJECT_TYPE.INTERACTABLE;
    },
  })
  tags: string[] = [];

  /** 原始位置 */
  private _originalPosition: cc.Vec2 = cc.v2(0, 0);
  /** 原始父节点 */
  private _originalParent: cc.Node = null;
  /** 原始zIndex */
  private _originalSiblingIndex: number = 0;

  onLoad() {
    let draggable = this.node.getComponent(Draggable);

    // 为拖拽物添加拖拽功能
    if (!draggable) {
      draggable = this.addComponent(Draggable);
    }

    // 注册拖拽物到管理器
    InteractiveManager.registerObject(this);

    // 设置 Draggable 回调
    draggable.dragStartCallback = this.onDragStart.bind(this);
    draggable.dragMoveCallback = this.onDragMove.bind(this);
    draggable.dragEndCallback = this.onDragEnd.bind(this);

    // 没什么特别意义，只是方便控制台打印时观察，删掉这行也不会影响逻辑
    this.name = this.node.name;
  }

  /** 拖拽物开始拖拽时的回调 */
  private onDragStart(node: cc.Node, event: cc.Event.EventTouch) {
    // 记录拖拽物的初始位置和层级
    this._originalPosition = node.getPosition();
    this._originalParent = node.parent;
    this._originalSiblingIndex = node.getSiblingIndex();

    // 设置拖拽物节点的父节点为游戏视窗节点，将拖拽物设置到顶层显示
    const globalData = gi.DataManager.getModule<GlobalData>(
      Constant.DATA_MODULE.GLOBAL
    );

    this.node.setParent(globalData.getGameView());
    const worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
    this.node.setPosition(this.node.parent.convertToNodeSpaceAR(worldPos));

    // 阻止事件继续传播，避免只是想拖拽却触发了同一个位置的触摸开始事件
    event.stopPropagation();
  }

  /** 拖拽物移动时的回调 */
  private onDragMove(node: cc.Node, event: cc.Event.EventTouch) {
    event.stopPropagation();
  }

  /** 拖拽物结束拖拽时的回调 */
  private onDragEnd(node: cc.Node, event: cc.Event.EventTouch) {
    const trigger = InteractiveManager.checkTrigger(this);

    if (trigger) {
      InteractiveManager.executeTrigger(trigger);
    } else {
      this.reset();
    }

    // 阻止事件继续传播，避免只是想结束拖拽却触发了同一个位置的触摸结束事件
    event.stopPropagation();
  }

  /** 恢复原位 */
  reset() {
    (cc.tween(this.node) as cc.Tween)
      .to(0.2, { position: this._originalPosition })
      .call(() => {
        // 恢复原位置
        this.node.setPosition(this._originalPosition);
        // 恢复原父节点
        this.node.setParent(this._originalParent);
        // 恢复原层级
        this.node.setSiblingIndex(this._originalSiblingIndex);
      })
      .start();
  }
}
