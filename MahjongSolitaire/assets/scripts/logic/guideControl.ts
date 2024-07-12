const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideControl extends cc.Component {
  @property(cc.Node)
  private upIcon: cc.Node = null;

  @property(cc.Node)
  private downIcon: cc.Node = null;

  onLoad() {
    this.node.setParent(cc.Canvas.instance.node);
    this.upIcon.setSiblingIndex(2);
    this.downIcon.setSiblingIndex(2);
  }

  click() {
    this.down();
    this.scheduleOnce(this.up, 0.1);
  }

  up() {
    this.upIcon.active = true;
    this.downIcon.active = false;
  }

  down() {
    this.upIcon.active = false;
    this.downIcon.active = true;
  }

  /** 提示点击 */
  promptClick() {
    (cc.tween(this.node) as cc.Tween)
      .delay(1)
      .call(() => {
        this.click();
      })
      .union()
      .repeatForever()
      .start();
  }
}
