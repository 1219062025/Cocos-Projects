const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  @property(cc.Node)
  finger: cc.Node = null;

  onLoad() {
    // (cc.tween(this.node) as cc.Tween).to(1, { opacity: 180 }).to(1, { opacity: 255 }).union().repeatForever().start();
    (cc.tween(this.finger) as cc.Tween)
      .to(1, { position: cc.v2(200, 0), angle: -25 })
      .to(1, { position: cc.v2(-200, 0), angle: 25 })
      .union()
      .repeatForever()
      .start();
  }
}
