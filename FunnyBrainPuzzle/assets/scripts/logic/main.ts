import ResAreaControl from './resAreaControl';
import TriggerControl from './triggerControl';
import SubscriptionControl from './subscriptions/subscriptionControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  /** 资源根节点 */
  @property({ type: ResAreaControl, tooltip: '资源根节点' })
  resArea: ResAreaControl = null;

  /** 所有触发器根节点 */
  @property({ type: [cc.Node], tooltip: '所有触发器根节点' })
  triggerRootNodes: cc.Node[] = [];

  /** 升级次数 */
  @property({ type: cc.Integer, tooltip: '升级次数，满足后游戏结束' })
  upgradeCount: number = 0;

  onLoad() {
    this.initGame();
  }

  initGame() {
    cc.director.getCollisionManager().enabled = true;
    // cc.director.getCollisionManager().enabledDebugDraw = true;
    // cc.director.getCollisionManager().enabledDrawBoundingBox = true;

    this.resArea.init();

    new SubscriptionControl(0);
    gi.Event.on('touchEnd', this.onTouchEnd, this);
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    const trigger = this.getTrigger(event.getLocation());

    if (trigger && trigger.canUpgrade()) {
      trigger.upgrade();
      this.upgradeCount--;
      this.resArea.decRes();
      this.inspectGameOver();
    } else {
      this.resArea.cancleCurRes();
    }
  }

  inspectGameOver() {
    if (this.upgradeCount === 0) {
      console.log('游戏结束');
    }
  }

  /** 获取点触发了哪个触发器 */
  getTrigger(pos: cc.Vec2) {
    let trigger: TriggerControl;

    for (const rootNode of this.triggerRootNodes) {
      if (trigger) break;

      for (const node of rootNode.children) {
        if (node.getComponent(TriggerControl).isHit(pos)) {
          trigger = node.getComponent(TriggerControl);
          break;
        }
      }
    }

    return trigger;
  }
}
