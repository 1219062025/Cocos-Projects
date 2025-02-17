import { gi } from "../../../@framework/gi";
import GlobalData from "../../data/GlobalData";
import Constant from "../Constant";
import Guide from "./Guide";

const { ccclass, property, menu } = cc._decorator;

enum SwiperType {
  UP,
  BOTTOM,
  LEFT,
  RIGHT,
}

@ccclass
@menu("Guide/SwiperGuide")
export default class SwiperGuide extends Guide {
  @property({
    type: cc.Enum(SwiperType),
    tooltip: "UP：上滑\nBOTTOM：下滑\nLEFT：左滑\nRIGHT：右滑",
  })
  type: number = SwiperType.UP;

  /** 目标节点 */
  @property({
    type: cc.Node,
    displayName: "目标节点",
  })
  target: cc.Node = null;

  /** 滑动距离 */
  @property({
    displayName: "滑动距离",
  })
  distance: number = 30;

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

    this.guideSwiper();
  }

  pause() {
    if (this._hand) {
      this._hand.active = false;
      this._hand.stopAllActions();
    }
    gi.EventManager.emit(Constant.EVENT.HIDE_GUIDE);
  }

  async guideSwiper() {
    if (!this._hand) {
      await this.loadHandPrefab();

      const globalData = gi.DataManager.getModule<GlobalData>(
        Constant.DATA_MODULE.GLOBAL
      );

      globalData.getGameView().addChild(this._hand);
    }

    let targetPosStart = this._hand.parent.convertToNodeSpaceAR(
      this.target.convertToWorldSpaceAR(cc.v2(0, 0))
    );

    let targetPosEnd;
    if (this.type === SwiperType.UP) {
      targetPosEnd = targetPosStart.add(cc.v2(0, this.distance));
    } else if (this.type === SwiperType.BOTTOM) {
      targetPosEnd = targetPosStart.add(cc.v2(0, -this.distance));
    } else if (this.type === SwiperType.RIGHT) {
      targetPosEnd = targetPosStart.add(cc.v2(this.distance, 0));
    } else if (this.type === SwiperType.LEFT) {
      targetPosEnd = targetPosStart.add(cc.v2(-this.distance, 0));
    }

    gi.EventManager.emit(Constant.EVENT.SHOW_GUIDE, this.tid);

    this.fromToPos(targetPosStart, targetPosEnd)
      .union()
      .repeatForever()
      .start();
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

  /**
   * 得到一个从位置from移动到位置to的缓动
   * @param {cc.Vec2} from 起始位置
   * @param {cc.Vec2} to 终点位置
   */
  private fromToPos(from: cc.Vec2, to: cc.Vec2) {
    return this.move(from, to);
  }

  private move(from: cc.Vec2, to: cc.Vec2) {
    const moveTween = (cc.tween() as cc.Tween)
      .call(() => {
        this._hand.setPosition(from);
        this._hand.active = true;
      })
      .to(2, { position: to })
      .to(2 / 3, { position: from });

    return (cc.tween(this._hand) as cc.Tween).then(moveTween);
  }
}
