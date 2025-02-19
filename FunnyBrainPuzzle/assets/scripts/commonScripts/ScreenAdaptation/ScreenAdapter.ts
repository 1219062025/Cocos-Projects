const { ccclass, executionOrder, help, menu } = cc._decorator;

@ccclass
@executionOrder(-1)
export default class ScreenAdapter extends cc.Component {
  protected onLoad() {
    this.init();
  }

  protected onEnable() {
    this.adapt();
  }

  protected init() {
    this.adapt();
    // 设置游戏窗口变化的回调（仅 Web 平台有效）
    cc.view.setResizeCallback(() => this.onResize());
  }

  protected onResize() {
    // 由于 setResizeCallback 只能设置一个回调
    // 使用事件系统发送一个特定事件，让其他组件也可以监听到窗口变化
    this.adapt();
    gi.Event.emit("view-resize");
  }

  /**
   * 适配
   */
  protected adapt() {
    const winSize = cc.view.getFrameSize();
    if (winSize.width > winSize.height) {
      this.setFitHeight();
    } else {
      this.setFitWidth();
    }
  }

  /**
   * 适配高度模式，并通知所有横屏模式下需要变化的节点改变
   */
  protected setFitHeight() {
    const canvas = cc.Canvas.instance;
    canvas.fitHeight = true;
    canvas.fitWidth = false;
    gi.Event.emit("LANDSCAPE");
  }

  /**
   * 适配宽屏模式，并通知所有竖屏模式下需要变化的节点改变
   */
  protected setFitWidth() {
    const canvas = cc.Canvas.instance;
    canvas.fitHeight = false;
    canvas.fitWidth = true;
    gi.Event.emit("PORTRAIT");
  }
}
