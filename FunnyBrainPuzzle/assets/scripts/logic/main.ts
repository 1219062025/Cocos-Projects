import ResAreaControl from './res/resAreaControl';
import GuideControl from './guideControl';
import TriggerControl from './triggerControl';
import SubscriptionControl from './subscriptions/subscriptionControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  /** 当前几关 */
  @property({ type: cc.Integer, tooltip: '该场景是第几关' })
  levle: number = 1;

  /** 目标得分 */
  @property({ type: cc.Integer, tooltip: '目标得分' })
  targetScore: number = 0;

  /** 通关限时/s */
  @property({ type: cc.Integer, tooltip: '通关限时/s' })
  limitedTime: number = 60;

  /** 无响应限时/s */
  @property({ type: cc.Integer, tooltip: '无响应限时/s' })
  responseTime: number = 15;

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

  /** 引导控制脚本 */
  @property({ type: GuideControl, tooltip: '引导控制脚本' })
  guide: GuideControl = null;

  /** 成功通关弹窗 */
  @property({ type: cc.Node, tooltip: '成功通关弹窗' })
  successPop: cc.Node = null;

  /** 通关失败弹窗 */
  @property({ type: cc.Node, tooltip: '通关失败弹窗' })
  failPop: cc.Node = null;

  /** 操作响应，每次调用都会重置无响应计时responseTime */
  responseFunc: Function = null;

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
    // 在资源初始化之后初始化引导
    this.guide.init();

    // 订阅动作
    new SubscriptionControl(this.levle);

    // 监听事件
    gi.Event.on('touchStart', this.onAction, this);
    gi.Event.on('touchMove', this.onAction, this);
    gi.Event.on('touchEnd', this.onTouchEnd, this);
    gi.Event.on('setLanguage', (lan: string) => {
      const title = gi.getLevelInfo().title;
      this.titleLabel.string = title[lan] || title['default'];
    });
    /** 监听得分 */
    gi.Event.on(
      'score',
      (score: number) => {
        gi.score += score;
      },
      this
    );
    /** 监听所有资源用完 */
    gi.Event.on('notHaveRes', this.inspectGameOver, this);

    this.runTimeDetection();
  }

  /** 运行时间检测 */
  runTimeDetection() {
    // 限时limitedTime
    this.schedule(() => {
      if (this.limitedTime === 0 && !gi.isEnd()) {
        this.failPop.active = true;
        (cc.tween(this.failPop) as cc.Tween).to(1, { opacity: 255 }).start();
        gi.Event.emit('通关失败');
        gi.end();
        return this.unscheduleAllCallbacks();
      } else {
        this.limitedTime--;
      }
    }, 1);

    this.responseFunc = gi.Utils.debounce(() => {
      if (!gi.isEnd()) {
        this.failPop.active = true;
        (cc.tween(this.failPop) as cc.Tween).to(1, { opacity: 255 }).start();
        gi.Event.emit('通关失败');
        gi.end();
        return this.unscheduleAllCallbacks();
      }
    }, this.responseTime * 1000);

    this.responseFunc();
  }

  /** 监听用户操作并重置无响应限时的计时 */
  onAction() {
    this.responseFunc && this.responseFunc();
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    const trigger = this.getTrigger(event.getLocation());

    if (!trigger) return this.resArea.cancleCurRes();

    const tag = this.resArea.curRes.tag;
    if (trigger.canTriggerOff(tag)) {
      // 运行触发器
      trigger.showTips();
      trigger.triggerOff();
      this.resArea.destroyCurRes();
    } else {
      this.resArea.cancleCurRes();
    }
  }

  /** 检测游戏是否通关 */
  inspectGameOver() {
    if (this.targetScore === gi.score) {
      this.successPop.active = true;
      (cc.tween(this.successPop) as cc.Tween).to(1, { opacity: 255 }).start();
      gi.Event.emit('成功通关');
      gi.end();
      return this.unscheduleAllCallbacks();
    } else {
      this.failPop.active = true;
      (cc.tween(this.failPop) as cc.Tween).to(1, { opacity: 255 }).start();
      gi.Event.emit('通关失败');
      gi.end();
      return this.unscheduleAllCallbacks();
    }
  }

  /** 获取位置pos处于哪个触发器的触发范围内 */
  getTrigger(pos: cc.Vec2) {
    let _trigger: TriggerControl;

    for (const node of this.triggerRootNode.children) {
      if (node.active === false) continue;

      const trigger = node.getComponent(TriggerControl);

      if (trigger && trigger.isHit(pos)) {
        _trigger = trigger;
        break;
      }
    }

    return _trigger;
  }
}
