import { gi } from "../../@framework/gi";
import Constant from "../gameplay/Constant";
import LevelData from "../data/level/LevelData";
import GlobalData from "../data/GlobalData";
import StarupLevel from "../gameplay/StarupLevel";
import I18TextManager from "../gameplay/I18TextManager";

const { ccclass, property } = cc._decorator;

/** 游戏视窗，处理视窗UI以及加载游戏场景 */
@ccclass
export default class PlayView extends cc.Component {
  @property({ type: cc.Node })
  wrap: cc.Node = null;

  @property({ type: cc.Node })
  topBar: cc.Node = null;

  @property({ type: cc.Node })
  downloadBtn: cc.Node = null;

  @property({ type: cc.Label })
  titleLabel: cc.Label = null;

  async onLoad() {
    // 屏幕适配
    this.adapter(gi.ScreenManager.getOrientation());
    gi.EventManager.on(Constant.EVENT.ORIENTATION_CHANGED, this.adapter, this);

    this.initGameView();

    // 初始化多语言文本管理器
    await I18TextManager.init();

    /** 设置关卡标题 */
    this.titleLabel.string = I18TextManager.getText(
      "1000",
      Constant.TIPS_TYPE.VOICE
    );

    // 先挂载Tips，因为Tips里面需要监听showTips事件，如果先挂载关卡预制体，并且里面立即执行的分支表达式里面发送了showTips事件就没法被Tips监听到了。
    this.wrap.addChild(await this.loadTipsPrefab(), 2);
    this.wrap.addChild(await this.loadLevelPrefab(), 0);
  }

  /** 加载关卡预制体 */
  loadLevelPrefab(): Promise<cc.Node> {
    return new Promise((resolve, reject) => {
      // 获取关卡数据
      const levelData = gi.DataManager.getModule<LevelData>(
        Constant.DATA_MODULE.LEVEL
      );

      // 加载关卡场景
      gi.ResourceManager.loadRes(
        `${Constant.LEVEL_PREFIX.PATH}${levelData.getCurrentLevel()}`,
        cc.Prefab
      )
        .then((levelPrefab: cc.Prefab) => {
          const root = cc.instantiate(levelPrefab);
          root.addComponent(StarupLevel);
          resolve(root);
        })
        .catch((err) => {
          console.error(
            `[GAME] Error loading level preform, game exits, ${err}`
          );
          reject(err);
        });
    });
  }

  /** 加载提示弹窗预制体 */
  loadTipsPrefab(): Promise<cc.Node> {
    return new Promise((resolve, reject) => {
      gi.ResourceManager.loadRes(Constant.UI_PREFAB_URL.TIPS, cc.Prefab)
        .then((tipsPrefab: cc.Prefab) => {
          const node = cc.instantiate(tipsPrefab);
          resolve(node);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /** 根据屏幕方向适配游戏窗口内的节点位置以及缩放 */
  adapter(orientation: string) {
    this.updateBgSize();

    const designWidth = cc.Canvas.instance.designResolution.width;
    const designHeight = cc.Canvas.instance.designResolution.height;
    let scaleX = cc.winSize.width / designHeight;
    let scaleY = cc.winSize.height / designWidth;
    const scaleMin = Math.min(scaleX, scaleY);

    if (orientation === "Landscape") {
      // 切换为横屏后需要手动适配主要节点的位置以及缩放
      this.topBar.scale = this.downloadBtn.scale = scaleMin;
      // wrap在不同屏幕下锚定高度为当前窗口实际高度的百分之80
      this.wrap.scale = (cc.winSize.height * 0.8) / this.wrap.height;

      this.wrap.setPosition(cc.v2(cc.winSize.width / 5, 0));
      this.topBar.setPosition(
        cc.v2(-cc.winSize.width / 4, cc.winSize.height / 6)
      );
      this.downloadBtn.setPosition(
        cc.v2(-cc.winSize.width / 4, -cc.winSize.height / 6)
      );
    } else {
      // 由于在编辑器中是竖屏状态下放置节点的，所以切换回竖屏只需要把编辑器里的节点位置、缩放直接设置上去就可以了
      this.wrap.scale = this.topBar.scale = this.downloadBtn.scale = 1;

      this.wrap.setPosition(0, 0);
      this.topBar.setPosition(0, 824.765);
      this.downloadBtn.setPosition(0, -836.853);
    }
  }

  updateBgSize() {
    this.node.setContentSize(cc.winSize);
    this.node.getChildByName("Bg").getComponent(cc.Widget).updateAlignment();
  }

  /** 初始化游戏窗口 */
  private initGameView() {
    // 设置游戏视窗
    const globalData = gi.DataManager.getModule<GlobalData>(
      Constant.DATA_MODULE.GLOBAL
    );
    globalData.setGameView(this.wrap);

    const onTouchStart = (event: cc.Event.EventTouch) => {
      if (globalData.isTouchEnabled()) {
        gi.EventManager.emit(Constant.EVENT.GAME_TOUCH_START, event);
      } else {
        event.stopPropagation();
      }
    };

    const onTouchMove = (event: cc.Event.EventTouch) => {
      if (globalData.isTouchEnabled()) {
        gi.EventManager.emit(Constant.EVENT.GAME_TOUCH_MOVE, event);
      } else {
        event.stopPropagation();
      }
    };

    const onTouchCancel = (event: cc.Event.EventTouch) => {
      if (globalData.isTouchEnabled()) {
        gi.EventManager.emit(Constant.EVENT.GAME_TOUCH_CANCEL, event);
      } else {
        event.stopPropagation();
      }
    };

    const onTouchEnd = (event: cc.Event.EventTouch) => {
      if (globalData.isTouchEnabled()) {
        gi.EventManager.emit(Constant.EVENT.GAME_TOUCH_END, event);
      } else {
        event.stopPropagation();
      }
    };

    globalData
      .getGameView()
      .on(cc.Node.EventType.TOUCH_START, onTouchStart, this, true);

    globalData
      .getGameView()
      .on(cc.Node.EventType.TOUCH_MOVE, onTouchMove, this, true);

    globalData
      .getGameView()
      .on(cc.Node.EventType.TOUCH_CANCEL, onTouchCancel, this, true);

    globalData
      .getGameView()
      .on(cc.Node.EventType.TOUCH_END, onTouchEnd, this, true);
  }
}
