import CommandManager from "./CommandManager";

const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(CommandManager)
export default abstract class Command extends cc.Component {
  @property({ tooltip: "命令在所挂载节点上的唯一标识" })
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

  /** 执行命令，必须返回一个Promise对象，如果是同步操作可以调用Promise.resolve()返回 */
  abstract execute(): Promise<void>;
}
