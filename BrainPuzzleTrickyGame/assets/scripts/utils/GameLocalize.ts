import Constant from "../gameplay/Constant";
import I18TextManager from "../gameplay/I18TextManager";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Utils/GameLocalize")
export default class GameLocalize extends cc.Component {
  @property
  id: string = "2000";

  labelComponent: cc.Label = null;

  start() {
    this.labelComponent = this.node.getComponent(cc.Label);

    if (!this.labelComponent) {
      console.error("未找到Label组件！");
      return;
    }

    this.labelComponent.string = I18TextManager.getText(
      this.id,
      Constant.TIPS_TYPE.VOICE
    );
  }
}
