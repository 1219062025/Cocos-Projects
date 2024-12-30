import ResAreaControl from "./res/resAreaControl";
import GuideManager from "./guide/guideManager";
import TriggerControl from "./trigger/triggerControl";
import SubscriptionControl from "./subscriptions/subscriptionControl";
import TriggerOffCbManager from "./triggerOffCbs/triggerOffCbManager";
import TriggerManager from "./trigger/triggerManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  /** 当前几关 */
  @property({ type: cc.Integer, tooltip: "该场景是第几关" })
  levle: number = 1;

  /** 目标得分 */
  @property({ type: cc.Integer, tooltip: "目标得分" })
  targetScore: number = 0;

  /** 最大扣分数 */
  @property({ type: cc.Integer, tooltip: "最大扣分数，如果关卡不需要扣分填0" })
  targetDeductScore: number = 0;

  /** 通关限时/s */
  @property({ type: cc.Integer, tooltip: "通关限时/s" })
  limitedTime: number = 60;

  /** 无响应限时/s */
  @property({ type: cc.Integer, tooltip: "无响应限时/s" })
  responseTime: number = 15;

  @property({ tooltip: "该关卡是否运行引导" })
  isRunGuide: boolean = true;

  @property({ tooltip: "一步点击跳转商店" })
  isClickToShop: boolean = false;

  /** 标题Label */
  @property({ type: cc.Label, tooltip: "标题Label" })
  titleLabel: cc.Label = null;

  /** 资源控制脚本 */
  @property({ type: ResAreaControl, tooltip: "资源控制脚本" })
  resArea: ResAreaControl = null;

  // /** 所有触发器根节点 */
  // @property({ type: cc.Node, tooltip: '触发器根节点' })
  // triggerRootNode: cc.Node = null;

  /** 触发器控制脚本 */
  @property({ type: TriggerManager, tooltip: "触发器控制脚本" })
  triggerManager: TriggerManager = null;

  /** 提示控制脚本 */
  @property({ type: cc.Node, tooltip: "提示控制脚本" })
  tipsNode: cc.Node = null;

  /** 引导控制脚本 */
  @property({ type: GuideManager, tooltip: "引导控制脚本" })
  guideMgr: GuideManager = null;

  /** 成功通关弹窗 */
  @property({ type: cc.Node, tooltip: "成功通关弹窗" })
  successPop: cc.Node = null;

  /** 通关失败弹窗 */
  @property({ type: cc.Node, tooltip: "通关失败弹窗" })
  failPop: cc.Node = null;

  /** 操作响应，每次调用都会重置无响应计时responseTime */
  responseFunc: Function = null;

  /** 音频管理 */
  audioSource: cc.AudioSource = null;

  onLoad() {
    gi.loadGameRes().then(() => {
      this.initGame();
    });
  }

  initGame() {
    // 设置当前关卡
    gi.setLevel(this.levle);

    // gi.playBgm();

    // 开启2d碰撞系统
    cc.director.getCollisionManager().enabled = true;

    // 设置标题
    const lan = gi.getLanguage();
    const title = gi.getLevelInfo().title;
    this.titleLabel.string = title[lan] || title["default"];

    // 初始化资源
    // this.resArea.init();
    // 在资源初始化之后初始化引导
    if (this.isRunGuide) {
      this.guideMgr.init();
    }

    if (this.isClickToShop) {
      const canvas = cc.Canvas.instance.node;
      const mask = new cc.Node("MASK");
      const widget = mask.addComponent(cc.Widget);
      widget.alignMode = cc.Widget.AlignMode.ALWAYS;
      widget.isAbsoluteTop = true;
      widget.isAbsoluteBottom = true;
      widget.isAbsoluteLeft = true;
      widget.isAbsoluteRight = true;
      widget.top = 0;
      widget.bottom = 0;
      widget.left = 0;
      widget.right = 0;
      mask.setContentSize(cc.winSize);

      gi.Event.on("view-resize", () => {
        mask.setContentSize(cc.winSize);
        widget.updateAlignment();
      });

      mask.on(
        cc.Node.EventType.TOUCH_END,
        () => {
          //@ts-ignore
          linkToStore();
        },
        this
      );
      canvas.addChild(mask, 10);
    }

    // 订阅动作
    new SubscriptionControl(this.levle);
    TriggerOffCbManager.instance.init(this.levle);

    // 监听事件
    cc.Canvas.instance.node.on(
      cc.Node.EventType.TOUCH_START,
      this.onAction,
      this
    );
    gi.Event.on("touchStart", this.onAction, this);
    gi.Event.on("touchMove", this.onAction, this);
    gi.Event.on("touchEnd", this.onTouchEnd, this);
    gi.Event.on("setLanguage", (lan: string) => {
      const title = gi.getLevelInfo().title;
      this.titleLabel.string = title[lan] || title["default"];
    });
    /** 监听得分 */
    gi.Event.on("score", this.inspectScore, this);
    /** 监听扣分 */
    gi.Event.on("deductScore", this.inspectDeductScore, this);
    /** 监听所有资源用完 */
    // gi.Event.on('notHaveRes', this.inspectGameOver, this);
    /** 监听游戏失败事件 */
    gi.Event.on("gameover", this.showFailPop, this);
    /** 监听游戏成功事件 */
    gi.Event.on("clearance", this.showSuccessPop, this);

    this.runTimeDetection();
  }

  /** 运行时间检测 */
  runTimeDetection() {
    // 限时limitedTime完成，否则弹出通关失败弹窗
    this.schedule(() => {
      if (this.limitedTime === 0 && !gi.isEnd()) {
        this.showFailPop();
      } else {
        this.limitedTime--;
      }
    }, 1);

    // 超过responseTime无响应弹出通关失败弹窗
    this.responseFunc = gi.Utils.debounce(() => {
      if (!gi.isEnd()) {
        this.showFailPop();
      }
    }, this.responseTime * 1000);

    // this.responseFunc();
  }

  /** 监听用户操作并重置无响应限时的计时 */
  onAction() {
    this.responseFunc && this.responseFunc();
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    const triggers = this.getTriggers(event.getLocation());

    if (!triggers.length) return this.resArea.cancleCurRes();

    const tags = this.resArea.curRes.tags;

    for (const trigger of triggers) {
      if (trigger.canTriggerOff(tags)) {
        // 触发音效
        gi.playAudio();
        // 运行触发器
        trigger.showTips();
        trigger.triggerOff(this.resArea.curRes);
        if (!this.resArea.curRes.isRepeatUse) {
          this.resArea.destroyCurRes();
        } else {
          this.resArea.cancleCurRes();
        }
        return;
      }
    }
    this.resArea.cancleCurRes();
  }

  /** 展示通关成功弹窗，结束游戏 */
  showSuccessPop() {
    if (gi.isEnd()) return;

    this.successPop.active = true;
    (cc.tween(this.successPop) as cc.Tween).to(1, { opacity: 255 }).start();
    gi.end();
    return this.unscheduleAllCallbacks();
  }

  /** 展示通关失败弹窗，结束游戏 */
  showFailPop() {
    if (gi.isEnd()) return;

    this.failPop.active = true;
    (cc.tween(this.failPop) as cc.Tween).to(1, { opacity: 255 }).start();
    gi.end();
    return this.unscheduleAllCallbacks();
  }

  /** 检测得分是否足够是否通关 */
  inspectScore(score: number) {
    if (gi.isEnd()) return;

    gi.score += score;
    if (this.targetScore === gi.score) {
      this.showSuccessPop();
    }
  }

  /** 检测扣分是否已经等于最大扣分数 */
  inspectDeductScore(deductScore: number) {
    if (gi.isEnd()) return;

    gi.deductScore += deductScore;
    if (
      this.targetDeductScore !== 0 &&
      this.targetDeductScore === gi.deductScore
    ) {
      this.showFailPop();
    }
  }

  /** 检测游戏是否通关 */
  inspectGameOver() {
    console.log("inspectGameOver", gi.score);
    if (gi.isEnd()) return;

    if (
      this.targetDeductScore !== 0 &&
      this.targetDeductScore === gi.deductScore
    ) {
      this.showFailPop();
    } else if (this.targetScore === gi.score) {
      this.showSuccessPop();
    } else {
      this.showFailPop();
    }
  }

  /** 获取位置pos处于哪些触发器的触发范围内 */
  getTriggers(pos: cc.Vec2) {
    const triggers: TriggerControl[] = [];
    let _trigger: TriggerControl;

    for (const node of this.triggerManager.children) {
      if (!cc.isValid(node) || node.active === false) continue;

      const trigger = node.getComponent(TriggerControl);

      if (trigger && trigger.isHit(pos)) {
        _trigger = trigger;
        triggers.push(trigger);
      }
    }

    return triggers;
  }
}
