import { CellWidth, CellHeight } from './Config/Game';
const { ccclass, property } = cc._decorator;

@ccclass
export default class CellControl extends cc.Component {
  /** TileNode在哪行 */
  row: number = -1;
  /** TileNode在哪列 */
  col: number = -1;

  Init(row: number, col: number, parent: cc.Node) {
    this.row = row;
    this.col = col;
    let path = '';
    if (row % 2 === 0) {
      path = col % 2 === 0 ? 'tile_ground2' : 'tile_ground1';
    } else if (row % 2 !== 0) {
      path = col % 2 === 0 ? 'tile_ground1' : 'tile_ground2';
    }
    cc.loader.loadRes(path, cc.SpriteFrame, (err, res) => {
      if (err) return;
      const sprite = this.node.getComponent(cc.Sprite);
      sprite.spriteFrame = res;
      this.node.setContentSize(CellWidth, CellHeight);
    });
    if (parent) {
      this.node.setParent(parent);
      this.node.setPosition(this.GetTilePos(row, col));
    }
  }

  /** 获取指定行、列的TileNode的位置 */
  GetTilePos(row, col): cc.Vec2 {
    const BeginX = this.node.parent.x - this.node.parent.width / 2 + CellWidth / 2;
    const BeginY = this.node.parent.y + this.node.parent.height / 2 - CellHeight / 2;
    const targetX = BeginX + col * CellWidth;
    const targetY = BeginY - row * CellHeight;
    return cc.v2(targetX, targetY);
  }
}
