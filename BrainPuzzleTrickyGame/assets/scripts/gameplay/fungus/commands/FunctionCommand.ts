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

  execute() {
    const levelData = gi.DataManager.getModule<LevelData>(
      Constant.DATA_MODULE.LEVEL
    );
    const lastInteractive = levelData.lastInteractive;

    const options = {
      object: (lastInteractive && lastInteractive.object) || null,
      trigger: (lastInteractive && lastInteractive.trigger) || null,
      nodes: this.nodes,
    };

    if (this.funcName) {
      return Promise.resolve(
        ContextManager.callFunction(this.funcName, options)
      );
    } else {
      return Promise.resolve();
    }
  }
}
