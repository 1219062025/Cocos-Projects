import ResControl from '../res/resControl';
import TriggerOffCbComponent from '../triggerOffCbs/triggerOffCbComponent';

const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.BoxCollider)
export default class TriggerControl extends cc.Component {
  /** 关键词 */
  @property({ tooltip: '触发器运行时展示Tips的关键词' })
  key: string = '';

  /** 触发器引导的关键词 */
  @property({ tooltip: '触发器引导的关键词' })
  guideKey: string = '';

  /** 触发器的优先级，触发时先触发优先级高的触发器 */
  @property({ tooltip: '触发器的优先级，触发时先触发优先级高的触发器' })
  siblingIndex: number = 0;

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

  /** 是否可以重复触发 */
  @property({ tooltip: '是否可以重复触发' })
  isRepeatTriggerOff: boolean = false;

  /** 该触发器能被触发的资源的类型 */
  @property({ type: [cc.Integer], tooltip: '该触发器能被触发的资源的类型' })
  tags: number[] = [];

  /** 碰撞器 */
  collider: cc.BoxCollider = null;

  /** 是否已经触发过了 */
  isTriggerOff: boolean = false;

  onLoad() {
    gi.Event.emit('initTrigger', this.node);

    this.collider = this.node.getComponent(cc.BoxCollider);
    if (!this.collider) throw new Error(`碰撞器不得为空，节点uuid：${this.node.uuid}`);
    if (!this.tags.length) this.tags.push(this.collider.tag);
  }

  /** 是否可以运行触发器 */
  canTriggerOff(tags?: number[]) {
    if (this.isTriggerOff && !this.isRepeatTriggerOff) return false;

    return gi.Utils.hasIntersection(this.tags, tags);
  }

  /** 运行触发器 */
  triggerOff(res: ResControl) {
    if (this.isTriggerOff && !this.isRepeatTriggerOff) return;

    const cbComponent = this.node.getComponent(TriggerOffCbComponent);

    if (cbComponent) cbComponent.run(res, this);

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

    gi.completedAction(this.guideKey || this.key);
    this.isTriggerOff = true;
  }

  /** 展示提示 */
  showTips() {
    if (!this.key) return;
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
