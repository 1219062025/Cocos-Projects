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
  countDownNode: cc.Node = null;

  @property({ type: cc.Node })
  downloadBtn: cc.Node = null;

  @property({ type: cc.Label })
  titleLabel: cc.Label = null;

  @property({ type: cc.Label })
  countDownText: cc.Label = null;

  wrapOriPos: cc.Vec2 = null;
  topBarOriPos: cc.Vec2 = null;
  countDownNodeOriPos: cc.Vec2 = null;
  downloadBtnOriPos: cc.Vec2 = null;

  async onLoad() {
    // 记录关键UI节点的原始位置
    this.wrapOriPos = this.wrap.getPosition();
    this.topBarOriPos = this.topBar.getPosition();
    this.countDownNodeOriPos = this.countDownNode.getPosition();
    this.downloadBtnOriPos = this.downloadBtn.getPosition();

    // 屏幕适配
    this.adapter(gi.ScreenManager.getOrientation());
    gi.EventManager.on(Constant.EVENT.VIEW_RESIZE, this.adapter, this);

    // 倒计时
    gi.EventManager.on(Constant.EVENT.COUNT_DOWN, this.onCountDown, this);

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

    /** 加载bgm */
    gi.AudioManager.playMusic(Constant.MUSIC_PATH.BGM, true);
  }

  onCountDown(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    this.countDownText.string = `${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
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
    const ratio = cc.winSize.width / cc.winSize.height;

    if (ratio > 1) {
      // 当ratio大于1时，设置为横屏状态，否则是竖屏状态

      // 切换为横屏后需要手动适配主要节点的位置以及缩放
      const designWidth = cc.Canvas.instance.designResolution.width;
      const designHeight = cc.Canvas.instance.designResolution.height;
      let scaleX = cc.winSize.width / designHeight;
      let scaleY = cc.winSize.height / designWidth;
      const scaleMin = Math.min(scaleX, scaleY);

      this.topBar.scale =
        this.countDownNode.scale =
        this.downloadBtn.scale =
          scaleMin;

      // 横屏时，wrap在不同屏幕下锚定高度为当前窗口实际高度的百分之80
      this.wrap.scale = (cc.winSize.height * 0.8) / this.wrap.height;

      this.wrap.setPosition(cc.v2(cc.winSize.width / 5, 0));
      this.topBar.setPosition(
        cc.v2(-cc.winSize.width / 4, cc.winSize.height / 6)
      );
      this.countDownNode.setPosition(
        cc.v2(cc.winSize.width / 5, cc.winSize.height / 2.33)
      );
      this.downloadBtn.setPosition(
        cc.v2(-cc.winSize.width / 4, -cc.winSize.height / 6)
      );
    } else if (ratio > 0.6 && ratio < 1) {
      // 此时UI会有一部分超出屏幕，所以需要特殊设置UI的位置以及缩放

      // 0.76、0.6不是什么精确的界限，只是通过手动调节后观察到的值，有需要可以改成其他的。当ratio大于0.76时，UI的缩放比例设置为0.6，否则设置为ratio / 1
      const scale = ratio > 0.76 ? 0.6 : ratio / 1;
      this.wrap.scale =
        this.topBar.scale =
        this.countDownNode.scale =
        this.downloadBtn.scale =
          scale;

      const scaleVec = cc.v2(0, scale);
      this.wrap.setPosition(this.wrapOriPos.scale(scaleVec));
      this.topBar.setPosition(this.topBarOriPos.scale(scaleVec));
      this.countDownNode.setPosition(this.countDownNodeOriPos.scale(scaleVec));
      this.downloadBtn.setPosition(this.downloadBtnOriPos.scale(scaleVec));
    } else if (ratio < 0.6) {
      // ratio < 0.6时，UI能够很好的覆盖整个屏幕。所以这种情况下只需要把编辑器里的节点位置、缩放直接设置上去就可以了
      this.wrap.scale =
        this.topBar.scale =
        this.countDownNode.scale =
        this.downloadBtn.scale =
          1;

      this.wrap.setPosition(this.wrapOriPos);
      this.topBar.setPosition(this.topBarOriPos);
      this.countDownNode.setPosition(this.countDownNodeOriPos);
      this.downloadBtn.setPosition(this.downloadBtnOriPos);
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
