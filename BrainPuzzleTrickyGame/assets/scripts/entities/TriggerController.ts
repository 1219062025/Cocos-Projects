import BranchController from "../gameplay/fungus/BranchController";
import InteractiveManager from "../gameplay/InteractiveManager";

const { ccclass, property, menu, requireComponent } = cc._decorator;

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

  /** 触发器的优先级，触发时先触发优先级高的触发器 */
  @property({ tooltip: "触发器的优先级，触发时先触发优先级高的触发器" })
  priority: number = 0;

  onLoad() {
    // 注册触发器到管理器
    InteractiveManager.registerTrigger(this);

    this.name = this.node.name;
  }

  execute() {
    const branch = this.node.getComponent(BranchController);

    if (branch) {
      branch.executeBranch();
    }
  }
}
