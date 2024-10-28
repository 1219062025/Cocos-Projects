import { _decorator, Color, Component, Label, Node, sp, Animation } from 'cc';
import { Constant } from '../../framework/constant';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
import { PlayerData } from '../../framework/playerData';
import { Util } from '../../framework/util';
import { GobeUtil } from '../../core/gobeUtil';
import { ClientEvent } from '../../framework/clientEvent';
import { UIManager } from '../../framework/uiManager';
const { ccclass, property } = _decorator;

const LANGUAGE_LABEL_COLOR = {
  NONE: new Color(255, 255, 255),
  CHOOSE: new Color(0, 0, 0)
};

@ccclass('StartPanel')
export class StartPanel extends Component {
  /** 背景大图骨骼组件-中文 */
  @property({ type: sp.Skeleton, tooltip: '背景大图骨骼组件-中文' })
  bgSkeletonZh: sp.Skeleton = null;

  /** 背景大图骨骼组件-英文 */
  @property({ type: sp.Skeleton, tooltip: '背景大图骨骼组件-英文' })
  bgSkeletonEn: sp.Skeleton = null;

  /** 使用的背景大图骨骼组件 */
  bgSkeleton: sp.Skeleton = null;

  /** 开始游戏按钮 */
  @property({ type: Node, tooltip: '开始游戏按钮' })
  startBtn: Node = null;

  /** 华为账号登录按钮 */
  @property({ type: Node, tooltip: '华为账号登录按钮' })
  startHWBtn: Node = null;

  /** loading动画 */
  @property({ type: Animation, tooltip: 'loading动画' })
  loadAni: Animation = null;

  /** 切换语言按钮 */
  @property({ type: Node, tooltip: '切换语言按钮' })
  changeLanguageBtn: Node = null;

  /** 切换语言按钮的"中"字 */
  @property({ type: Label, tooltip: '切换语言按钮的"中"字' })
  languageLabelZh: Label = null!;

  /** 切换语言按钮的"EN"字 */
  @property({ type: Label, tooltip: '切换语言按钮的"EN"字' })
  languageLabelEn: Label = null!;

  /** 切换语言按钮的当前选中语言背景色节点 */
  @property({ type: Node, tooltip: '切换语言按钮的当前选中语言背景色节点' })
  dotNode: Node = null;

  show() {
    this._initLanguage();

    this.scheduleOnce(() => {
      this.startBtn.active = true;
      this.changeLanguageBtn.active = true;

      if (GobeUtil.instance.isHwInit) {
        this.startHWBtn.active = true;
      }
    }, 1.5);

    if (!GobeUtil.instance.isHwInit) {
      GobeUtil.instance.initHuawei();
    }
  }

  protected onEnable(): void {
    ClientEvent.on(Constant.EVENT_NAME.HUAWEI_LOGIN_MSG, this._initSuccess, this);
  }

  protected onDisable(): void {
    ClientEvent.off(Constant.EVENT_NAME.HUAWEI_LOGIN_MSG, this._initSuccess, this);
  }

  /** 初始化完成后 */
  private _initSuccess(code: number, msg: string) {
    // 账号登录
    if (code == Constant.HUAWEI_LOGIN.SIGN_IN_SUCCESS) {
      GobeUtil.instance.isHwLogin = true;
      this._loginGame();
    } else if (code == Constant.HUAWEI_LOGIN.INIT_SUCCESS) {
      // 华为初始化
      this.startHWBtn.active = true;
    } else if (code == Constant.HUAWEI_LOGIN.INIT_UNDER_AGE) {
    } else if (code == Constant.HUAWEI_LOGIN.INIT_ERROR) {
    } else if (code == Constant.HUAWEI_LOGIN.SIGN_IN_ERROR) {
      UIManager.instance.showTips(Constant.ROOM_TIPS.HUA_WEI_LOAGIN_ERROR);
      this.loadAni.node.active = false;
      this.loadAni.stop();
    }
  }

  /** 开始游戏 */
  public onStartGame() {
    this.loadAni.node.active = true;
    this.loadAni.play();

    this._loginGame();
  }

  /** 点击华为登录按钮开始游戏 */
  public onStartGameHW() {
    this.loadAni.node.active = true;
    this.loadAni.play();

    GobeUtil.instance.hwSignIn();
  }

  /** 登录 */
  private _loginGame() {
    if (!GobeUtil.instance.isChangeWifiType) {
      GobeUtil.instance.createRoomAI(
        () => {
          UIManager.instance.showDialog(Constant.PANEL_NAME.READY);
        },
        () => {
          UIManager.instance.showTips(Constant.ROOM_TIPS.CREATE_ROOM_ERROR);
        }
      );
    } else {
      const playerId = PlayerData.instance.playerInfo['playerId'];
      GobeUtil.instance.initSDK(playerId, (successInit: boolean) => {
        if (successInit) {
          UIManager.instance.showDialog(Constant.PANEL_NAME.SELECT_GAME);
          UIManager.instance.hideDialog(Constant.PANEL_NAME.START_GAME);
        } else {
          UIManager.instance.showTips(Constant.ROOM_TIPS.LOGIN_GAME_ERROR);
        }
      });
    }
  }

  /** 基于扩展插件i18初始化开始游戏界面 */
  private _initLanguage() {
    if (i18n._language === Constant.I18_LANGUAGE.CHINESE) {
      // 当前语言是中文时
      this.bgSkeletonZh.node.active = true;
      this.bgSkeletonEn.node.active = false;

      this.languageLabelZh.color = LANGUAGE_LABEL_COLOR.CHOOSE;
      this.languageLabelEn.color = LANGUAGE_LABEL_COLOR.NONE;

      this.dotNode.setPosition(this.languageLabelZh.node.getPosition());

      this.bgSkeleton = this.bgSkeletonZh;
    } else if (i18n._language === Constant.I18_LANGUAGE.ENGLISH) {
      // 当前语言是英文时
      this.bgSkeletonZh.node.active = false;
      this.bgSkeletonEn.node.active = true;

      this.languageLabelZh.color = LANGUAGE_LABEL_COLOR.NONE;
      this.languageLabelEn.color = LANGUAGE_LABEL_COLOR.CHOOSE;

      this.dotNode.setPosition(this.languageLabelEn.node.getPosition());

      this.bgSkeleton = this.bgSkeletonEn;
    }

    // 触发背景骨骼动画
    this.bgSkeleton.setAnimation(0, 'start', false);
    this.bgSkeleton.addAnimation(0, 'idle', true);
  }

  /** 切换开始游戏界面的语言 */
  changeLanguage() {
    let currentLanguage;

    if (i18n._language === Constant.I18_LANGUAGE.CHINESE) {
      currentLanguage = Constant.I18_LANGUAGE.ENGLISH;

      this.bgSkeletonZh.node.active = false;
      this.bgSkeletonEn.node.active = true;

      this.languageLabelZh.color = LANGUAGE_LABEL_COLOR.NONE;
      this.languageLabelEn.color = LANGUAGE_LABEL_COLOR.CHOOSE;

      this.dotNode.setPosition(this.languageLabelEn.node.getPosition());

      this.bgSkeleton = this.bgSkeletonEn;
      this.bgSkeleton.addAnimation(0, 'idle', true);
    } else if (i18n._language === Constant.I18_LANGUAGE.ENGLISH) {
      currentLanguage = Constant.I18_LANGUAGE.CHINESE;

      this.bgSkeletonZh.node.active = true;
      this.bgSkeletonEn.node.active = false;

      this.languageLabelZh.color = LANGUAGE_LABEL_COLOR.CHOOSE;
      this.languageLabelEn.color = LANGUAGE_LABEL_COLOR.NONE;

      this.dotNode.setPosition(this.languageLabelZh.node.getPosition());

      this.bgSkeleton = this.bgSkeletonZh;
      this.bgSkeleton.addAnimation(0, 'idle', true);
    }

    // 切换语言
    i18n.init(currentLanguage);
    i18n.updateSceneRenderers();

    // 根据当前语言更新玩家昵称
    var staticId = PlayerData.instance.playerInfo['playerName'];
    Util.randomName(staticId).then((playerName: string) => {
      PlayerData.instance.updatePlayerInfo('playerName', playerName);
    });
  }
}
