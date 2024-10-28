import ResAreaControl from './resAreaControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResControl extends cc.Component {
  @property({ type: [cc.Integer], tooltip: '该资源的类型，需要包含想要触发的触发器的tags中的某个元素，即两个tags需要有交集才能触发' })
  tags: number[] = [0];

  @property({ tooltip: '选中该资源时是否直接使用而不是随机选取' })
  unique: boolean = false;

  /** 是否可以重复使用 */
  @property({ tooltip: '是否可以重复使用' })
  isRepeatUse: boolean = false;

  @property({ tooltip: '在相同tag下该资源的优先级', step: 1 })
  siblingIndex: number = 0;

  onLoad() {
    this.initRes();
  }

  initRes() {
    gi.Event.emit('initRes', this.node);

    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onTouchStart(event: cc.Event.EventTouch) {
    const res = this.node.getComponent(ResControl);
    gi.Event.emit('touchStartRes', { event, res });
    event.stopPropagation();
  }

  onTouchMove(event: cc.Event.EventTouch) {
    gi.Event.emit('touchMoveRes', event);
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    gi.Event.emit('touchEndRes', event);
    event.stopPropagation();
  }
}
