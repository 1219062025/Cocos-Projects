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
        const tipsInfo = gi.getLevelInfo().tipsMap.find(item => item.key === key);

        if (!tipsInfo || !tipsInfo[lan]) return;

        this.node.stopAllActions();
        (cc.tween(this.node) as cc.Tween)
          .to(0.07, { opacity: 0 })
          .call(() => {
            this.text.string = tipsInfo[lan];
          })
          .to(0.2, { opacity: 255 })
          .delay(2)
          .to(0.2, { opacity: 0 })
          .start();
      },
      this
    );
  }
}
