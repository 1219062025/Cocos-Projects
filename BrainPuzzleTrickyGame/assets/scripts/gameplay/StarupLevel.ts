import { gi } from "../../@framework/gi";
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

    // 初始化关卡上下文
    ContextManager.init(levelData.getCurrentLevel());

    // 建立场景中拖拽物与触发器的映射关系
    InteractiveManager.createMappingByTags();
  }
}
