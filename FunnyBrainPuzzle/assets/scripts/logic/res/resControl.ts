const { ccclass, property } = cc._decorator;

@ccclass
export default class ResControl extends cc.Component {
  @property({ tooltip: '该资源的类型，与想要触发的触发器的碰撞器tag需要相同' })
  tag: number = 0;

  @property({ tooltip: '选中该资源时是否直接使用而不是随机选取' })
  unique: boolean = false;
}
