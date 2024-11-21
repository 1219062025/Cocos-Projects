import ResAreaControl from "../res/resAreaControl";
import ResControl from "../res/resControl";
import TriggerControl from "../trigger/triggerControl";
import TriggerManager from "../trigger/triggerManager";
import GuideControl from "./guideControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideManager extends cc.Component {
  /** 引导文本区域节点 */
  @property({ type: cc.Node, tooltip: "引导文本区域节点" })
  guideTextNode: cc.Node = null;

  /** 引导文本 */
  @property({ type: cc.Label, tooltip: "引导文本" })
  guideText: cc.Label = null;

  /** 引导手指 */
  @property({ type: cc.Node, tooltip: "引导手指" })
  guideIcon: cc.Node = null;

  // /** 所有触发器根节点 */
  // @property({ type: cc.Node, tooltip: '触发器根节点' })
  // triggerRootNode: cc.Node = null;

  /** 触发器控制脚本 */
  @property({ type: cc.Node, tooltip: "触发器控制脚本" })
  triggerManager: TriggerManager = null;

  /** 所有引导器根节点 */
  @property({ type: cc.Node, tooltip: "引导器根节点" })
  guideRootNode: cc.Node = null;

  /** 资源控制脚本 */
  @property({ type: ResAreaControl, tooltip: "资源控制脚本" })
  resArea: ResAreaControl = null;

  /** 引导动作映射 */
  guideActionMap: Map<string, Function> = new Map([]);

  init() {
    this.run();

    gi.Event.on("touchStart", this.onTouchStart, this);
    gi.Event.on(
      "completedAction",
      () => {
        this.hiddenGuideIcon();
        this.onTiming();
      },
      this
    );
    gi.Event.on("touchEnd", this.onTiming, this);
    gi.Event.on("gameover", this.stopTiming, this);
  }

  onTouchStart(event: cc.Event.EventTouch) {
    this.hiddenGuideIcon();
    this.stopTiming();
  }

  onTiming() {
    this.unschedule(this.run);
    this.scheduleOnce(this.run, 6);
  }

  stopTiming() {
    this.unschedule(this.run);
  }

  /** 显示引导文本 */
  showGuideText(guide: GuideControl) {
    const lan = gi.getLanguage() || "default";
    const guideInfo = gi
      .getLevelInfo()
      .guideMap.find((item) => item.key === guide.key);
    if (!guideInfo || !guideInfo[lan]) return;

    this.guideTextNode.stopAllActions();
    (cc.tween(this.guideTextNode) as cc.Tween)
      .call(() => {
        this.guideTextNode.opacity = 0;
        this.guideTextNode.active = true;
        this.guideText.string = guideInfo[lan];
      })
      .to(0.2, { opacity: 255 })
      .start();
  }

  /** 运行引导 */
  run() {
    const guideNodes = this.guideRootNode.children;

    if (!guideNodes.length) return;

    for (const guideNode of guideNodes) {
      // 如果引导器不活动的话不执行
      if (!guideNode.active) continue;

      const guide = guideNode.getComponent(GuideControl);

      // 如果引导器需要引导的动作已经操作过了的话不执行
      if (gi.finishedActionKeys.has(guide.actionKey)) continue;

      // 如果不是文本引导器时目标节点不活动的话不执行
      if (guide.type !== gi.Guide.Type.Text && !guide.targetNode.active)
        continue;

      switch (guide.type) {
        case gi.Guide.Type.Drag:
          this.drag(guide);
          break;
        case gi.Guide.Type.Click:
          this.click(guide);
          break;
        case gi.Guide.Type.UP:
          this.swipe(guide);
          break;
        case gi.Guide.Type.Down:
          this.swipe(guide);
          break;
        case gi.Guide.Type.Left:
          this.swipe(guide);
          break;
        case gi.Guide.Type.Right:
          this.swipe(guide);
          break;
        default:
          break;
      }

      break;
    }
  }

  /** 拖动引导 */
  drag(guide: GuideControl) {
    const resNode = this.resArea.getEffectiveResNode([guide.resTag]);
    if (!resNode) return;

    this.showGuideText(guide);

    // 停止之前的缓动并设置初始位置
    this.guideIcon.stopAllActions();
    this.guideIcon.setPosition(
      this.guideIcon.parent.convertToNodeSpaceAR(
        resNode.convertToWorldSpaceAR(cc.v2(0, 0))
      )
    );
    // 克隆附带节点
    // const copyNode = cc.instantiate(resNode);

    this.guideIcon.active = true;

    gi.Guide.fromToNode(resNode, guide.targetNode, {
      time: 2,
      guide: this.guideIcon,
    })
      .union()
      .repeatForever()
      .start();
    // gi.Guide.fromToNode(resNode, guide.targetNode, { time: 2, guide: this.guideIcon, node: copyNode }).union().repeatForever().start();
  }

  /** 点击引导 */
  click(guide: GuideControl) {
    this.showGuideText(guide);

    // 停止之前的缓动并设置位置
    this.guideIcon.stopAllActions();
    this.guideIcon.setPosition(
      this.guideIcon.parent.convertToNodeSpaceAR(
        guide.targetNode.convertToWorldSpaceAR(cc.v2(0, 0))
      )
    );
    // 销毁附带节点，防止上一个引导器是拖动引导
    gi.Guide.destroyCopyNode();

    this.guideIcon.active = true;
  }

  /** 滑动引导 */
  swipe(guide: GuideControl) {
    this.showGuideText(guide);

    // 停止之前的缓动并设置初始位置
    this.guideIcon.stopAllActions();
    this.guideIcon.setPosition(
      this.guideIcon.parent.convertToNodeSpaceAR(
        guide.targetNode.convertToWorldSpaceAR(cc.v2(0, 0))
      )
    );
    // 销毁附带节点，防止上一个引导器是拖动引导
    gi.Guide.destroyCopyNode();

    this.guideIcon.active = true;
    let targetPos = this.guideIcon.getPosition();
    if (guide.type === gi.Guide.Type.UP) {
      targetPos = targetPos.add(cc.v2(0, 30));
    } else if (guide.type === gi.Guide.Type.Down) {
      targetPos = targetPos.add(cc.v2(0, -30));
    } else if (guide.type === gi.Guide.Type.Right) {
      targetPos = targetPos.add(cc.v2(30, 0));
    } else if (guide.type === gi.Guide.Type.Left) {
      targetPos = targetPos.add(cc.v2(-30, 0));
    }

    gi.Guide.fromToPos(this.guideIcon.getPosition(), targetPos, {
      time: 1,
      guide: this.guideIcon,
    })
      .union()
      .repeatForever()
      .start();
  }

  hiddenGuideIcon() {
    this.guideIcon.stopAllActions();
    this.guideTextNode.stopAllActions();
    this.guideIcon.active = false;
    this.guideTextNode.active = false;
  }

  /** 得到一个场上还可以触发升级的触发器 */
  getEffectiveTrigger(res: ResControl) {
    let limitedCount = 100;
    while (limitedCount) {
      const randomIndex = Math.floor(
        Math.random() * this.triggerManager.children.length
      );
      const trigger =
        this.triggerManager.children[randomIndex].getComponent(TriggerControl);
      if (trigger.node.active && trigger.key && trigger.canTriggerOff(res.tags))
        return trigger;
      limitedCount--;
    }
  }
}
