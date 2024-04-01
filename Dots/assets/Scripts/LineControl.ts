import { LineWidth, PointType, PointWidth, PointHeight, PointGap, LineInfoMap } from './GameConfig';

const { ccclass, property } = cc._decorator;

@ccclass
export default class LineControl extends cc.Component {
  /** 线段起始于哪个节点 */
  BeginPointNode: cc.Node = null;

  /** 线段结束于哪个节点 */
  EndPointNode: cc.Node = null;

  /** 方向 */
  Direction: cc.Vec2 = cc.v2(0, 0);

  /** 类型 0-横线 1-竖线 */
  status: number = -1;

  onLoad() {}

  Init(type: number, BeginPointNode: cc.Node, EndPointNode: cc.Node, parent: cc.Node) {
    this.BeginPointNode = BeginPointNode;
    this.EndPointNode = EndPointNode;
    this.setDirection();
    this.node.color = new cc.Color().fromHEX(PointType.get(type).value);
    this.node.setPosition(this.BeginPointNode.position);
    this.node.width = this.status === 1 ? LineWidth : PointHeight + PointGap;
    this.node.height = this.status === 0 ? LineWidth : PointWidth + PointGap;
    if (parent) {
      this.node.setParent(parent);
    }
  }

  /** 设置线段方向 */
  setDirection() {
    /** 从BeginPointNode至EndPointNode的方向单位向量 */
    const directionVD = cc.v2(this.EndPointNode.position.sub(this.BeginPointNode.position).normalize());
    /** 根据方向向量得到的锚点位置 */
    const LineInfo = LineInfoMap.get(`${directionVD.x},${directionVD.y}`);
    this.node.anchorX = LineInfo.anchorX;
    this.node.anchorY = LineInfo.anchorY;
    this.status = LineInfo.status;
    this.Direction = directionVD;
  }
}
