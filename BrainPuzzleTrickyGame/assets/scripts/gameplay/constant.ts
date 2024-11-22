export default class Constant {
  /** 游戏名称 */
  static GAME_NAME = "BrainPuzzleTrickyGame";
  /** 游戏版本 */
  static GAME_VERSION = "1.0.0";

  /** 关卡相关的常量前缀 */
  static LEVEL_PREFIX = {
    KEY: "level",
    PATH: "level/LevelPrefab",
  };

  /** 数据模块key值 */
  static DATA_MODULE = {
    LEVEL: "LevelData",
  };

  /** UI预制体key值 */
  static UI_PREFAB = {
    /** 游戏窗口UI */
    PLAYVIEW: "PlayView",
    /** 过关弹窗 */
    VICTORY_POP: "VictoryPop",
    /** 失败弹窗 */
    LOSE_POP: "LosePop",
  };

  /** UI预制体路径 */
  static UI_PREFAB_URL = {
    /** 游戏窗口UI */
    PLAYVIEW: "ui/PlayView",
    /** 过关弹窗 */
    VICTORY_POP: "ui/VictoryPop",
    /** 失败弹窗 */
    LOSE_POP: "ui/LosePop",
  };
}
