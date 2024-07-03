import ResAreaControl from './resAreaControl';
import TriggerControl from './triggerControl';
import SubscriptionControl from './subscriptions/subscriptionControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  /** 当前几关 */
  @property({ type: cc.Integer, tooltip: '该场景是第几关' })
  levle: number = 1;

  /** 剩余升级次数 */
  @property({ type: cc.Integer, tooltip: '剩余升级次数，为0时游戏结束' })
  upgradeTimes: number = 0;

  /** 标题Label */
  @property({ type: cc.Label, tooltip: '标题Label' })
  titleLabel: cc.Label = null;

  /** 资源控制脚本 */
  @property({ type: ResAreaControl, tooltip: '资源控制脚本' })
  resArea: ResAreaControl = null;

  /** 所有触发器根节点 */
  @property({ type: cc.Node, tooltip: '触发器根节点' })
  triggerRootNode: cc.Node = null;

  /** 提示控制脚本 */
  @property({ type: cc.Node, tooltip: '提示控制脚本' })
  tipsNode: cc.Node = null;

  /** 结束弹窗节点 */
  @property({ type: cc.Node, tooltip: '结束弹窗' })
  pop: cc.Node = null;

  onLoad() {
    gi.loadGameRes().then(() => {
      this.initGame();
    });
  }

  initGame() {
    // 设置当前关卡
    gi.setLevel(this.levle);

    // 开启2d碰撞系统
    cc.director.getCollisionManager().enabled = true;

    // 设置标题
    const lan = gi.getLanguage();
    const title = gi.getLevelInfo().title;
    this.titleLabel.string = title[lan] || title['default'];

    // 初始化资源
    this.resArea.init();

    // 订阅动作
    new SubscriptionControl(0);

    // 监听事件
    gi.Event.on('touchEnd', this.onTouchEnd, this);
    gi.Event.on('setLanguage', (lan: string) => {
      const title = gi.getLevelInfo().title;
      this.titleLabel.string = title[lan] || title['default'];
    });
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    const trigger = this.getTrigger(event.getLocation());

    if (!trigger) return this.resArea.cancleCurRes();

    // 处理展示提示
    if (trigger.canShowTips()) {
      trigger.showTips();
    }

    // 处理升级
    if (trigger.canUpgrade()) {
      trigger.upgrade();
      this.upgradeTimes--;
      this.resArea.destroyCurRes();
      this.inspectGameOver();
    }

    this.resArea.cancleCurRes();
  }

  inspectGameOver() {
    if (this.upgradeTimes === 0) {
      this.pop.active = true;
      (cc.tween(this.pop) as cc.Tween).to(1, { opacity: 255 }).start();
    }
  }

  /** 获取点触发了哪个触发器 */
  getTrigger(pos: cc.Vec2) {
    let _trigger: TriggerControl;

    for (const node of this.triggerRootNode.children) {
      const trigger = node.getComponent(TriggerControl);
      if (trigger && trigger.isHit(pos)) {
        _trigger = trigger;
        break;
      }
    }

    return _trigger;
  }

  test() {
    const a = new Set([]);
  }
}
