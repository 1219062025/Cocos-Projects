import Command from "./Command";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Fungus/Command/Set | SetActiveCommand")
export class SetActiveCommand extends Command {
  @property({ tooltip: "节点是否设为活跃" })
  activeState: boolean = false;

  @property({ type: [cc.Node], tooltip: "节点列表" })
  nodes: cc.Node[] = [];

  execute() {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (cc.isValid(node)) {
        node.active = this.activeState;
      }
    }

    return Promise.resolve();
  }
}
