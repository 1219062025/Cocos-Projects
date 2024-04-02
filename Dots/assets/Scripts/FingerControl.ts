const { ccclass, property } = cc._decorator;

@ccclass
export default class FingerControl extends cc.Component {
  onLoad(): void {}

  Init(StartPosition: cc.Vec2, EndPosition: cc.Vec2) {
    this.MoveAnimation(StartPosition, EndPosition);
    cc.find('Canvas').on(cc.Node.EventType.TOUCH_START, this.Remove, this);
  }

  Remove() {
    this.node.destroy();
  }

  MoveAnimation(StartPosition: cc.Vec2, EndPosition: cc.Vec2) {
    cc.tween(this.node)
      .call(() => {
        this.node.setPosition(StartPosition);
        this.node.zIndex = 999;
      })
      .to(0.5, { position: EndPosition })
      .delay(0.3)
      .union()
      .repeatForever()
      .start();
  }

  onDestroy(): void {
    cc.find('Canvas').off(cc.Node.EventType.TOUCH_START, this.Remove, this);
  }
}
