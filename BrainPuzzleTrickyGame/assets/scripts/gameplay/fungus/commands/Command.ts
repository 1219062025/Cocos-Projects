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

  abstract execute(): void;
}
