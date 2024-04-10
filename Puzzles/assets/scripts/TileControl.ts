const { ccclass, property } = cc._decorator;
import { TileType } from './Config/Game';

@ccclass
export default class TileControl extends cc.Component {
  /** Tile的图片组件 */
  @property(cc.Sprite)
  sprite: cc.Sprite = null;

  /** TileNode的id */
  id: number = Infinity;
  /** TileNode类型 */
  type: number = Infinity;
  /** TileNode在哪行 */
  row: number = -1;
  /** TileNode在哪列 */
  col: number = -1;
  /** 是否被选中 */
  isSelect: boolean = false;

  /** 初始化TileNode */
  Init(type: number, row: number, col: number, position: cc.Vec2 | cc.Vec3, parent: cc.Node) {
    this.type = type;
    this.row = row;
    this.col = col;
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    cc.loader.loadRes(TileType.get(type).value, cc.SpriteFrame, (err, res) => {
      this.sprite.spriteFrame = res;
      this.node.setPosition(position);
    });
    if (parent) this.node.setParent(parent);
  }
}
