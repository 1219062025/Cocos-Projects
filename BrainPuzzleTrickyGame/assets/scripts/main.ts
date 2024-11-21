import { gi } from "../@framework/index";
import Constant from "./gameplay/constant";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  /** 当前关卡是第几关 */
  @property({ type: cc.Integer, tooltip: "启动的关卡" })
  levle: number = 1;

  async onLoad() {
    gi.starup({
      UIManager: { root: cc.Canvas.instance.node },
      StorageManager: { version: Constant.GAME_VERSION },
    });
    gi.UIManager.register(
      `level${this.levle}`,
      `level/LevelPrefab${this.levle}`
    );
    gi.UIManager.show(`level${this.levle}`);
  }
}
