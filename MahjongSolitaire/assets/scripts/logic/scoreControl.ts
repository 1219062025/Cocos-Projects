const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  /** 得分数字预制体 */
  @property({ type: cc.Prefab, tooltip: '得分数字预制体' })
  scorePrefab: cc.Prefab = null;

  onLoad() {
    gi.Event.on('score', this.onScore, this);
    gi.Pool.createPool('score', 3, this.scorePrefab);
  }

  onScore(pos: cc.Vec2) {
    const canvas = cc.Canvas.instance.node;
    const scoreNode = gi.Pool.poolGet('score');
    const label = scoreNode.getComponent(cc.Label);
    label.string = '+182';
    pos = canvas.convertToNodeSpaceAR(pos);

    (cc.tween(scoreNode) as cc.Tween)
      .call(() => {
        scoreNode.setPosition(cc.v2(pos.x, pos.y + 100));
        scoreNode.setParent(canvas);
      })
      .to(0.1, { opacity: 255 })
      .by(0.8, { position: cc.v2(0, 50) })
      .to(0.1, { opacity: 0 })
      .call(() => {
        gi.Pool.poolPut('score', scoreNode);
      })
      .start();
  }
}
