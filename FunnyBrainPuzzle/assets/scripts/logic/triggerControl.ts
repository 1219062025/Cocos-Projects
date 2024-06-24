import TriggerGroup from './triggerGroup';

const { ccclass, property, requireComponent } = cc._decorator;

/**
 * 挂载触发器组脚本TriggerGroup时需要设置level级别以及与该级别关联的sprite，每次升级都会展示与之级别相关联的sprite；
 * 挂载碰撞器组件BoxCollider需要设置tag的值，tag值与该碰撞器想要触发的那个触发器TriggerGroup的level相同
 */
@ccclass
@requireComponent(TriggerGroup)
@requireComponent(cc.BoxCollider)
export default class TriggerControl extends cc.Component {
  /** 触发器组 */
  groups: TriggerGroup[] = [];

  /** 碰撞器组 */
  colliders: cc.BoxCollider[] = [];

  /** 该触发器最大等级 */
  maxLevel: number = 0;

  /** 触发器当前等级 */
  level: number = 0;

  onLoad() {
    this.groups = this.node.getComponents(TriggerGroup);
    this.colliders = this.node.getComponents(cc.BoxCollider);

    if (!this.groups.length || !this.colliders.length) throw new Error(`组件触发器组或者碰撞器组不得为空，节点uuid：${this.node.uuid}`);

    this.maxLevel = this.groups.length - 1;
  }

  /** 是否可以升级 */
  canUpgrade() {
    return this.level < this.maxLevel;
  }

  /** 升级 */
  upgrade() {
    const curLevel = this.level;
    const curGroup = this.groups.find(group => group.level === curLevel);
    for (const node of curGroup.nodes) {
      node.active = false;
    }
    const nextLevel = ++this.level;
    const nextGroup = this.groups.find(group => group.level === nextLevel);
    for (const node of nextGroup.nodes) {
      node.active = true;
    }
  }

  /** 坐标点是否触发了该触发器 */
  isHit(pos: cc.Vec2) {
    if (this.node.active) {
      for (const collider of this.colliders) {
        if (collider.tag !== this.level) continue;
        // @ts-ignore
        if (cc.Intersection.pointInPolygon(pos, collider.world.points)) {
          return true;
        }
      }
    }
  }
}
