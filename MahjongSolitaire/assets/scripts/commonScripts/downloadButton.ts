const { ccclass, property } = cc._decorator;

@ccclass
export default class DownloadButton extends cc.Component {
  @property(cc.Float)
  scaleTime = 1.0;

  @property({
    type: cc.Float,
    visible() {
      return this.isBy;
    }
  })
  byScale = 0.1;

  @property({
    type: cc.Float,
    visible() {
      return this.isTo;
    }
  })
  toMax = 1.1;

  @property({
    type: cc.Float,
    visible() {
      return this.isTo;
    }
  })
  toMin = 1;

  @property(cc.Boolean)
  isBy = true;

  @property(cc.Boolean)
  isTo = false;

  @property(cc.Boolean)
  isDownloadEvt = true;

  start() {
    if (this.isDownloadEvt) {
      this.node.on(
        cc.Node.EventType.TOUCH_START,
        () => {
          this.downloadGame();
        },
        this
      );
    }

    if (this.isBy) {
      cc.tween(this.node).by(this.scaleTime, { scale: this.byScale }).by(this.scaleTime, { scale: -this.byScale }).union().repeatForever().start();
      return;
    } else if (this.isTo) {
      cc.tween(this.node).to(this.scaleTime, { scale: this.toMax }).to(this.scaleTime, { scale: this.toMin }).union().repeatForever().start();
      return;
    }
  }

  downloadGame() {
    //@ts-ignore
    linkToStore();
  }
  // update (dt) {}
}
