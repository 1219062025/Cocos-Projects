import InteractiveManager from "./InteractiveManager";

const { ccclass, property } = cc._decorator;

/** 启动关卡 */
@ccclass
export default class StarupLevel extends cc.Component {
  start() {
    cc.director.getCollisionManager().enabled = true;
    // 建立场景中拖拽物与触发器的映射关系
    InteractiveManager.createMappingByTags();
  }
}
