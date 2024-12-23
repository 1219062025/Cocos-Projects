import Command from "./Command";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Fungus/Command/Set | SetActiveCommand")
export class SetActiveCommand extends Command {
  @property({
    type: [cc.Node],
    displayName: "显示节点",
    tooltip: "需要显示的节点列表",
  })
  display: cc.Node[] = [];

  @property({
    type: [cc.Node],
    displayName: "隐藏节点",
    tooltip: "需要隐藏的节点列表",
  })
  hide: cc.Node[] = [];

  execute() {
    for (let i = 0; i < this.display.length; i++) {
      const node = this.display[i];
      if (cc.isValid(node)) {
        node.active = true;
      }
    }
    for (let i = 0; i < this.hide.length; i++) {
      const node = this.hide[i];
      if (cc.isValid(node)) {
        node.active = false;
      }
    }

    return Promise.resolve();
  }
}
