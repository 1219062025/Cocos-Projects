import { gi } from "../../@framework/gi";
import GlobalData from "../data/GlobalData";
import LevelData from "../data/level/LevelData";
import Constant from "./Constant";
import ContextManager from "./context/ContextManager";
import InteractiveManager from "./interactive/InteractiveManager";

const { ccclass, property } = cc._decorator;

/** 启动关卡 */
@ccclass
export default class StarupLevel extends cc.Component {
  async start() {
    cc.director.getCollisionManager().enabled = true;

    // 获取关卡数据
    const levelData = gi.DataManager.getModule<LevelData>(
      Constant.DATA_MODULE.LEVEL
    );

    // 获取全局数据
    const globalData = gi.DataManager.getModule<GlobalData>(
      Constant.DATA_MODULE.GLOBAL
    );

    // 初始化关卡上下文
    ContextManager.init(levelData.getCurrentLevel());

    // 建立场景中拖拽物与触发器的映射关系
    InteractiveManager.createMappingByTags();

    if (!globalData.isDebug()) {
      this.runTimeDetection(globalData);
    }
  }

  /** 运行时间检测 */
  private runTimeDetection(globalData: GlobalData) {
    let countdown = Constant.GAME_COUNTDOWN;

    const countdownFunc = () => {
      if (countdown === 0) {
        this.unschedule(countdownFunc);
        this.checkGameEnd(globalData);
      } else {
        countdown--;
      }
    };

    this.schedule(countdownFunc, 1);

    const responseFunc = gi.Utils.debounce(() => {
      this.checkGameEnd(globalData);
    }, Constant.GAME_RESPONSE_TIME * 1000);

    gi.EventManager.on(Constant.EVENT.GAME_TOUCH_START, responseFunc, this);
  }

  private checkGameEnd(globalData: GlobalData) {
    if (!globalData.isEnd()) {
      gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
    }
  }
}
