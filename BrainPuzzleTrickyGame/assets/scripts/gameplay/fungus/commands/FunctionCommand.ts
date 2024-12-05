import { gi } from "../../../../@framework/gi";
import Command from "./Command";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Fungus/Command/FunctionCommand")
export class FunctionCommand extends Command {
  // @property({
  //   type: cc.String,
  //   tooltip: "选择目标变量",
  // })
  // selectedVariable: string = "";

  // // 获取动态选项
  // getOptions(): string[] {
  //   return Object.keys(Variables.VariableOptions);
  // }

  // // 在编辑器中动态更新属性
  // @property({
  //   type: cc.Enum({}), // 临时 Enum，会动态覆盖
  // })
  // get dynamicEnum() {
  //   const options = this.getOptions();
  //   const dynamicEnum = {};
  //   options.forEach((key, index) => {
  //     dynamicEnum[key] = index;
  //   });
  //   return cc.Enum(dynamicEnum);
  // }

  async start() {
    console.log(await import("../../../LevelScript57"));
    // gi.ResourceManager.loadRes(`test`, cc.TextAsset)
    //   .then((asset: cc.TextAsset) => {
    //     console.log(asset);
    //     // const selectedValue = Variables.VariableOptions[this.selectedVariable];
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  }

  execute() {}
}
