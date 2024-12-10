import context from "../../context/ContextManager";
import Command from "./Command";

const { ccclass, property, menu } = cc._decorator;

const functions = context.getFunctions();
const keys = Object.keys(functions); // 获取对象的所有键
const funcEnum = {};
keys.forEach((key, index) => {
  funcEnum[key] = index; // 将键与其索引关联
});

@ccclass
@menu("Fungus/Command/FunctionCommand")
export class FunctionCommand extends Command {
  // 在编辑器中动态更新属性
  @property({
    type: cc.Enum(funcEnum), // 临时 Enum，会动态覆盖
    displayName: "目标函数",
  })
  index: number = 0;

  execute() {
    const funcName = keys[this.index];
    if (funcName) {
      return context.callFunction(funcName);
    } else {
      return Promise.resolve();
    }
  }
}
