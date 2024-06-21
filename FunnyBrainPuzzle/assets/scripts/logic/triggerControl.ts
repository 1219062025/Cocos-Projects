const { ccclass, property } = cc._decorator;

@ccclass
export default class TriggerControl extends cc.Component {
  @property({ type: [cc.Node], tooltip: '关联的图片节点' })
  spriteNodes: cc.Node[] = [];

  onLoad() {}
}
