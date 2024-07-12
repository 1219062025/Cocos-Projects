import Counter from '../commonScripts/Counter';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScoreControl extends cc.Component {
  /** 得分跳出数字预制体 */
  @property({ type: cc.Prefab, tooltip: '得分跳出数字预制体' })
  scoreNumberPrefab: cc.Prefab = null;

  /** 得分的Label组件 */
  @property({ type: cc.Label, tooltip: '得分的Label组件' })
  scoreLabel: cc.Label = null;

  onLoad() {
    gi.Event.on('score', this.onScore, this);
    gi.Pool.createPool('score', 3, this.scoreNumberPrefab);
  }

  onScore(pos: cc.Vec2) {
    const canvas = cc.Canvas.instance.node;
    const scoreNode = gi.Pool.poolGet('score') || cc.instantiate(this.scoreNumberPrefab);
    const label = scoreNode.getComponent(cc.Label);
    const score = Math.floor(Math.random() * 100 + 50);
    label.string = `+${score}`;
    gi.score += score;

    this.scoreLabel.node.getComponent(Counter).to(gi.score);

    pos = canvas.convertToNodeSpaceAR(pos);

    (cc.tween(scoreNode) as cc.Tween)
      .call(() => {
        scoreNode.opacity = 255;
        scoreNode.scale = 0;
        scoreNode.setPosition(cc.v2(pos.x, pos.y + 100));
        scoreNode.setParent(canvas);
      })
      .to(0.1, { scale: 1.4 })
      .to(0.1, { scale: 1 })
      .by(1.2, { position: cc.v2(0, 100) })
      .to(0.1, { opacity: 0 })
      .call(() => {
        gi.Pool.poolPut('score', scoreNode);
      })
      .start();
  }
}
