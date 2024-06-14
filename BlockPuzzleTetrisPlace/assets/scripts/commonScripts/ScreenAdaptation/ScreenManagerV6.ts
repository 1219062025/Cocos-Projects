import EventManager from '../EventManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScreenManagerV6 extends cc.Component {
  @property(cc.Node)
  gameContainer: cc.Node = null;

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

    const gameContainerPos = cc.v2(0, 0);

    this.gameContainer.setPosition(gameContainerPos);

    let h = winSize.height / gameCointainerSize.height;
    let w = winSize.width / 2 / gameCointainerSize.width;
    scale = Math.min(h, w);
    this.gameContainer.scale = scale;
  }

  /** 屏幕方向变为竖屏 */
  portrait() {
    let scale = 1;
    const winSize = cc.winSize;

    const gameCointainerSize: cc.Size = new cc.Size(960, 1836);

    const gameContainerPos = cc.v2(0, 0);

    this.gameContainer.setPosition(gameContainerPos);

    this.gameContainer.scale = scale;
  }
}
