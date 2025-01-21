import Command from "./Command";
import CommandManager from "./CommandManager";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Fungus/Command/Execute | ExecuteCommand")
export class ExecuteCommand extends Command {
  @property({ override: true })
  id: string = "execute-";

  @property({ type: cc.Node, displayName: "目标节点" })
  target: cc.Node = null;

  @property({ displayName: "Target ID", tooltip: "目标节点上的命令ID" })
  commandId: string = "";

  execute() {
    const command = CommandManager.getCommand(this.commandId, this.target);

    if (!command) {
      throw new Error(
        `Error executing [ExecuteCommand] with command ID ${this.id} on node ${this.node}. message: Command ${this.target.name} does not exist on node ${this.commandId}`
      );
    }

    return CommandManager.executeCommand(this.commandId, this.target);
  }
}
