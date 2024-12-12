import context from "../../context/ContextManager";
import Command from "./Command";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu("Fungus/Command/FunctionCommand")
export class FunctionCommand extends Command {
  @property({
    displayName: "目标函数",
  })
  funcName: string = "";

  execute() {
    if (this.funcName) {
      return Promise.resolve(context.callFunction(this.funcName));
    } else {
      return Promise.resolve();
    }
  }
}
