const { ccclass, property } = cc._decorator;
import { TileType, TileWidth, TileHeight, GameAreaHeight, InitiaRowCount } from './Config/Game';
import EventManager from './Common/EventManager';

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
  TileNodePool: cc.NodePool = null;

  @property(cc.Prefab)
  ParticlePrefab: cc.Prefab = null;

  /** 初始化TileNode */
  Init(type: number, row: number, col: number, parent: cc.Node) {
    this.type = type;
    this.row = row;
    this.col = col;
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    cc.loader.loadRes(TileType.get(type).value, cc.SpriteFrame, (err, res) => {
      this.sprite.spriteFrame = res;
    });
    if (parent) {
      this.node.setParent(parent);
    }
  }

  /** 将TileNode沿着指定的tagetVector向量进行交换 */
  SwapTo(tagetVector: cc.Vec2) {
    return new Promise<void>(resolve => {
      cc.tween(this.node)
        .by(0.2, { position: tagetVector.mul(this.node.width) })
        .call(() => {
          resolve();
        })
        .start();
    });
  }

  /** 下落到指定位置 */
  FallTo(row: number, col: number, isInit: boolean = false, time: number = 0.5) {
    const position = this.GetTilePos(row, col);
    this.node.x = position.x;
    // this.node.y = !isInit ? this.node.y : (GameAreaHeight + TileHeight) / 2;
    this.node.y = !isInit ? this.node.y : (GameAreaHeight + TileHeight) / 2 + (InitiaRowCount - this.row) * TileHeight;
    return new Promise<void>(resolve => {
      cc.tween(this.node)
        .call(() => {
          EventManager.emit('SignIn');
        })
        .delay(isInit ? 0.1 - 0.00625 * this.row : 0)
        .to(isInit ? time + 0.0125 * Math.abs(this.row - InitiaRowCount) : time, { position }, { easing: 'sineOut' })
        .call(() => {
          resolve();
          EventManager.emit('SignOut', [this.row, this.col]);
        })
        .start();
    });
  }

  Remove() {
    const particleNode = cc.instantiate(this.ParticlePrefab);
    const particle = particleNode.getComponent(cc.ParticleSystem);
    cc.loader.loadRes(TileType.get(this.type).value, cc.SpriteFrame, (err, res) => {
      particle.autoRemoveOnFinish = true;
      particle.spriteFrame = res;
      particleNode.zIndex = 100;
      particleNode.setPosition(this.node.position);
      particleNode.setParent(this.node.parent);
      particleNode.active = true;
      this.TileNodePool.put(this.node);
    });
  }

  AttachPool(pool: cc.NodePool) {
    if (!pool) return;
    this.TileNodePool = pool;
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
