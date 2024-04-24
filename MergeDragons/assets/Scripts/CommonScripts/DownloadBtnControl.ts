const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  @property({ type: cc.Integer, tooltip: '完成一次缩放动画的时间' })
  ScaleTime: number = 0.6;

  onLoad() {
    this.Init();
  }

  /** 初始化下载按钮 */
  Init() {
    this.node.on(cc.Node.EventType.TOUCH_START, this.Download, this);
    this.PlayStretchAnimation();
  }

  Download() {
    // @ts-ignore
    linkToStore();
  }

  /** 按钮伸缩动画 */
  PlayStretchAnimation() {
    cc.tween(this.node).to(this.ScaleTime, { scale: 1.1 }).to(this.ScaleTime, { scale: 1 }).union().repeatForever().start();
  }
}
