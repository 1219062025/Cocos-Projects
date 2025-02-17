const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Utils/AutoPlayAnimationOnActive")
export class AutoPlayAnimationOnActive extends cc.Component {
  animationComponent: cc.Animation | null = null; // 动画组件

  start() {
    this.animationComponent = this.node.getComponent(cc.Animation);
    // 确保 animationComponent 已经挂载
    if (!this.animationComponent) {
      console.error("未找到动画组件！");
      return;
    }
  }

  // 当节点的 active 状态变化时触发
  onEnable() {
    // 如果节点被激活，则播放默认动画
    if (this.node.activeInHierarchy && this.animationComponent) {
      const defaultClip = this.animationComponent.defaultClip; // 获取默认动画片段
      if (defaultClip) {
        this.animationComponent.play(defaultClip.name); // 播放默认动画
      }
    }
  }
}
