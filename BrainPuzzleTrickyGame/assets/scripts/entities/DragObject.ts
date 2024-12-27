import { gi } from "../../@framework/gi";
import GlobalData from "../data/GlobalData";
import Constant from "../gameplay/Constant";
import InteractiveManager from "../gameplay/interactive/InteractiveManager";
import Draggable from "../utils/Draggable";

const { ccclass, property, menu } = cc._decorator;

/** 触发次数归零后的行为类型 */
enum DepletionBehavior {
  DESTORY,
  RESET,
}

/** 场景中可拖拽物 */
@ccclass
@menu("Interactive/DragObject")
export default class DragObject extends cc.Component {
  @property({
    type: cc.Enum(Constant.DRAG_OBJECT_TYPE),
    displayName: "拖拽物类型",
    tooltip: "INTERACTABLE：可交互物\nDRAG：普通拖拽物",
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

  @property({
    displayName: "触发次数",
    tooltip: "拖拽物能触发触发器的次数，设置为-1相当于可无限触发",
    visible() {
      return this.type === Constant.DRAG_OBJECT_TYPE.INTERACTABLE;
    },
    step: 1,
    min: -1,
  })
  repeat: number = 1;

  @property({
    type: cc.Enum(DepletionBehavior),
    displayName: "触发次数归零后的行为",
    tooltip: "DESTORY：销毁拖拽物\nRESET：恢复原位",
    visible() {
      return this.type === Constant.DRAG_OBJECT_TYPE.INTERACTABLE;
    },
  })
  depletionBehavior: number = DepletionBehavior.DESTORY;

  @property({
    type: cc.Node,
    displayName: "占位节点",
    tooltip: "拖拽开始时替代当前节点进行拖动",
  })
  dragPlaceholder: cc.Node = null;

  @property({
    displayName: "所属组",
    tooltip:
      "可选，所属组的Key，如果组不存在会自动创建\n加入组后选中拖拽物前会按照组规则排序",
  })
  group: string = "";

  @property({
    displayName: "优先级",
    tooltip: "拖拽物的优先级，优先选中级别高的拖拽物，仅对同组拖拽物生效",
    step: 1,
  })
  priority: number = 0;

  isDragging: boolean = false;

  /** 拖拽前原始状态 */
  private _originalState: {
    /** 原始位置 */
    position: cc.Vec2;
    /** 原始父节点 */
    parent: cc.Node;
    /** 原始层级 */
    siblingIndex: number;
  } = {
    position: cc.v2(0, 0),
    parent: null,
    siblingIndex: 0,
  };

  onLoad() {
    // 注册拖拽物到管理器
    InteractiveManager.registerObject(this);

    if (this.group) {
      InteractiveManager.joinGroup(this.group, this);
    } else {
      // 挂载拖拽控制
      this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
      this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
      this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    // 初始化拖动占位节点
    if (this.dragPlaceholder) {
      this.dragPlaceholder.active = false;
    }

    // 记录拖拽物的原始位置和层级
    this._originalState.position = this.node.getPosition();
    this._originalState.parent = this.node.parent;
    this._originalState.siblingIndex = this.node.getSiblingIndex();

    // 没什么特别意义，只是方便控制台打印时观察，删掉这行也不会影响逻辑
    this.name = this.node.name;
  }

  onDisable() {
    this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  private onTouchStart(event: cc.Event.EventTouch) {
    if (this.isDragging) {
      return event.stopPropagation();
    }

    this.handleDragStart(this.node, event);
  }

  private onTouchMove(event: cc.Event.EventTouch) {
    if (!this.isDragging) {
      return event.stopPropagation();
    }

    this.handleDragMove(this.node, event);
  }

  private onTouchEnd(event: cc.Event.EventTouch) {
    if (!this.isDragging) {
      return event.stopPropagation();
    }

    this.handleDragEnd(this.node, event);
  }

  /** 拖拽物开始拖拽时的回调 */
  public handleDragStart(node: cc.Node, event: cc.Event.EventTouch) {
    this.isDragging = true;
    // 设置拖拽物节点的父节点为游戏视窗节点，将拖拽物设置到顶层显示
    const globalData = gi.DataManager.getModule<GlobalData>(
      Constant.DATA_MODULE.GLOBAL
    );

    this.updatePlaceholderState(true);

    const placeholder = this.dragPlaceholder || this.node;
    placeholder.setParent(globalData.getGameView());
    placeholder.setPosition(
      placeholder.parent.convertToNodeSpaceAR(event.getLocation())
    );

    // 阻止事件继续传播，避免只是想拖拽却触发了同一个位置的触摸开始事件
    event.stopPropagation();
  }

  /** 拖拽物移动时的回调 */
  public handleDragMove(node: cc.Node, event: cc.Event.EventTouch) {
    const touchPos = node.parent.convertToNodeSpaceAR(event.getLocation());
    node.setPosition(touchPos);

    if (this.dragPlaceholder) {
      const touchPos = this.dragPlaceholder.parent.convertToNodeSpaceAR(
        event.getLocation()
      );
      this.dragPlaceholder.setPosition(touchPos);
    }

    // 阻止事件继续传播，避免只是想拖拽却触发了同一个位置的触摸开始事件
    event.stopPropagation();
  }

  /** 拖拽物结束拖拽时的回调 */
  public handleDragEnd(node: cc.Node, event: cc.Event.EventTouch) {
    if (this.type === Constant.DRAG_OBJECT_TYPE.INTERACTABLE) {
      this.onInteractive(node, event);
    } else {
      this.reset();
    }

    // 阻止事件继续传播，避免只是想拖拽却触发了同一个位置的触摸开始事件
    event.stopPropagation();
  }

  /** 处理交互物 */
  private onInteractive(node: cc.Node, event: cc.Event.EventTouch) {
    if (this.repeat < -1) return;

    if (this.repeat === 0) {
      return this.switchBehavior();
    }

    const trigger = InteractiveManager.checkTrigger(this);

    if (trigger) {
      const state = InteractiveManager.executeTrigger(this, trigger);

      if (state === true) {
        this.repeat = this.repeat === -1 ? -1 : this.repeat - 1;

        if (this.repeat === 0) {
          return this.switchBehavior();
        }
      }
    }

    this.reset();
  }

  /** 选择行为 */
  private switchBehavior() {
    switch (this.depletionBehavior) {
      case DepletionBehavior.DESTORY:
        this.updatePlaceholderState(false);
        InteractiveManager.unregisterObject(this);
        this.node.destroy();
        break;
      case DepletionBehavior.RESET:
        this.reset();
        break;
    }
  }

  /** 恢复原位 */
  private reset() {
    const placeholder = this.dragPlaceholder || this.node;

    const targetPos = placeholder.parent.convertToNodeSpaceAR(
      this._originalState.parent.convertToWorldSpaceAR(
        this._originalState.position
      )
    );

    (cc.tween(placeholder) as cc.Tween)
      .to(0.2, { position: targetPos })
      .call(() => {
        // 恢复原位置
        this.node.setPosition(this._originalState.position);
        // 恢复原父节点
        this.node.setParent(this._originalState.parent);
        // 恢复原层级
        this.node.setSiblingIndex(this._originalState.siblingIndex);

        this.updatePlaceholderState(false);

        this.isDragging = false;
      })
      .start();
  }

  /** 更新占位节点的状态 */
  private updatePlaceholderState(state: boolean) {
    if (!this.dragPlaceholder) return;

    if (state) {
      // 设置占位节点的初始状态与原节点一致
      this.dragPlaceholder.setParent(this._originalState.parent);
      this.dragPlaceholder.setPosition(this._originalState.position);
      this.dragPlaceholder.setSiblingIndex(this._originalState.siblingIndex);
      // 隐藏原节点
      this.node.opacity = 0;
      // 显示拖动占位节点
      this.dragPlaceholder.active = true;
    } else {
      // 隐藏占位节点
      this.dragPlaceholder.active = false;
      // 恢复原节点显示
      this.node.opacity = 255;
    }
  }
}
