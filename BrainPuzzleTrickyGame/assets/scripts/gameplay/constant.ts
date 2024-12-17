export default class Constant {
  /** 游戏名称 */
  static GAME_NAME = "BrainPuzzleTrickyGame";
  /** 游戏版本 */
  static GAME_VERSION = "1.0.0";

  /** 事件名 */
  static EVENT = {
    /** 拖拽事件 */
    DRAG: {
      /** 拖拽开始 */
      DRAG_START: "DragStart",
      /** 拖拽移动 */
      DRAG_MOVE: "DragMove",
      /** 拖拽结束 */
      DRAG_END: "DragEnd",
    },
    /** 显示Tips UI */
    SHOW_TIPS: "ShowTips",
  };

  /** 关卡相关的常量前缀 */
  static LEVEL_PREFIX = {
    KEY: "level",
    PATH: "level/LevelPrefab",
  };

  /** 数据模块key值 */
  static DATA_MODULE = {
    /** 全局数据 */
    GLOBAL: "GlobalData",
    /** 关卡数据 */
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

  /** 配置文件路径 */
  static CONFIG_PATH = {
    INTERACTIVE_LAN: "configs/InteractiveLanguage/level_",
    GUIDE_LAN: "configs/GuideLanguage/level_tips_",
  };

  /** UI预制体路径 */
  static UI_PREFAB_URL = {
    /** 游戏窗口UI */
    PLAYVIEW: "ui/PlayView",
    /** 过关弹窗 */
    VICTORY_POP: "ui/VictoryPop",
    /** 失败弹窗 */
    LOSE_POP: "ui/LosePop",
    /** 提示弹窗 */
    TIPS: "ui/Tips",
  };

  /** 拖拽物类型 */
  static DRAG_OBJECT_TYPE = {
    /** 可交互物 */
    INTERACTABLE: 0,
    /** 普通拖拽物 */
    DRAG: 1,
  };

  /** 提示类型 */
  static TIPS_TYPE = {
    /** 交互成功提示 */
    INTERACTIVE: 0,
    /** 引导提示 */
    GUIDE: 1,
  };

  /** 语言 */
  static LANGUAGE: Record<string, { abbr: string; full: string }> = {
    /** 中文 */
    zh: {
      abbr: "zh",
      full: "Chinese",
    },
    /** 英语 */
    en: {
      abbr: "en",
      full: "English",
    },
    /** 印尼语 */
    id: {
      abbr: "id",
      full: "Indonesia",
    },
    /** 日语 */
    ja: {
      abbr: "ja",
      full: "Japanese",
    },
    /** 韩语 */
    ko: {
      abbr: "ko",
      full: "Korean",
    },
    /** 马来语 */
    ms: {
      abbr: "ms",
      full: "Malay",
    },
    /** 泰语 */
    th: {
      abbr: "th",
      full: "Thailand",
    },
    /** 台湾 */
    tw: {
      abbr: "tw",
      full: "Chinese_tw",
    },
    /** 越南语 */
    vi: {
      abbr: "vi",
      full: "Vietnamese",
    },

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
