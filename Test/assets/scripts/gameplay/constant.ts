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

  /** 语言缩写 */
  static LANGUAGE_ABBR = {
    en: "en", // 英语
    id: "id", // 印尼语
    ja: "ja", // 日语
    ko: "ko", // 韩语
    ms: "ms", // 马来语
    th: "th", // 泰语
    tw: "tw", // 台湾
    vi: "vi", // 越南语

    // pt: "pt", // 巴西
    // in: "in", // 印度
    // hi: "hi", // 印地语
    // il: "il", // 菲律宾语
    // tr: "tr", // 土耳其语
    // ng: "ng", // 尼日利亚
    // es: "es", // 西班牙语
    // ru: "ru", // 俄语
    // ar: "ar", // 阿拉伯语
    // de: "de", // 德语
    // fr: "fr", // 法语
    // mx: "mx", // 墨西哥
  };
}
