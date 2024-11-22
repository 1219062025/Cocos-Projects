import { gi } from "../@framework/gi";
import { LayerType } from "../@framework/types/Layer";
import Constant from "./gameplay/constant";
import LevelData from "./gameplay/level/levelData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  /** 当前关卡是第几关 */
  @property({ type: cc.Integer, tooltip: "启动的关卡" })
  level: number = 1;

  async onLoad() {
    // 启动游戏框架
    gi.starup({
      UIManager: { root: cc.Canvas.instance.node },
      StorageManager: { version: Constant.GAME_VERSION },
    });

    // 初始化关卡数据
    const levelData = new LevelData(this.level);
    gi.DataManager.register(Constant.DATA_MODULE.LEVEL, levelData);
    gi.DataManager.loadAllData();

    // 注册过关弹窗UI
    gi.UIManager.register(
      Constant.UI_PREFAB.VICTORY_POP,
      Constant.UI_PREFAB_URL.VICTORY_POP,
      { layer: LayerType.Popup }
    );
    // 注册失败弹窗UI
    gi.UIManager.register(
      Constant.UI_PREFAB.LOSE_POP,
      Constant.UI_PREFAB_URL.LOSE_POP,
      { layer: LayerType.Popup }
    );
    // 注册游戏窗口UI
    gi.UIManager.register(
      Constant.UI_PREFAB.PLAYVIEW,
      Constant.UI_PREFAB_URL.PLAYVIEW
    );
    gi.UIManager.show(Constant.UI_PREFAB.PLAYVIEW);
  }
}
