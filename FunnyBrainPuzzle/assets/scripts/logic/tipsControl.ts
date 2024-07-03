const { ccclass, property } = cc._decorator;

@ccclass
export default class TipsControl extends cc.Component {
  @property(cc.Label)
  text: cc.Label = null;

  onLoad() {
    gi.Event.on(
      'showTips',
      (key: string) => {
        if (!key) return;

        const lan = gi.getLanguage() || 'default';
        const levelInfo = gi.getLevelInfo();
        const item = levelInfo.tipsMap.find(item => item.key === key)[lan];

        if (item) {
          this.node.stopAllActions();
          (cc.tween(this.node) as cc.Tween)
            .to(0.07, { opacity: 0 })
            .call(() => {
              this.text.string = item;
            })
            .to(0.2, { opacity: 255 })
            .delay(2)
            .to(0.2, { opacity: 0 })
            .start();
        }
      },
      this
    );
  }
}
