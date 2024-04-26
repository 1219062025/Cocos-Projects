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

    /** ---DEBUG--- */
    const LabelNode = this.node.getChildByName('Label');
    LabelNode.getComponent(cc.Label).string = `${this.row + 1};${this.col + 1}`;
    /** ---DEBUG END--- */

    const top = map[row - 1] !== undefined ? map[row - 1][col] : null;
    const bottom = map[row + 1] !== undefined ? map[row + 1][col] : null;
    const left = map[row][col - 1] !== undefined ? map[row][col - 1] : null;
    const right = map[row][col + 1] !== undefined ? map[row][col + 1] : null;
    const prefix = 'border_';

    /** ___DEBUG START___ */
    // LabelNode.getComponent(cc.Label).string = `${left}`;
    /** ___DEBUG END___ */

    if (top) {
      this.node.getChildByName(`${prefix}t`).active = false;
    }
    if (bottom) {
      this.node.getChildByName(`${prefix}b`).active = false;
    }
    if (left) {
      this.node.getChildByName(`${prefix}l`).active = false;
    }
    if (right) {
      this.node.getChildByName(`${prefix}r`).active = false;
    }

    let suffix = '';
    if (row % 2 === 0) {
      suffix = col % 2 === 0 ? '2' : '1';
    } else if (row % 2 !== 0) {
      suffix = col % 2 !== 0 ? '2' : '1';
    }
    const loadUrl = [`Plot/floor${suffix}`, `Plot/${prefix}t${suffix}`, `Plot/${prefix}b${suffix}`, `Plot/${prefix}l${suffix}`, `Plot/${prefix}r${suffix}`];
    cc.loader.loadResArray(loadUrl, cc.SpriteFrame, (err, assets: cc.SpriteFrame[]) => {
      if (err) return new Error('加载地块资源出错');
      assets.forEach(SpriteFrame => {
        const NodeName = SpriteFrame.name.slice(0, -1);
        const Node = this.node.getChildByName(`${NodeName}`);
        const sprite = Node.getComponent(cc.Sprite);
        sprite.spriteFrame = SpriteFrame;
      });
    });
  }
}
