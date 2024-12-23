import { gi } from "../../../../@framework/gi";
import LevelData from "../../../data/level/LevelData";
import Constant from "../../Constant";
import ContextManager from "../../context/ContextManager";
import Command from "./Command";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu("Fungus/Command/Scripting | FunctionCommand")
export class FunctionCommand extends Command {
  @property({
    displayName: "目标函数",
  })
  funcName: string = "";

  @property({ type: [cc.Node] })
  nodes: cc.Node[] = [];

  async execute() {
    const options = {
      nodes: this.nodes,
    };

    if (this.funcName) {
      const result = await ContextManager.callFunction(this.funcName, options);
      if (result instanceof Promise) {
        return result;
      } else {
        return Promise.resolve(result);
      }
    } else {
      return Promise.resolve();
    }
  }
}
