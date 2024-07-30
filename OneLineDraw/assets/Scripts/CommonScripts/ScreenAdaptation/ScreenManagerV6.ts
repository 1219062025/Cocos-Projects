import EventManager from '../EventManager';
import changeOrientation from './changeOrientation';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScreenManagerV6 extends cc.Component {
  @property(cc.Node)
  GameContainer: cc.Node = null;

  @property(cc.Node)
  h_button: cc.Node = null;

  @property(cc.Node)
  progress: cc.Node = null;

  @property(cc.Node)
  tile: cc.Node = null;

  @property(cc.Node)
  pop: cc.Node = null;

  onLoad() {
    // 监听屏幕方向变化
    EventManager.on('LANDSCAPE', this.landscape, this);
    EventManager.on('PORTRAIT', this.portrait, this);
  }

  /** 屏幕方向变为横屏 */
  landscape() {
    const winSize = cc.winSize;
    this.GameContainer.setPosition(cc.v2(winSize.width / 4, 0));
    this.h_button.setPosition(cc.v2(-winSize.width / 4, 0 - this.h_button.height * 2));
    this.progress.setPosition(cc.v2(-winSize.width / 4, 0 + this.h_button.height * 2.5));
    this.tile.setPosition(cc.v2(-winSize.width / 4, 0 + this.h_button.height * 2.5));
    const GameCointainerSize: cc.Size = new cc.Size(1080, 1080);
    let scale = 1;
    let h = winSize.height / GameCointainerSize.height;
    let w = winSize.width / 2 / GameCointainerSize.width;
    scale = Math.min(h, w);
    this.h_button.stopAllActions();
    this.h_button.scale = 1;
    this.pop.scale = this.GameContainer.scale = this.progress.scale = this.tile.scale = this.h_button.scale = scale;
    cc.tween(this.h_button).by(0.6, { scale: 0.1 }).by(0.6, { scale: -0.1 }).union().repeatForever().start();
  }

  /** 屏幕方向变为竖屏 */
  portrait() {
    let scale = 1;
    const winSize = cc.winSize;
    const GameCointainerSize: cc.Size = new cc.Size(1080, 1080);
    this.progress.setPosition(cc.v2(0, winSize.height / 2 + this.progress.height - GameCointainerSize.height / 3));
    this.tile.setPosition(cc.v2(0, winSize.height / 2 + this.progress.height - GameCointainerSize.height / 3));
    this.GameContainer.setPosition(cc.v2(0, 0));
    this.h_button.setPosition(cc.v2(0, -winSize.height / 2 + this.h_button.height));
    this.h_button.stopAllActions();
    this.h_button.scale = 1;
    this.pop.scale = this.GameContainer.scale = this.progress.scale = this.tile.scale = this.h_button.scale = scale;
    cc.tween(this.h_button).by(0.6, { scale: 0.1 }).by(0.6, { scale: -0.1 }).union().repeatForever().start();
  }
}
