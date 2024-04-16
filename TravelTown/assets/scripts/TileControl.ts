import { TileType, TileWidth, TileHeight, GameAreaHeight, InitiaRowCount } from './Config/Game';
const { ccclass, property } = cc._decorator;

@ccclass
export default class TileControl extends cc.Component {
  @property({ type: cc.Node, tooltip: 'TileNode被选中时描边的节点' })
  SelectNode: cc.Node = null;
  /** TileNode的id */
  id: number = Infinity;
  /** TileNode类型 */
  type: number = Infinity;
  /** TileNode在哪行 */
  row: number = -1;
  /** TileNode在哪列 */
  col: number = -1;
  /** 当前级别 */
  level: number = 1;
  /** 当前级别 */
  maxLevel: number = 1;
  /** 是否处于某个缓动中 */
  inAction: boolean = false;

  /** 初始化 */
  Init(type: number, row: number, col: number, parent: cc.Node, level: number = 1) {
    this.type = type;
    this.row = row;
    this.col = col;
    this.level = level;
    this.maxLevel = TileType.get(this.type).maxLevel;
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    const resUrl = `Tile${TileType.get(this.type).label}${this.level}`;
    return new Promise<void>(resolve => {
      cc.loader.loadRes(resUrl, cc.SpriteFrame, (err, res) => {
        if (err) return;
        this.node.getComponent(cc.Sprite).spriteFrame = res;
        this.node.setParent(parent);
        this.node.setContentSize(80, 80);
        resolve();
      });
    });
  }

  /** 选中TileNode */
  Select() {
    if (this.inAction) return;
    const sprite = this.SelectNode.getComponent(cc.Sprite);
    if (!sprite.spriteFrame) {
      const resUrl = `Tile${TileType.get(this.type).label}${this.level}H`;
      cc.loader.loadRes(resUrl, cc.SpriteFrame, (err, res) => {
        if (err) return;
        this.SelectNode.getComponent(cc.Sprite).spriteFrame = res;
        this.SelectNode.setContentSize(105, 105);
      });
    }
    this.SelectNode.active = true;
  }

  /** 取消选中TileNode */
  UnSelect() {
    this.SelectNode.active = false;
  }

  Back() {
    this.inAction = true;
    return new Promise<void>(resolve => {
      cc.tween(this.node)
        .to(0.5, { position: this.GetTilePos(this.row, this.col) }, { easing: 'smooth' })
        .call(() => {
          this.inAction = false;
          resolve();
        })
        .start();
    });
  }

  Compound() {
    this.inAction = true;
    this.node.setPosition(this.GetTilePos(this.row, this.col));
    return new Promise<void>(resolve => {
      cc.tween(this.node)
        .call(() => {
          this.node.setScale(0);
        })
        .to(0.2, { scale: 1.2 })
        .to(0.05, { scale: 1 })
        .call(() => {
          this.inAction = false;
          resolve();
        })
        .start();
    });
  }

  /** 初始化时以一定弧度移动到指定位置 */
  MoveTo(BeginPos: cc.Vec2) {
    this.inAction = true;
    this.node.setPosition(BeginPos);
    const TargetPos = this.GetTilePos(this.row, this.col);
    const TargetVec = TargetPos.sub(BeginPos);
    const bezierTo = cc.bezierTo(0.3, [BeginPos, TargetVec.rotateSelf(10).multiply(cc.v2(0.1, 0.1)), TargetPos]);
    const scaleTo = cc.scaleTo(0.1, 1);
    return new Promise<void>(resolve => {
      cc.tween(this.node)
        .call(() => {
          this.node.setScale(0.9);
        })
        .then(bezierTo)
        .then(scaleTo)
        .call(() => {
          this.inAction = false;
          resolve();
        })
        .start();
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
