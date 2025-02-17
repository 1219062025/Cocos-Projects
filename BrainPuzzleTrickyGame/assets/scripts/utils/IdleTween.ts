const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Utils/IdleTween")
export default class IdleTween extends cc.Component {
  @property
  startScaleX: number = 1;

  @property
  endScaleX: number = 1;

  @property
  startScaleY: number = 1;

  @property
  endScaleY: number = 1;

  @property
  duration: number = 0;

  onLoad() {
    this.execute();
  }

  execute() {
    (cc.tween(this.node) as cc.Tween)
      .to(this.duration, {
        scaleX: this.startScaleX,
        scaleY: this.startScaleY,
      })
      .to(this.duration, {
        scaleX: this.endScaleX,
        scaleY: this.endScaleY,
      })
      .union()
      .repeatForever()
      .start();
  }

  reset() {
    this.node.stopAllActions();
    this.execute();
  }
}
