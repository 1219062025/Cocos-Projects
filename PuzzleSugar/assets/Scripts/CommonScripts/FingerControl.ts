const { ccclass, property } = cc._decorator;

@ccclass
export default class FingerControl extends cc.Component {
  onLoad(): void {}

  Init(position: cc.Vec2) {
    this.PlayAnimation(position);
    cc.find('Canvas').on(cc.Node.EventType.TOUCH_START, this.Remove, this, true);
    cc.find('Canvas').on(cc.Node.EventType.TOUCH_MOVE, this.Remove, this, true);
  }

  Remove() {
    this.node.destroy();
  }

  PlayAnimation(position: cc.Vec2) {
    cc.tween(this.node)
      .call(() => {
        this.node.setPosition(cc.v2(position.x + this.node.width / 2 + 30, position.y - this.node.height / 2 - 30));
        this.node.zIndex = 999;
        this.node.angle = 10;
      })
      .parallel(cc.tween().to(0.7, { position: cc.v2(position.x + this.node.width / 2, position.y - this.node.height / 2) }), cc.tween().to(0.5, { angle: 15 }))
      .delay(0.1)
      .union()
      .repeatForever()
      .start();
  }

  onDestroy(): void {
    cc.find('Canvas').off(cc.Node.EventType.TOUCH_START, this.Remove, this, true);
    cc.find('Canvas').off(cc.Node.EventType.TOUCH_MOVE, this.Remove, this, true);
  }
}
