import EventManager from '../EventManager';
import changeOrientation from './changeOrientation';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScreenManagerV6 extends cc.Component {
  @property(cc.Node)
  RewardBanner: cc.Node = null;

  @property(cc.Node)
  AboutBanner: cc.Node = null;

  @property(cc.Node)
  GameContainer: cc.Node = null;

  //   @property(cc.Node)
  //   giftCard: cc.Node = null;

  @property(cc.Node)
  h_button: cc.Node = null;

  @property(cc.Node)
  h_aboutGame: cc.Node = null;

  @property(changeOrientation)
  top_changeOri: changeOrientation = null;

  onLoad() {
    // 监听屏幕方向变化
    EventManager.on('LANDSCAPE', this.landscape, this);
    EventManager.on('PORTRAIT', this.portrait, this);
  }

  /** 屏幕方向变为横屏 */
  landscape() {
    this.top_changeOri.isHorizontal();
    const winSize = cc.winSize;
    this.AboutBanner.active = false;
    this.h_aboutGame.active = this.h_button.active = true;
    // this.giftCard.active = false;
    this.GameContainer.setPosition(cc.v2(winSize.width / 4, 0));

    // this.RewardBanner.setPosition(cc.v2(-winSize.width / 4, winSize.height / 3));
    this.RewardBanner.setPosition(cc.v2(-winSize.width / 4, 0));
    this.h_aboutGame.setPosition(cc.v2(-winSize.width / 4, winSize.height / 2.8));
    this.h_button.setPosition(cc.v2(-winSize.width / 4, -winSize.height / 2.8));

    this.AboutBanner.setPosition(cc.v2(-winSize.width / 4, -winSize.height / 3));
    // const GameCointainerSize: cc.Size = this.GameContainer.getContentSize();
    const GameCointainerSize: cc.Size = new cc.Size(720, 720);
    // this.giftCard.active = true;
    // this.giftCard.setPosition(cc.v2(-winSize.width / 4, 0));
    let scale = 1;
    let h = winSize.height / GameCointainerSize.height;
    let w = winSize.width / 2 / GameCointainerSize.width;
    scale = Math.min(h, w);
    cc.log('h:', h);
    cc.log('w:', w);
    cc.log('scale:', scale);
    // this.giftCard.scale =
    this.GameContainer.scale = this.RewardBanner.scale = this.AboutBanner.scale = scale;
    this.h_aboutGame.scale = this.h_button.scale = scale;
  }

  /** 屏幕方向变为竖屏 */
  portrait() {
    this.top_changeOri.isVertical();
    // this.giftCard.active = false;
    let scale = 1;
    const winSize = cc.winSize;
    // this.AboutBanner.active = false;
    this.AboutBanner.active = true;
    this.h_aboutGame.active = this.h_button.active = false;

    this.GameContainer.setPosition(cc.v2(0, 0));

    this.RewardBanner.setPosition(cc.v2(0, winSize.height / 2 - this.RewardBanner.height / 2 - 50));
    this.AboutBanner.setPosition(cc.v2(0, -winSize.height / 2 + this.RewardBanner.height / 2 + 50));
    this.GameContainer.scale = this.RewardBanner.scale = this.AboutBanner.scale = scale;
    this.h_aboutGame.scale = this.h_button.scale = scale;
  }

  // update (dt) {}
}
