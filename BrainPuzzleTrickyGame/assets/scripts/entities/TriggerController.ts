import BranchController from "../gameplay/fungus/BranchController";
import InteractiveManager from "../gameplay/interactive/InteractiveManager";

const { ccclass, property, menu, requireComponent } = cc._decorator;

/** 触发次数归零后的行为类型 */
enum DepletionBehavior {
  /** 空闲 */
  IDLE,
}

@ccclass
@menu("Interactive/TriggerController")
@requireComponent(cc.BoxCollider)
export default class TriggerController extends cc.Component {
  @property({
    type: [cc.String],
    tooltip:
      "是否能触发是根据映射表而不是匹配标签，匹配标签用来自动化生成映射关系",
  })
  tags: string[] = [];

  @property({
    displayName: "触发次数",
    tooltip: "触发器能被触发的次数，设置为-1相当于可无限触发",
    step: 1,
    min: -1,
  })
  repeat: number = 1;

  @property({
    type: cc.Enum(DepletionBehavior),
    displayName: "触发次数归零后的行为",
    tooltip: "IDLE：空闲",
  })
  depletionBehavior: number = DepletionBehavior.IDLE;

  /** 触发器的优先级，触发时先触发优先级高的触发器 */
  @property({
    tooltip: "触发器的优先级，触发时先触发优先级高的触发器",
    step: 1,
  })
  priority: number = 0;

  onLoad() {
    // 注册触发器到管理器
    InteractiveManager.registerTrigger(this);

    // 没什么特别意义，只是方便控制台打印时观察，删掉这行也不会影响逻辑
    this.name = this.node.name;
  }

  execute() {
    if (this.repeat < -1) return false;

    if (this.repeat === 0) {
      this.switchBehavior();
      return false;
    }

    const branch = this.node.getComponent(BranchController);

    if (branch) {
      branch.executeBranch();
    }

    this.repeat = this.repeat === -1 ? -1 : this.repeat - 1;

    if (this.repeat === 0) {
      this.switchBehavior();
    }

    return true;
  }

  private switchBehavior() {
    switch (this.depletionBehavior) {
      case DepletionBehavior.IDLE:
        break;
    }
  }
}
