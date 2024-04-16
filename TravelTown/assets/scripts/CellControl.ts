const { ccclass, property } = cc._decorator;
import { TileType, TileWidth, TileHeight, GameAreaHeight, InitiaRowCount } from './Config/Game';

@ccclass
export default class CellControl extends cc.Component {
  /** 格子的id */
  id: number = Infinity;
  /** 格子类型 */
  type: number = Infinity;
  /** 格子在哪行 */
  row: number = -1;
  /** 格子在哪列 */
  col: number = -1;
  /** 格子是否处于锁定状态 */
  isLock: boolean = false;
  /** 格子是否被占据了 */
  isFillIn: boolean = false;

  Init(type: number, row: number, col: number, parent: cc.Node) {
    this.type = type;
    this.row = row;
    this.col = col;
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    this.isLock = type === -1;
    const resUrl = this.isLock ? 'cellLock' : 'cell';
    cc.loader.loadRes(resUrl, cc.SpriteFrame, (err, res) => {
      if (err) return;
      this.node.getComponent(cc.Sprite).spriteFrame = res;
      this.node.setParent(parent);
      this.node.setPosition(this.GetTilePos(row, col));
      this.node.setContentSize(120, 120);
    });
  }

  /** 获取指定行、列的TileNode的位置 */
  GetTilePos(row, col): cc.Vec2 {
    const BeginX = this.node.parent.x - this.node.parent.width / 2 + TileWidth / 2;
    const BeginY = this.node.parent.y + this.node.parent.height / 2 - TileHeight / 2;
    const targetX = BeginX + col * TileWidth;
    const targetY = BeginY - row * TileHeight;
    return cc.v2(targetX, targetY);
  }
}
