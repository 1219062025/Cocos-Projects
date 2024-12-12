import { gi } from "../../@framework/gi";
import LevelData from "../data/level/LevelData";
import Constant from "./Constant";
import context from "./context/ContextManager";
import InteractiveManager from "./InteractiveManager";

const { ccclass, property } = cc._decorator;

/** 启动关卡 */
@ccclass
export default class StarupLevel extends cc.Component {
  start() {
    cc.director.getCollisionManager().enabled = true;

    // 获取关卡数据
    const levelData = gi.DataManager.getModule<LevelData>(
      Constant.DATA_MODULE.LEVEL
    );

    // 初始化关卡上下文
    context.init(levelData.getCurrentLevel());

    // 建立场景中拖拽物与触发器的映射关系
    InteractiveManager.createMappingByTags();
  }
}
