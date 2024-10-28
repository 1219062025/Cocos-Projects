import * as i18n from '../../../extensions/i18n/assets/LanguageData';
import { _decorator, Component, game, Input, input, Node, sys } from 'cc';
import { Constant } from '../framework/constant';
import { PlayerData } from '../framework/playerData';
import { AudioManager } from '../framework/audioManager';
import { Util } from '../framework/util';
import { PREVIEW } from 'cc/env';
import { GobeUtil } from '../core/gobeUtil';
import { UIManager } from '../framework/uiManager';
const { ccclass, property } = _decorator;

@ccclass('select')
export class select extends Component {
  protected onLoad(): void {
    this._initLanguage();
  }

  protected start(): void {
    if (PlayerData.instance.isInit === false) {
      // 设置游戏期望帧率
      game.frameRate = 30;
      // 初始化全局音频管理
      AudioManager.instance.init();
      // 载入玩家数据，优先使用本地缓存。
      PlayerData.instance.loadFromCache();

      let playerId: string = PlayerData.instance.playerInfo?.playerId;
      if (playerId == null) {
        playerId = 'cocos' + new Date().getTime().toString().substring(6);
        var staticId: number = Math.floor(Math.random() * 2);
        PlayerData.instance.createPlayerInfo({
          'playerId': playerId,
          'playerName': '',
          'score': 0,
          'icon': Math.floor(Math.random() * 10),
          'staticId': staticId
        });
      }

      // 给玩家随机一个名字
      Util.randomName(staticId).then(playerName => {
        PlayerData.instance.updatePlayerInfo('playerName', playerName);
      });

      // h5 Android 进入全屏模式
      if (!PREVIEW) {
        input.once(
          Input.EventType.TOUCH_END,
          () => {
            if (sys.isBrowser && document.documentElement) {
              let de = document.documentElement;
              if (de.requestFullscreen) {
                de.requestFullscreen();
                // @ts-ignore
              } else if (de.mozRequestFullScreen) {
                // @ts-ignore
                de.mozRequestFullScreen();
                // @ts-ignore
              } else if (de.webkitRequestFullScreen) {
                // @ts-ignore
                de.webkitRequestFullScreen();
              }
            }
          },
          this
        );
      }

      const ownPlayerId = GobeUtil.instance.ownPlayerId;

      if (ownPlayerId === '') {
        // 打开登录界面
        UIManager.instance.showDialog(Constant.PANEL_NAME.START_GAME);
      } else {
        // 打开大厅选择界面
        UIManager.instance.showDialog(Constant.PANEL_NAME.SELECT_GAME);
      }
    }
  }

  /**
   * 初始化i18n
   * @param nowLanguage 使用语言的语言代码，例如中文：zh，英语：en
   */
  private _initLanguage(nowLanguage?: string) {
    if (i18n.ready) return;
    if (!nowLanguage) {
      nowLanguage = Constant.I18_LANGUAGE.CHINESE;
    }
    i18n.init(nowLanguage);
  }
}
