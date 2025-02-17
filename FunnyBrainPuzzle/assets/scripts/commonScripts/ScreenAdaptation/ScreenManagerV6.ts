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

  gameWrapOriPos: cc.Vec2 = null;
  titleOriPos: cc.Vec2 = null;
  btnOriPos: cc.Vec2 = null;
  successPopOriPos: cc.Vec2 = null;
  failPopOriPos: cc.Vec2 = null;

  onLoad() {
    this.gameWrapOriPos = this.gameWrap.getPosition();
    this.titleOriPos = this.title.getPosition();
    this.btnOriPos = this.btn.getPosition();
    this.successPopOriPos = this.successPop.getPosition();
    this.failPopOriPos = this.failPop.getPosition();

    gi.Event.on("view-resize", this.adapter, this);
  }

  adapter() {
    const ratio = cc.winSize.width / cc.winSize.height;

    if (ratio > 1) {
      // 当ratio大于1时，设置为横屏状态，否则是竖屏状态

      const designWidth = cc.Canvas.instance.designResolution.width;
      const designHeight = cc.Canvas.instance.designResolution.height;
      let scaleX = cc.winSize.width / designHeight;
      let scaleY = cc.winSize.height / designWidth;
      const scaleMin = Math.min(scaleX, scaleY);
      this.failPop.scale =
        this.successPop.scale =
        this.title.scale =
        this.btn.scale =
          scaleMin;

      // 横屏时，gameWrap在不同屏幕下锚定高度为当前窗口实际高度的百分之80
      this.gameWrap.scale = (cc.winSize.height * 0.8) / this.gameWrap.height;

      const gameWrapPos = cc.v2(cc.winSize.width / 5, 0);
      const titlePos = cc.v2(-cc.winSize.width / 5, cc.winSize.height / 6);
      const btnPos = cc.v2(-cc.winSize.width / 5, -cc.winSize.height / 6);

      this.gameWrap.setPosition(gameWrapPos);
      this.title.setPosition(titlePos);
      this.btn.setPosition(btnPos);
    } else if (ratio > 0.6 && ratio < 1) {
      // 此时UI会有一部分超出屏幕，所以需要特殊设置UI的位置以及缩放

      // 0.76、0.6不是什么精确的界限，只是通过手动调节后观察到的值，有需要可以改成其他的。当ratio大于0.76时，UI的缩放比例设置为0.6，否则设置为ratio / 1
      const scale = ratio > 0.76 ? 0.6 : ratio / 1;

      this.gameWrap.scale =
        this.failPop.scale =
        this.successPop.scale =
        this.title.scale =
        this.btn.scale =
          scale;

      const scaleVec = cc.v2(0, scale);
      this.gameWrap.setPosition(this.gameWrapOriPos.scale(scaleVec));
      this.title.setPosition(this.titleOriPos.scale(scaleVec));
      this.btn.setPosition(this.btnOriPos.scale(scaleVec));
    } else if (ratio < 0.6) {
      // ratio < 0.6时，UI能够很好的覆盖整个屏幕。所以这种情况下只需要把编辑器里的节点位置、缩放直接设置上去就可以了
      this.btn.setContentSize(424, 152);
      this.gameWrap.scale =
        this.failPop.scale =
        this.successPop.scale =
        this.title.scale =
        this.btn.scale =
          1;

      const gameWrapPos = cc.v2(0, 0);
      const titlePos = cc.v2(0, 832.051);
      const btnPos = cc.v2(0, -822.082);

      this.gameWrap.setPosition(gameWrapPos);
      this.title.setPosition(titlePos);
      this.btn.setPosition(btnPos);
    }
  }
}
