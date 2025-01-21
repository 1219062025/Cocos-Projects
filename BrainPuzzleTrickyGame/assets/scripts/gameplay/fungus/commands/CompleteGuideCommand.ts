import { gi } from "../../../../@framework/gi";
import Constant from "../../Constant";
import Command from "./Command";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Fungus/Command/Guide | CompleteGuideCommand")
export class CompleteGuideCommand extends Command {
  @property({ override: true })
  id: string = "completeGuide-";

  @property
  gid: string = "";

  execute() {
    gi.EventManager.emit(Constant.EVENT.COMPLETE_GUIDE, this.gid);

    return Promise.resolve();
  }
}
