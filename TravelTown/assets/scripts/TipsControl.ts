const { ccclass, property } = cc._decorator;

@ccclass
export default class TipsControl extends cc.Component {
  Init(position: cc.Vec2) {
    const TipsLabel = ['great', 'nice', 'perfect', 'super'];
    const ShadowNode = this.node.getChildByName('shadow');
    const TipsNode = this.node.getChildByName('tips');
    const Label = Math.floor(Math.random() * 3 + 1);
    cc.loader.loadRes(`${TipsLabel[Label]}`, cc.SpriteFrame, (err, res) => {
      if (err) return;
      TipsNode.getComponent(cc.Sprite).spriteFrame = res;
      ShadowNode.getComponent(cc.Sprite).spriteFrame = res;
      cc.tween(this.node)
        .call(() => {
          this.node.setPosition(position.add(cc.v2(0, 50)));
          this.node.zIndex = 900;
          this.node.setScale(0.4);
        })
        .by(0.7, { position: cc.v2(0, 50), scale: 0.2 }, { easing: 'elasticOut' })
        .to(0.2, { scale: 0 })
        .to(0.2, { opacity: 0 })
        .call(() => {
          this.node.destroy();
        })
        .start();
    });
  }
}
