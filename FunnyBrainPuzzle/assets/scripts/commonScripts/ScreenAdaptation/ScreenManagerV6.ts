const { ccclass, property } = cc._decorator;

@ccclass
export default class ScreenManagerV6 extends cc.Component {
  @property(cc.Node)
  gameWrap: cc.Node = null;
  @property(cc.Node)
  title: cc.Node = null;
  @property(cc.Node)
  btn: cc.Node = null;
  @property(cc.Node)
  successPop: cc.Node = null;
  @property(cc.Node)
  failPop: cc.Node = null;

  onLoad() {
    // 监听屏幕方向变化
    gi.Event.on("LANDSCAPE", this.landscape, this);
    gi.Event.on("PORTRAIT", this.portrait, this);
  }

  /** 屏幕方向变为横屏 */
  landscape() {
    gi.scale = 1;
    const winSize = cc.winSize;

    const gameCointainerSize: cc.Size = new cc.Size(1080, 1420);

    let h = winSize.height / gameCointainerSize.height;
    let w = winSize.width / 2 / gameCointainerSize.width;
    gi.scale = Math.min(h, w);

    this.failPop.scale =
      this.successPop.scale =
      this.title.scale =
      this.btn.scale =
        gi.scale;

    const gameWrapRect = this.gameWrap.getBoundingBoxToWorld();
    const titleRect = this.title.getBoundingBoxToWorld();
    const btnRect = this.btn.getBoundingBoxToWorld();

    const gameWrapPos = cc.v2(winSize.width / 5, 0);
    const titlePos = cc.v2(-winSize.width / 5, winSize.height / 6);
    const btnPos = cc.v2(-winSize.width / 5, -winSize.height / 6);

    this.gameWrap.setPosition(gameWrapPos);
    this.title.setPosition(titlePos);
    this.btn.setPosition(btnPos);
  }

  /** 屏幕方向变为竖屏 */
  portrait() {
    gi.scale = 1;
    const winSize = cc.winSize;

    const gameCointainerSize: cc.Size = new cc.Size(1080, 1420);
    cc.Canvas.instance.node.setContentSize(winSize.width, winSize.height);

    // this.gameWrap.setContentSize(this.gameWrap.width * gi.scale, this.gameWrap.height * gi.scale);
    // this.title.setContentSize(this.title.width * gi.scale, this.title.height * gi.scale);
    this.btn.setContentSize(424, 152);
    this.failPop.scale =
      this.successPop.scale =
      this.title.scale =
      this.btn.scale =
        gi.scale;

    const gameWrapPos = cc.v2(0, 0);
    const titlePos = cc.v2(0, 832.051);
    const btnPos = cc.v2(0, -822.082);

    this.gameWrap.setPosition(gameWrapPos);
    this.title.setPosition(titlePos);
    this.btn.setPosition(btnPos);
  }
}
