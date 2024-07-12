const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class TriggerGroup extends cc.Component {
  /** 该活动组id */
  @property({ type: cc.Integer, tooltip: '该活动组id' })
  id: number = 0;

  @property({ type: [cc.Node], tooltip: '该活动组关联的图片节点' })
  /** 该活动组关联的图片节点 */
  nodes: cc.Node[] = [];

  @property({ tooltip: '该活动组是否active' })
  get isActive() {
    return this._isActive;
  }

  set isActive(v: boolean) {
    this._isActive = v;
    this.nodes.forEach(node => (node.active = v));
  }

  _isActive: boolean = false;

  onLoad() {}
}
