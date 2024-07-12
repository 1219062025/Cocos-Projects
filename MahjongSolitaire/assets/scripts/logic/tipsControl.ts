const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  @property(cc.Label)
  text: cc.Label = null;

  onLoad() {
    gi.Event.on(
      'showTips',
      (text: string) => {
        if (text) {
          this.node.stopAllActions();
          (cc.tween(this.node) as cc.Tween)
            .to(0.07, { opacity: 0 })
            .call(() => {
              this.text.string = text;
            })
            .to(0.2, { opacity: 255 })
            .start();
        }
      },
      this
    );
  }
}
