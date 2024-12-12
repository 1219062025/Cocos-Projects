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

  /** 执行命令，并返回一个 Promise */
  executeCommand(id: string): Promise<void> {
    const command = this.getCommand(id);
    return new Promise((resolve, reject) => {
      if (command) {
        command
          .execute()
          .then((value) => {
            resolve(value); // 命令执行完成
          })
          .catch((error) => {
            reject(error); // 命令执行失败
          });
      } else {
        reject(new Error(`Command ID '${id}' not found`));
      }
    });
  }
}
