import { gi } from "../../@framework/gi";
import View from "../../@framework/modules/View";
import GlobalData from "../data/GlobalData";
import Constant from "../gameplay/Constant";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EndPop extends View {
  @property({ tooltip: "是否是失败弹窗" })
  isLose: boolean = false;

  constructor() {
    super();
  }

  open() {
    const globalData = gi.DataManager.getModule<GlobalData>(
      Constant.DATA_MODULE.GLOBAL
    );

    if (globalData.isEnd()) {
      return;
    }

    gi.EventManager.on(Constant.EVENT.ORIENTATION_CHANGED, this.adapter, this);

    this.adapter(gi.ScreenManager.getOrientation());

    this.fadeIn();

    if (this.isLose) {
      globalData.lose();
      gi.EventManager.emit(Constant.EVENT.GAME_LOSE);
    } else {
      globalData.victory();
      gi.EventManager.emit(Constant.EVENT.GAME_VICTORY);
    }
  }

  adapter(orientation: string) {
    this.updateMaskSize();

    if (orientation === "Landscape") {
      const designWidth = cc.Canvas.instance.designResolution.width;
      const designHeight = cc.Canvas.instance.designResolution.height;
      let scaleX = cc.winSize.width / designHeight;
      let scaleY = cc.winSize.height / designWidth;
      this.node.scale = Math.min(scaleX, scaleY);
    } else {
      this.node.scale = 1;
    }
  }

  updateMaskSize() {
    this.node.setContentSize(cc.winSize);
    this.node.getChildByName("mask").getComponent(cc.Widget).updateAlignment();
  }

  fadeIn() {
    this.node.opacity = 0;

    this.node.active = true;
    (cc.tween(this.node) as cc.Tween)
      .to(0.5, { opacity: 255 })
      .call(() => {
        if (this.isLose) {
          this.node.getComponent(cc.Animation).play();
        }
      })
      .start();
  }
}
