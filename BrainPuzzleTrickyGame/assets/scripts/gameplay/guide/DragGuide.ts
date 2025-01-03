import { gi } from "../../../@framework/gi";
import GlobalData from "../../data/GlobalData";
import DragObject from "../../entities/DragObject";
import Constant from "../Constant";
import Guide from "./Guide";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Guide/DragGuide")
export default class DragGuide extends Guide {
  /** 拖拽组ID */
  @property({
    displayName: "拖拽组ID",
    tooltip: "拖拽物组，若设置了拖拽物则不生效",
  })
  gid: string = "";

  /** 拖拽物 */
  @property({
    type: DragObject,
    displayName: "拖拽物",
  })
  object: DragObject = null;

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

    if (!this.object && !this.gid) {
      console.warn("No DragObject or gid is set.");
      return false;
    }

    if (!cc.isValid(this.target)) return false;

    if (!this.target.active) return false;

    if (!cc.isValid(this.object)) return false;

    if (!this.object.node.active) return false;

    return true;
  }

  async run() {
    if (this.object) {
      this.guideDragObject();
    } else if (this.gid) {
    }
  }

  pause() {
    if (this._hand) {
      this._hand.active = false;
      this._hand.stopAllActions();
    }
    gi.EventManager.emit(Constant.EVENT.HIDE_GUIDE);
  }

  async guideDragObject() {
    if (!this._hand) {
      await this.loadHandPrefab();

      const globalData = gi.DataManager.getModule<GlobalData>(
        Constant.DATA_MODULE.GLOBAL
      );

      globalData.getGameView().addChild(this._hand);
    }

    gi.EventManager.emit(Constant.EVENT.SHOW_GUIDE, this.tid);

    this.fromToNode(this.object.node, this.target)
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
   * 得到一个从节点from的位置移动到节点to的位置的缓动
   * @param {cc.Node} from 起始节点
   * @param {cc.Node} to 终点节点
   */
  private fromToNode(fromNode: cc.Node, toNode: cc.Node) {
    const from = this._hand.parent.convertToNodeSpaceAR(
      fromNode.convertToWorldSpaceAR(cc.v2(0, 0))
    );
    const to = this._hand.parent.convertToNodeSpaceAR(
      toNode.convertToWorldSpaceAR(cc.v2(0, 0))
    );
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
