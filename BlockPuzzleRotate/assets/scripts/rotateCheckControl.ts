const { ccclass, property } = cc._decorator;

@ccclass
export default class RotateCheckControl extends cc.Component {
  @property(cc.Node)
  rotateIcon: cc.Node = null;

  @property(cc.Node)
  rotateTips: cc.Node = null;

  onLoad() {
    this.node.on('toggle', this.toggle, this);
  }

  toggle(toggle: cc.Toggle) {
    /** ___DEBUG START___ */
    if (!this.isAccordGuide()) {
      toggle.isChecked ? toggle.uncheck() : toggle.check();
      return;
    }
    /** ___DEBUG END___ */

    if (toggle.isChecked) {
      this.rotateTips.active = false;
      const pos = cc.v2(this.node.width / 2 - this.rotateIcon.width / 2, 0);
      (cc.tween(this.rotateIcon) as cc.Tween)
        .to(0.2, { position: pos, angle: -360 })
        .call(() => {
          this.rotateTips.setPosition(cc.v2(-Math.abs(this.rotateTips.x), this.rotateTips.y));
          this.rotateTips.getComponent(cc.Label).string = 'ON';
          this.rotateTips.active = true;
        })
        .start();
      gi.EventManager.emit('toggle', toggle.isChecked);
    } else {
      this.rotateTips.active = false;
      const pos = cc.v2(-this.node.width / 2 + this.rotateIcon.width / 2, 0);
      (cc.tween(this.rotateIcon) as cc.Tween)
        .to(0.2, { position: pos, angle: 0 })
        .call(() => {
          this.rotateTips.setPosition(cc.v2(Math.abs(this.rotateTips.x), this.rotateTips.y));
          this.rotateTips.getComponent(cc.Label).string = 'OFF';
          this.rotateTips.active = true;
        })
        .start();
      gi.EventManager.emit('toggle', toggle.isChecked);
    }
  }

  /** ___DEBUG START___ */

  isAccordGuide() {
    if (!gi.Guide.inGuide) return true;

    if (gi.Guide.step === 2 || gi.Guide.step === 4) {
      return true;
    }
    return false;
  }
  /** ___DEBUG END___ */
}
