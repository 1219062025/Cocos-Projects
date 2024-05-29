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

  onLoad() {
    // 监听屏幕方向变化
    EventManager.on('LANDSCAPE', this.landscape, this);
    EventManager.on('PORTRAIT', this.portrait, this);
  }

  /** 屏幕方向变为横屏 */
  landscape() {
    const winSize = cc.winSize;
    this.GameContainer.setPosition(cc.v2(winSize.width / 4, 0));
    this.h_button.setPosition(cc.v2(-winSize.width / 4, 0));
    this.progress.setPosition(cc.v2(-winSize.width / 4, 0 + this.h_button.height * 2.5));
    const GameCointainerSize: cc.Size = new cc.Size(1080, 1080);
    let scale = 1;
    let h = winSize.height / GameCointainerSize.height;
    let w = winSize.width / 2 / GameCointainerSize.width;
    scale = Math.min(h, w);
    cc.log('scale:', scale);
    this.GameContainer.scale = scale;
    this.progress.scale = this.h_button.scale = scale;
  }

  /** 屏幕方向变为竖屏 */
  portrait() {
    let scale = 1;
    const winSize = cc.winSize;
    const GameCointainerSize: cc.Size = new cc.Size(1080, 1080);
    this.progress.setPosition(cc.v2(0, winSize.height / 2 + this.progress.height - GameCointainerSize.height / 3));
    this.GameContainer.setPosition(cc.v2(0, 0));
    cc.log('scale:', scale);
    this.GameContainer.scale = 1;
    this.h_button.setPosition(cc.v2(0, -winSize.height / 2 + this.h_button.height));
    this.progress.scale = this.h_button.scale = scale;
  }
}
