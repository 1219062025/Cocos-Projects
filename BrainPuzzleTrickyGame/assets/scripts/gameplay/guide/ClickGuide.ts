import { gi } from "../../../@framework/gi";
import GlobalData from "../../data/GlobalData";
import DragObject from "../../entities/DragObject";
import Constant from "../Constant";
import Guide from "./Guide";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Guide/ClickGuide")
export default class ClickGuide extends Guide {
  /** 目标节点 */
  @property({
    type: cc.Node,
    displayName: "目标节点",
  })
  target: cc.Node = null;

  /** 引导手指 */
  private _hand: cc.Node;

  isNormal() {
    if (!this.target) {
      console.warn("No target node is set.");
      return false;
    }

    if (!cc.isValid(this.target)) return false;

    if (!this.target.active) return false;
    if (!this.target.activeInHierarchy) return false;

    return true;
  }

  run() {
    if (!this.target) {
      console.warn("No target node is set.");
      return;
    }

    this.guideClickObject();
  }
  pause() {
    if (this._hand) {
      this._hand.active = false;
      this._hand.stopAllActions();
    }
    gi.EventManager.emit(Constant.EVENT.HIDE_GUIDE);
  }

  async guideClickObject() {
    if (!this._hand) {
      await this.loadHandPrefab();

      const globalData = gi.DataManager.getModule<GlobalData>(
        Constant.DATA_MODULE.GLOBAL
      );

      globalData.getGameView().addChild(this._hand);
    }

    const targetPos = this._hand.parent.convertToNodeSpaceAR(
      this.target.convertToWorldSpaceAR(cc.v2(0, 0))
    );

    this._hand.setPosition(targetPos);
    this._hand.active = true;

    gi.EventManager.emit(Constant.EVENT.SHOW_GUIDE, this.tid);
  }

  /** 加载引导手指预制体 */
  async loadHandPrefab() {
    return new Promise((resolve) => {
      gi.ResourceManager.loadRes(Constant.UI_PREFAB_URL.HAND, cc.Prefab).then(
        (prefab: cc.Prefab) => {
          const hand = cc.instantiate(prefab);
          this._hand = hand;
          resolve(true);
        }
      );
    });
  }
}
