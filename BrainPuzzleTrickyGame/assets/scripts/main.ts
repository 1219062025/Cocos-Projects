import { gi } from "../@framework/gi";
import { LayerType } from "../@framework/types/Layer";
import Constant from "./gameplay/Constant";
import LevelData from "./data/level/LevelData";
import GlobalData from "./data/GlobalData";

const { ccclass, property, executeInEditMode } = cc._decorator;

const keys = Object.keys(Constant.LANGUAGE);

const LanguageOptions = keys.reduce((acc, key, index) => {
  acc[key] = index;
  return acc;
}, {});

/** 游戏入口，处理全局框架、UI、数据 */
@ccclass
export default class Main extends cc.Component {
  /** 当前关卡是第几关 */
  @property({ type: cc.Integer, tooltip: "启动的关卡" })
  level: number = 1;

  @property({ tooltip: "一步跳转模式" })
  oneStepMode: boolean = false;

  @property
  debug: boolean = false;

  @property({
    type: cc.Enum(LanguageOptions),
    displayName: "默认语言",
    visible() {
      return this.debug;
    },
  })
  language: number = 0;

  async onLoad() {
    // 启动游戏框架
    gi.starup({
      UIManager: { root: cc.Canvas.instance.node },
      StorageManager: { version: Constant.GAME_VERSION },
    });

    // 设置语言
    const lan = this.getDefaultLanguage();
    if (lan) {
      gi.I18nManager.switchLanguage(lan);
    }

    // 初始化全局数据
    const globalData = new GlobalData(this.debug);
    gi.DataManager.register(Constant.DATA_MODULE.GLOBAL, globalData);

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

    this.checkOneStepMode();
  }

  /** 检查是否开启一步跳转（点击屏幕任何位置头跳转商店） */
  checkOneStepMode() {
    if (this.oneStepMode) {
      const canvas = cc.Canvas.instance.node;
      const mask = new cc.Node("MASK");
      const widget = mask.addComponent(cc.Widget);
      mask.setContentSize(cc.winSize);

      gi.EventManager.on(Constant.EVENT.VIEW_RESIZE, () => {
        console.log(cc.winSize.width, cc.winSize.height);
        mask.setContentSize(cc.winSize);
        widget.updateAlignment();
      });

      mask.on(
        cc.Node.EventType.TOUCH_END,
        () => {
          //@ts-ignore
          linkToStore();
        },
        this
      );
      canvas.addChild(mask, 10);
    }
  }

  /** 获取默认语言 */
  getDefaultLanguage() {
    if (this.debug) {
      return Constant.LANGUAGE[keys[this.language]].abbr;
    }

    // 获取浏览器默认语言首位
    let curlanguge = window.navigator.language.split("-");
    for (let i = curlanguge.length - 1; i >= 0; i--) {
      let e = curlanguge[i].toLowerCase();
      if (Constant.LANGUAGE[e]) {
        return e;
      }
    }

    if (Constant.LANGUAGE[cc.sys.language]) {
      return Constant.LANGUAGE[cc.sys.language].abbr;
    }
  }
}
