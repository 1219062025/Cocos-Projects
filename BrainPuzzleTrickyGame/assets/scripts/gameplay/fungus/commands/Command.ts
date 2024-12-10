import CommandManager from "./CommandManager";

const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(CommandManager)
export default abstract class Command extends cc.Component {
  @property({ tooltip: "命令的唯一标识" })
  id: string = "";

  onLoad() {
    const manager = this.node.getComponent(CommandManager);
    if (!manager) {
      console.error(
        `[Command] CommandManager not found on node '${this.node.name}'.`
      );
      return;
    }
    manager.register(this);
  }

  /** 执行命令 */
  execute(): Promise<void> {
    return Promise.resolve(); // 默认同步操作，直接返回已解析的 Promise
  }
}
