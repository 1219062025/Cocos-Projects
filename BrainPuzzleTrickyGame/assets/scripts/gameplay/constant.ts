export default class Constant {
  /** 游戏名称 */
  static GAME_NAME = "BrainPuzzleTrickyGame";
  /** 游戏版本 */
  static GAME_VERSION = "1.0.0";
  /** 游戏倒计时60秒后结束 */
  static GAME_COUNTDOWN = 60;
  /** 游戏从第一次触摸后，15秒内没有下一次响应就会结束 */
  static GAME_RESPONSE_TIME = 15;
  /** 引导器每隔5秒钟没有触发触摸就会运行 */
  static GUIDING_INTERVAL = 5;

  /** 游戏状态 */
  static GAME_STATUS = {
    /** 游戏中 */
    PLAYING: 0,
    /** 游戏胜利 */
    VICTORY: 1,
    /** 游戏失败 */
    LOSE: 2,
  };

  /** 事件名 */
  static EVENT = {
    /** 开始引导 */
    START_GUIDE: "startGuide",
    /** 完成某个引导器 */
    COMPLETE_GUIDE: "completeGuide",
    /** 拖拽开始 */
    DRAG_START: "DragStart",
    /** 拖拽移动 */
    DRAG_MOVE: "DragMove",
    /** 拖拽结束 */
    DRAG_END: "DragEnd",
    /** 显示Tips Voice */
    SHOW_VOICE: "ShowVoice",
    /** 显示Tips Guide */
    SHOW_GUIDE: "ShowGuide",
    /** 隐藏Tips Guide */
    HIDE_TIPS: "HideTips",
    /** 仅隐藏Voice Tips Guide */
    HIDE_VOICE: "HideVoice",
    /** 仅隐藏Guide Tips Guide */
    HIDE_GUIDE: "HideGuide",
    /** 倒计时 */
    COUNT_DOWN: "CountDown",
    /** 游戏失败 */
    GAME_LOSE: "Lose",
    /** 游戏过关 */
    GAME_VICTORY: "Victory",
    /** 游戏视窗触发 触摸 */
    GAME_TOUCH_START: "GameTouchStart",
    /** 游戏视窗触发 触摸移动 */
    GAME_TOUCH_MOVE: "GameTouchMove",
    /** 游戏视窗触发 目标节点内触摸结束 */
    GAME_TOUCH_END: "GameTouchEnd",
    /** 游戏视窗触发 目标节点外触摸结束 */
    GAME_TOUCH_CANCEL: "GameTouchCancel",
    /** 禁用游戏窗口触摸 */
    DISABLE_TOUCH: "DisableTouch",
    /** 启用游戏窗口触摸 */
    ENABLE_TOUCH: "EnableTouch",
    /** Screen管理器发出屏幕尺寸发生变更事件 */
    VIEW_RESIZE: "viewResize",
    /** Screen管理器发出屏幕方向发生变更事件 */
    ORIENTATION_CHANGED: "orientationChanged",
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

  /** 配置文件路径 */
  static CONFIG_PATH = {
    VOICE_LAN: "configs/VoiceLanguage/level_",
    GUIDE_LAN: "configs/GuideLanguage/level_tips_",
  };

  /** UI预制体key值 */
  static UI_PREFAB = {
    /** 游戏窗口UI */
    PLAYVIEW: "PlayView",
    /** 过关弹窗 */
    VICTORY_POP: "VictoryPop",
    /** 失败弹窗 */
    LOSE_POP: "LosePop",
    /** 失败弹窗 */
    TIPS: "Tips",
    /** 引导手指 */
    HAND: "Hand",
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
    /** 引导手指 */
    HAND: "ui/Hand",
  };

  /** 音乐路径 */
  static MUSIC_PATH = {
    /** 背景音乐 */
    BGM: "audio/bgm",
  };

  /** 音效路径 */
  static SOUND_PATH = {
    /** 交互音效 */
    INTERACTIVE: "audio/Interactive",
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
    /** 语音提示 */
    VOICE: 0,
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
      full: "Indonasia",
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
    /** 俄语 */
    ru: {
      abbr: "ru",
      full: "Russian",
    },

    // pt: "pt", // 巴西
    // in: "in", // 印度
    // hi: "hi", // 印地语
    // il: "il", // 菲律宾语
    // tr: "tr", // 土耳其语
    // ng: "ng", // 尼日利亚
    // es: "es", // 西班牙语
    // ar: "ar", // 阿拉伯语
    // de: "de", // 德语
    // fr: "fr", // 法语
    // mx: "mx", // 墨西哥
  };
}
