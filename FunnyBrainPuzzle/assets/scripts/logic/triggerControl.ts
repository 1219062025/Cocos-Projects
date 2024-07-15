const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.BoxCollider)
export default class TriggerControl extends cc.Component {
  /** 关键词 */
  @property({ tooltip: '触发器运行时展示Tips的关键词' })
  key: string = '';

  /** 该组触发器关联的需要隐藏的图片节点 */
  @property({ type: [cc.Node], tooltip: '该组触发器关联的需要隐藏的图片节点' })
  hiddenNodes: cc.Node[] = [];

  /** 该组触发器关联的需要显示的图片节点 */
  @property({ type: [cc.Node], tooltip: '该组触发器关联的需要显示的图片节点' })
  displayNodes: cc.Node[] = [];

  /** 得分数 */
  @property({ tooltip: '得分数，如果不用得分设为0' })
  score: number = 1;

  /** 扣分数 */
  @property({ tooltip: '扣分数，如果不用扣分设为0' })
  deductScore: number = 0;

  /** 碰撞器 */
  collider: cc.BoxCollider = null;

  /** 是否已经触发过了 */
  isTriggerOff: boolean = false;

  onLoad() {
    this.collider = this.node.getComponent(cc.BoxCollider);
    if (!this.collider) throw new Error(`碰撞器不得为空，节点uuid：${this.node.uuid}`);
  }

  /** 是否可以运行触发器 */
  canTriggerOff(tag?: number) {
    const isMatchTag = this.collider.tag !== undefined ? this.collider.tag === tag : true;
    return isMatchTag && this.isTriggerOff !== true;
  }

  /** 运行触发器 */
  triggerOff() {
    if (this.isTriggerOff) return;

    for (const node of this.hiddenNodes) {
      node.active = false;
    }

    for (const node of this.displayNodes) {
      node.active = true;
    }

    if (this.score) {
      gi.Event.emit('score', this.score);
    }

    if (this.deductScore) {
      gi.Event.emit('deductScore', this.deductScore);
    }

    this.isTriggerOff = true;
  }

  /** 展示提示 */
  showTips() {
    gi.Event.emit('showTips', this.key);
  }

  /** 坐标点是否处于该触发器的触发范围 */
  isHit(pos: cc.Vec2) {
    if (this.node.active) {
      // @ts-ignore
      if (cc.Intersection.pointInPolygon(pos, this.collider.world.points)) {
        return true;
      }
    }
  }
}
