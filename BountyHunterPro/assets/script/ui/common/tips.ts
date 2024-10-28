import { _decorator, AnimationComponent, Component, isValid, LabelComponent, Node, Size, UITransform, Vec3 } from 'cc';
import { PoolManager } from '../../framework/poolManager';
const { ccclass, property } = _decorator;

@ccclass('Tips')
export class Tips extends Component {
  @property(LabelComponent)
  contentLabel: LabelComponent = null!;

  public show(content: string, callback?: Function) {
    this.node.setPosition(new Vec3(0, 0, 0));

    this.contentLabel.string = content;
    let size: Size = this.contentLabel.node.getComponent(UITransform)?.contentSize as Size;
    if (!isValid(size)) {
      PoolManager.instance.putNode(this.node);
      return;
    }

    this.node.getComponent(UITransform)?.setContentSize(size.width + 100 < 240 ? 240 : size.width + 100, size.height + 30);

    let animation: AnimationComponent = this.node.getComponent(AnimationComponent) as AnimationComponent;
    animation.play();
    animation.once(AnimationComponent.EventType.FINISHED, () => {
      callback && callback();
      PoolManager.instance.putNode(this.node);
    });
  }
}
