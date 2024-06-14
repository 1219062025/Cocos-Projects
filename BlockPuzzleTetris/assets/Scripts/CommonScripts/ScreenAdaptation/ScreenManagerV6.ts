import EventManager from '../EventManager';
import changeOrientation from './changeOrientation';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScreenManagerV6 extends cc.Component {
  @property(cc.Node)
  gameContainer: cc.Node = null;

  @property(cc.Node)
  title: cc.Node = null;

  @property(cc.Node)
  title1: cc.Node = null;

  onLoad() {
    // 监听屏幕方向变化
    EventManager.on('LANDSCAPE', this.landscape, this);
    EventManager.on('PORTRAIT', this.portrait, this);
  }

  /** 屏幕方向变为横屏 */
  landscape() {
    let scale = 1;
    const winSize = cc.winSize;

    const gameCointainerSize: cc.Size = new cc.Size(960, 1836);
    const titleBox = this.title.getBoundingBoxToWorld();
    const title1Box = this.title1.getBoundingBoxToWorld();

    const gameContainerPos = cc.v2(0, 0);
    const titlePos = cc.v2(-gameCointainerSize.width / 2 - titleBox.width / 2 - 100, 0);
    const title1Pos = cc.v2(gameCointainerSize.width / 2 + title1Box.width / 2 + 100, -47.502);

    this.gameContainer.setPosition(gameContainerPos);
    this.title.setPosition(titlePos);
    this.title1.setPosition(title1Pos);

    let h = winSize.height / gameCointainerSize.height;
    let w = winSize.width / 2 / gameCointainerSize.width;
    scale = Math.min(h, w);
    this.gameContainer.scale = this.title.scale = this.title1.scale = scale;
  }

  /** 屏幕方向变为竖屏 */
  portrait() {
    let scale = 1;
    const winSize = cc.winSize;

    const gameCointainerSize: cc.Size = new cc.Size(960, 1836);
    const titleBox = this.title.getBoundingBoxToWorld();
    const title1Box = this.title1.getBoundingBoxToWorld();

    const gameContainerPos = cc.v2(0, 0);
    const titlePos = cc.v2(-1100, 0);
    const title1Pos = cc.v2(1010.274, -47.502);

    this.gameContainer.setPosition(gameContainerPos);
    this.title.setPosition(titlePos);
    this.title1.setPosition(title1Pos);

    this.gameContainer.scale = this.title.scale = this.title1.scale = scale;
  }
}
