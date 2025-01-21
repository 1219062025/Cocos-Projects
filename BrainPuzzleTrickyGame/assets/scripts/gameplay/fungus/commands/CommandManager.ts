import InstanceBase from "../../../../@framework/common/InstanceBase";
import Utils from "../../../../@framework/Utils";
import Command from "./Command";

interface CommandInfo {
  id: string;
  command: Command;
}

class CommandManager extends InstanceBase {
  private commands: Map<cc.Node, CommandInfo[]> = new Map();

  private _log: Function = Utils.debounce(console.log, 1000);

  constructor() {
    super();
  }

  /** 注册命令 */
  register(command: Command) {
    if (!this.commands.has(command.node)) {
      this.commands.set(command.node, []);
    }

    const nodeCommands = this.commands.get(command.node);

    if (!nodeCommands.find((cmd) => cmd.id === command.id)) {
      nodeCommands.push({
        id: command.id,
        command: command,
      });

      this._log(this.cloneAndIterateCommands());
    } else {
      console.warn(
        `[CommandManager] Duplicate command ID '${command.id}' on node '${command.node.name}'.`
      );
    }
  }

  /** 获取命令 */
  getCommand(id: string, node: cc.Node): Command | null {
    const nodeCommands = this.commands.get(node);
    if (nodeCommands) {
      const info = nodeCommands.find((cmd) => cmd.id === id);
      return info ? info.command : null;
    }
    return null;
  }

  /** 执行命令，并返回一个 Promise */
  executeCommand(id: string, node: cc.Node): Promise<void> {
    const command = this.getCommand(id, node);
    if (command) {
      return command.execute();
    } else {
      console.log(`Command ${id} does not exist on node ${command}`);
      throw new Error(
        `Command ${id} does not exist on node ${command.node.name}`
      );
    }
  }

  /** 克隆并遍历命令 */
  cloneAndIterateCommands() {
    const clonedArray = [];
    this.commands.forEach((commands, node) => {
      clonedArray.push({
        node: node,
        parent: node.parent,
        commands: [...commands],
      });
    });
    return clonedArray;
  }
}

export default CommandManager.instance();
