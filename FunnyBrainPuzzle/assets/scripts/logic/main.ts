import ResAreaControl from './resAreaControl';
import TriggerControl from './triggerControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  /** 资源根节点 */
  @property({ type: ResAreaControl, tooltip: '资源根节点' })
  resArea: ResAreaControl = null;

  /** 所有触发器根节点 */
  @property({ type: [cc.Node], tooltip: '所有触发器根节点' })
  triggerNodes: cc.Node[] = [];

  onLoad() {
    this.initGame();
  }

  initGame() {
    cc.director.getCollisionManager().enabled = true;
    // cc.director.getCollisionManager().enabledDebugDraw = true;
    // cc.director.getCollisionManager().enabledDrawBoundingBox = true;

    this.resArea.init();

    gi.Event.on('touchEnd', this.onTouchEnd, this);
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    const trigger = this.getTrigger(event.getLocation());

    if (trigger && trigger.canUpgrade()) {
      trigger.upgrade();
    } else {
      this.resArea.cancleCurRes();
    }
  }

  getTrigger(pos: cc.Vec2) {
    let trigger: TriggerControl;

    for (const triggerNode of this.triggerNodes) {
      if (trigger) break;

      for (const node of triggerNode.children) {
        if (node.active) {
          const box = node.getComponent(cc.BoxCollider) as cc.Collider;
          // @ts-ignore
          if (cc.Intersection.pointInPolygon(pos, box.world.points)) {
            trigger = node.getComponent(TriggerControl);
            break;
          }
        }
      }
    }

    return trigger;
  }
}
