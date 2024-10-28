import * as i18n from '../../../extensions/i18n/assets/LanguageData';

export class Constant {
  /** 游戏时间60 * 4秒 */
  static GAME_TIME = 60;

  /** 房间解散消息 */
  static DISMISS: string = 'dismiss';

  /** 玩家最少人数 */
  static MIN_PLAYER = 2;
  /** 玩家最多人数 */
  static MAX_PLAYER = 2;

  /** 本地缓存key值 */
  public static LOCAL_CACHE = {
    /** 玩家基础数据缓存，如金币砖石等信息，暂时由客户端存储，后续改由服务端管理 */
    PLAYER: 'player',
    /** 设置相关，所有杂项都丢里面进去 */
    SETTINGS: 'settings',
    /** 数据版本 */
    DATA_VERSION: 'dataVersion',
    /** 玩家账号 */
    ACCOUNT: 'account',
    /** 关卡通关数据 */
    HISTORY: 'history',
    /** 玩家背包，即道具列表，字典类型 */
    BAG: 'bag'
  };

  /** 语言选择 */
  public static I18_LANGUAGE = {
    /** 英文 */
    ENGLISH: 'en',
    /** 中文 */
    CHINESE: 'zh'
  };

  /** UI界面 */
  static PANEL_NAME = {
    /** 准备界面 */
    READY: 'fight/ready',
    /** 结算界面 */
    GAME_OVER: 'fight/gameOver',
    /** 战斗界面 */
    FIGHT_UI: 'fight/fightUI',
    /** GO界面 */
    READY_GO: 'fight/readyGo',
    /** 开始游戏界面 */
    START_GAME: 'fight/startPanel',
    /** 选择界面 */
    SELECT_GAME: 'fight/selectPanel',
    /** 离开界面 */
    TIP_PANEL: 'fight/tipPanel',
    /** 加入房间 */
    JOIN_ROOM_PANEL: 'fight/joinRoomPanel',
    /** 匹配界面 */
    MATCH_PANEL: 'fight/matchPanel',
    /**  过渡界面 */
    TRANSITION: 'fight/transitionPanel',
    /**  过渡背景界面 */
    TRANSITION_BG: 'fight/transitionBgPanel',
    /**  消息面板 */
    MESSAGE_PANEL: 'fight/messagePanel',
    /**  断线 */
    DOWNOFF_PANEL: 'fight/downOffPanel',
    /**  聊天语音 */
    MEDIA_PANEL: 'fight/mediaPanel'
  };

  /** 根据当前语言返回对应所有的房间提示文本 */
  public static get ROOM_TIPS() {
    if (i18n._language === this.I18_LANGUAGE.CHINESE) {
      return this.ROOM_TIPS_ZH;
    } else {
      return this.ROOM_TIPS_EN;
    }
  }

  /** 房间提示信息-中文 */
  static ROOM_TIPS_ZH = {
    /** 创建房间。。。 */
    CREATE: '创建房间。。。',
    /** 请稍等，房主正在创建房间。。。 */
    WAITING: '请稍等，房主正在创建房间。。。',
    /** 您的对手已经离开房间。。。 */
    LEAVE: '您的对手已经离开房间。。。',
    /** 已在房间内。。。 */
    IN_ROOM: '已在房间内。。。',
    /** 创建房间失败 */
    CREATE_ROOM_ERROR: '创建房间失败',
    /** 加入房间失败 */
    JOIN_ROOM_ERROR: '加入房间失败',
    /** 请输入正确的房间号 */
    NO_ROOM_ID: '请输入正确的房间号',
    /** 离开房间出错 */
    LEAVE_ROOM_ERROR: '离开房间出错',
    /** 确认退出房间？ */
    LEAVE_ROOM_MSG: '确认退出房间？',
    /** 成功离开房间 */
    LEAVE_ROOM_SUCCESS: '成功离开房间',
    /** 成功加入房间 */
    JOIN_ROOM_SUCCESS: '成功加入房间',
    /** 匹配房间出错 */
    MATCH_ROOM_ERROR: '匹配房间出错',
    /** 长度需要大于2 */
    PLAYER_LENGHT_ERROR: '长度需要大于2',
    /** 是否退出游戏？ */
    LEAVE_GAME: '是否退出游戏？',
    /** 请输入文字 */
    INPUT_MSG: '请输入文字',
    /** 未识别到语音 */
    VT_ERROR: '未识别到语音',
    /** 队友离开队伍 */
    PLAYER_LEAVE_1: '队友离开队伍',
    /** 秒游戏结束 */
    PLAYER_LEAVE_2: '秒游戏结束',
    /** 登录失败 */
    INIT_FAIL: '登录失败',
    /** 语音权限不足，语音未开启 */
    MEDIA_FAIL: '语音权限不足，语音未开启',
    /** 世界频道 */
    WORLD_LABEL: '世界频道',
    /** 房间号 */
    ROOM_LABEL: '房间号:',
    /** 进入场景异常，请重试 */
    LOGIN_GAME_ERROR: '进入场景异常，请重试',
    /** 华为登录失败，请改用普通账号登录 */
    HUA_WEI_LOAGIN_ERROR: '华为登录失败，请改用普通账号登录'
  };

  /** 房间提示信息-英文 */
  static ROOM_TIPS_EN = {
    CREATE: 'Create a room...',
    WAITING: 'Please wait, the owner is creating a room...',
    LEAVE: 'Your opponent has left the room...',
    IN_ROOM: 'Already in the room...',
    CREATE_ROOM_ERROR: 'Failed to create room ',
    JOIN_ROOM_ERROR: 'Failed to join the room ',
    NO_ROOM_ID: 'Please enter the correct room number ',
    LEAVE_ROOM_ERROR: 'Error leaving the room ',
    LEAVE_ROOM_MSG: 'Want to exit the room?',
    LEAVE_ROOM_SUCCESS: 'Leave the room successfully ',
    JOIN_ROOM_SUCCESS: 'Join_room_success ',
    MATCH_ROOM_ERROR: 'Matching room error ',
    PLAYER_LENGHT_ERROR: 'Length must be greater than 2',
    LEAVE_GAME: 'Do you want to quit?',
    INPUT_MSG: 'Please enter text ',
    VT_ERROR: 'Speech not recognized ',
    PLAYER_LEAVE_1: 'Teammate leaves team, ',
    PLAYER_LEAVE_2: 'seconds game over ',
    INIT_FAIL: 'Login failed ',
    MEDIA_FAIL: 'Voice permission is insufficient, voice is not enabled ',
    WORLD_LABEL: 'World Channel ',
    ROOM_LABEL: 'Room number :',
    LOGIN_GAME_ERROR: 'Enter the scene exception, please try again ',
    HUA_WEI_LOAGIN_ERROR: 'Login to Huawei failed.Please use a common account to log in to Huawei.'
  };

  /** 事件名称 */
  static EVENT_NAME = {
    /** 华为初始化 */
    HUAWEI_LOGIN_MSG: 'huawei_login_msg',
    /** 非房主加入房间 */
    ON_OTHER_JOIN_ROOM: 'onOtherJoinRoom'
  };

  /** 华为登录 */
  static HUAWEI_LOGIN = {
    /** 账号登录成功 */
    SIGN_IN_SUCCESS: 0,
    /** 初始化成功 */
    INIT_SUCCESS: 10000,
    /** 未成年人登录 */
    INIT_UNDER_AGE: 10001,
    /** 初始化报错 */
    INIT_ERROR: 10002,
    /** 登录报错 */
    SIGN_IN_ERROR: 10003,
    /** 非华为手机 */
    NO_HUAWEI: 10004
  };
}
