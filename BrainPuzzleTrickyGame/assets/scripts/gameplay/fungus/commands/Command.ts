import CommandManager from "./CommandManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class Command extends cc.Component {
  @property({ displayName: "命令ID", tooltip: "命令在所挂载节点上的唯一标识" })
  id: string = "";

  onLoad() {
    CommandManager.register(this);
  }

  /** 执行命令，必须返回一个Promise对象，如果是同步操作可以直接使用Promise.resolve() */
  abstract execute(): Promise<void>;
}
