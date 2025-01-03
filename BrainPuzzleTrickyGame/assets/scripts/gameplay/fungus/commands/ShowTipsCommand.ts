import { gi } from "../../../../@framework/gi";
import Constant from "../../Constant";
import Command from "./Command";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Fungus/Command/Scripting | ShowTipsCommand")
export class ShowTipsCommand extends Command {
  @property({ displayName: "提示ID" })
  tid: string = "";

  @property({
    type: cc.Enum(Constant.TIPS_TYPE),
    displayName: "提示类型",
    tooltip: "VOICE：语音提示\nGUIDE：引导提示",
  })
  type: number = Constant.TIPS_TYPE.VOICE;

  execute() {
    // 发送事件
    switch (this.type) {
      case Constant.TIPS_TYPE.VOICE:
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, this.tid);
        break;
      case Constant.TIPS_TYPE.GUIDE:
        gi.EventManager.emit(Constant.EVENT.SHOW_GUIDE, this.tid);
        break;
      default:
        break;
    }

    return Promise.resolve();
  }
}
