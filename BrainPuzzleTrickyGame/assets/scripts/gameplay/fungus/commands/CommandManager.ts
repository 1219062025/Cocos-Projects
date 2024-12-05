import Command from "./Command";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommandManager extends cc.Component {
  private commands: Map<string, Command> = new Map();

  /** 注册命令 */
  register(command: Command) {
    if (this.commands.has(command.id)) {
      console.warn(
        `[CommandManager] Duplicate command ID '${command.id}' on node '${this.node.name}'.`
      );
    } else {
      this.commands.set(command.id, command);
    }
  }

  /** 获取命令 */
  getCommand(id: string): Command | null {
    return this.commands.get(id) || null;
  }

  /** 执行命令 */
  executeCommand(id: string) {
    const command = this.getCommand(id);
    if (command) {
      return command.execute();
    } else {
      console.warn(
        `[CommandManager] Command ID '${id}' not found on node '${this.node.name}'.`
      );
    }
  }
}
