import { gi } from "../../@framework/gi";
import Constant from "../gameplay/Constant";
import I18TextManager from "../gameplay/I18TextManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Tips extends cc.Component {
  @property(cc.Label)
  text: cc.Label = null;

  private _isVoice: boolean = false;
  private _isGuide: boolean = false;

  onLoad() {
    gi.EventManager.on(Constant.EVENT.SHOW_VOICE, this.showVoice, this);
    gi.EventManager.on(Constant.EVENT.SHOW_GUIDE, this.showGuide, this);
    gi.EventManager.on(Constant.EVENT.HIDE_TIPS, this.hideTips, this);
    gi.EventManager.on(Constant.EVENT.HIDE_VOICE, this.hideVoice, this);
    gi.EventManager.on(Constant.EVENT.HIDE_GUIDE, this.hideGuide, this);
  }

  showVoice(id: string) {
    this._isVoice = true;
    this._isGuide = false;

    const text = I18TextManager.getText(id, Constant.TIPS_TYPE.VOICE);

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

  showGuide(id: string) {
    this._isGuide = true;
    this._isVoice = false;

    const text = I18TextManager.getText(id, Constant.TIPS_TYPE.GUIDE);

    this.node.stopAllActions();
    (cc.tween(this.node) as cc.Tween)
      .to(0.07, { opacity: 0 })
      .call(() => {
        this.text.string = text;
      })
      .to(0.2, { opacity: 255 })
      .start();
  }

  hideGuide() {
    if (this._isGuide) {
      this.node.stopAllActions();
      (cc.tween(this.node) as cc.Tween).to(0.2, { opacity: 0 }).start();
    }
  }

  hideVoice() {
    if (this._isVoice) {
      this.node.stopAllActions();
      (cc.tween(this.node) as cc.Tween).to(0.2, { opacity: 0 }).start();
    }
  }

  hideTips() {
    this.node.stopAllActions();
    (cc.tween(this.node) as cc.Tween).to(0.2, { opacity: 0 }).start();
  }
}
