import { _decorator, Component, Label, Node, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NotifyComponent')
export class NotifyComponent extends Component {
  @property(Label)
  private lab_content: Label | null = null;

  @property(Animation)
  private animation: Animation | null = null;

  onLoad() {
    if (this.animation) this.animation.on(Animation.EventType.FINISHED, this.onFinished, this);
  }

  private onFinished() {
    this.node.destroy();
  }

  /**
   * 显示提示
   * @param msg       文本
   * @param useI18n   多语言标签
   * @param callback  提示动画播放完成回调
   */
  public toast(msg: string, useI18n?: boolean) {
    // debugger;
    this.lab_content!.string = msg;
  }
}
