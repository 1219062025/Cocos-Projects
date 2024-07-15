import ResAreaControl from './res/resAreaControl';
import ResControl from './res/resControl';
import TriggerControl from './triggerControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideControl extends cc.Component {
  /** 引导文本区域节点 */
  @property({ type: cc.Node, tooltip: '引导文本区域节点' })
  guideTextNode: cc.Node = null;

  /** 引导文本 */
  @property({ type: cc.Label, tooltip: '引导文本' })
  guideText: cc.Label = null;

  /** 引导手指 */
  @property({ type: cc.Node, tooltip: '引导手指' })
  guideIcon: cc.Node = null;

  /** 所有触发器根节点 */
  @property({ type: cc.Node, tooltip: '触发器根节点' })
  triggerRootNode: cc.Node = null;

  /** 资源控制脚本 */
  @property({ type: ResAreaControl, tooltip: '资源控制脚本' })
  resArea: ResAreaControl = null;

  init() {
    this.run();
    gi.Event.on('touchStart', this.onTouchStart, this);
    gi.Event.on('touchEnd', this.onTouchEnd, this);
    gi.Event.on('gameover', this.onGameOver, this);
  }

  onTouchStart(event: cc.Event.EventTouch) {
    this.guideIcon.stopAllActions();
    this.guideTextNode.stopAllActions();
    this.guideIcon.active = false;
    this.guideTextNode.active = false;
    this.stopTiming();
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    this.onTiming();
  }

  /** 监听游戏结束 */
  onGameOver() {
    this.stopTiming();
  }

  onTiming() {
    this.scheduleOnce(this.run, 5);
  }

  stopTiming() {
    this.unschedule(this.run);
  }

  /** 运行引导 */
  run() {
    const resNode = this.resArea.getRandomEffectiveResNode();

    if (!resNode) return;

    const res = resNode.getComponent(ResControl);
    const trigger = this.getEffectiveTrigger(res);

    if (!trigger) return;

    const key = trigger.key;
    const lan = gi.getLanguage() || 'default';
    const levelInfo = gi.getLevelInfo();

    const text = levelInfo.guideMap.find(item => item.key === key)[lan];

    if (!text) return;

    this.guideTextNode.stopAllActions();
    (cc.tween(this.guideTextNode) as cc.Tween)
      .call(() => {
        this.guideTextNode.opacity = 0;
        this.guideTextNode.active = true;
        this.guideText.string = text;
      })
      .to(0.2, { opacity: 255 })
      .start();

    this.guideIcon.stopAllActions();
    this.guideIcon.active = true;
    const copyNode = cc.instantiate(resNode);
    gi.Guide.fromToNode(resNode, trigger.node, { time: 2, guide: this.guideIcon, node: copyNode }).union().repeatForever().start();
  }

  /** 得到一个场上还可以触发升级的触发器 */
  getEffectiveTrigger(res: ResControl) {
    let limitedCount = 100;
    while (limitedCount) {
      const randomIndex = Math.floor(Math.random() * this.triggerRootNode.childrenCount);
      const trigger = this.triggerRootNode.children[randomIndex].getComponent(TriggerControl);
      if (trigger.node.active && trigger.key && trigger.canTriggerOff(res.tag)) return trigger;
      limitedCount--;
    }
  }
}
