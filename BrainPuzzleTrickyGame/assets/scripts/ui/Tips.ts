import { gi } from "../../@framework/gi";
import Constant from "../gameplay/Constant";
import I18TextManager from "../gameplay/I18TextManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Tips extends cc.Component {
  @property(cc.Label)
  text: cc.Label = null;

  onLoad() {
    gi.EventManager.on(Constant.EVENT.SHOW_TIPS, this.showTips, this);
  }

  async showTips(id: string, type: number) {
    const text = I18TextManager.getText(id, type);

    this.node.stopAllActions();
    (cc.tween(this.node) as cc.Tween)
      .to(0.07, { opacity: 0 })
      .call(() => {
        this.text.string = text;
      })
      .to(0.2, { opacity: 255 })
      .delay(2)
      .to(0.2, { opacity: 0 })
      .start();
  }
}
