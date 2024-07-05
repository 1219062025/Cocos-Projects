const { ccclass, property } = cc._decorator;

@ccclass
export default class TileControl extends cc.Component {
  tid: number;

  nid: number;

  /** Tile所处的层级 */
  tier: number;

  /** Tile在当前层级所处的行数 */
  row: number;

  /** Tile在当前层级所处的列数 */
  col: number;

  onLoad() {
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  init() {}

  setRanks(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  onTouchStart(e: cc.Event.EventTouch) {
    console.log(e.currentTarget);
  }
}
