const { ccclass, property } = cc._decorator;

@ccclass
export default class TriggerGroup extends cc.Component {
  @property({ type: cc.Integer, tooltip: '该组触发器级别' })
  /** 该组触发器级别 */
  level: number = 0;

  @property({ type: [cc.Node], tooltip: '该组触发器关联的图片节点' })
  /** 该组触发器关联的图片节点 */
  nodes: cc.Node[] = [];

  onLoad() {}
}
