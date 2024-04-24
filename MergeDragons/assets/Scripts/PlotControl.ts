const { ccclass, property } = cc._decorator;

@ccclass
export default class PlotControl extends cc.Component {
  /** PlotNode的id */
  id: number = Infinity;
  /** PlotNode类型 */
  type: number = Infinity;
  /** PlotNode在哪行 */
  row: number = -1;
  /** PlotNode在哪列 */
  col: number = -1;

  /** 初始化 */
  Init(type: number, row: number, col: number, map: number[][]) {
    this.type = type;
    this.row = row;
    this.col = col;
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    const prefix = 'border_';
    const borderNode = this.node.getChildByName('border');
    const LabelNode = this.node.getChildByName('Label');
    LabelNode.getComponent(cc.Label).string = `${this.row};${this.col}`;
    const top = map[row - 1] !== undefined ? map[row - 1][col] : null;
    const bottom = map[row + 1] !== undefined ? map[row + 1][col] : null;
    const left = map[row][col - 1] !== undefined ? map[row][col - 1] : null;
    const right = map[row][col + 1] !== undefined ? map[row][col + 1] : null;
    // LabelNode.getComponent(cc.Label).string = `${left}`;
    if (top) {
      borderNode.getChildByName(`${prefix}t`).active = false;
    }
    if (bottom) {
      borderNode.getChildByName(`${prefix}b`).active = false;
    }
    if (left) {
      borderNode.getChildByName(`${prefix}l`).active = false;
    }
    if (right) {
      borderNode.getChildByName(`${prefix}r`).active = false;
    }
  }
}
