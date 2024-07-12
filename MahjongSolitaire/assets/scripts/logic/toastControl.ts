const { ccclass, property } = cc._decorator;

@ccclass
export default class ToastControl extends cc.Component {
  onLoad() {
    gi.Event.on('toast', this.onToast, this);
  }

  onToast(node: cc.Node) {
    const canvas = cc.Canvas.instance.node;
    const pos = canvas.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v2(0, 0)));
    this.node.stopAllActions();
    (cc.tween(this.node) as cc.Tween)
      .to(0.01, { opacity: 0 })
      .call(() => {
        if (pos.x - this.node.width / 2 < -canvas.width / 2) {
          pos.x = -canvas.width / 2 + this.node.width / 2;
        }

        if (pos.x + this.node.width / 2 > canvas.width / 2) {
          pos.x = canvas.width / 2 - this.node.width / 2;
        }
        this.node.setPosition(cc.v2(pos.x, pos.y + 100));
        this.node.opacity = 255;
      })
      .by(0.8, { position: cc.v2(0, 50) })
      .to(0.1, { opacity: 0 })
      .start();
  }
}
