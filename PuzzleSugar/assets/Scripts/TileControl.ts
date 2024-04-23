import { TileType, TileWidth, TileHeight, CellWidth, CellHeight, GameAreaHeight, InitiaRowCount, Tile } from './Config/Game';
import EventManager from './CommonScripts/EventManager';
const { ccclass, property } = cc._decorator;

@ccclass
export default class TileControl extends cc.Component {
  @property({ type: cc.Prefab, tooltip: '消除时的粒子效果预制体' })
  ParticlePrefab: cc.Prefab = null;
  /** TileNode的id */
  id: number = Infinity;
  /** TileNode类型 */
  type: number = Infinity;
  /** TileNode在哪行 */
  row: number = -1;
  /** TileNode在哪列 */
  col: number = -1;
  /** 是否被遍历过了 */
  isTraversal: boolean = false;
  /** TileNode所附属的对象池 */
  TileNodePool: cc.NodePool = null;

  /** 初始化TileNode */
  Init(type: number, row: number, col: number, parent: cc.Node) {
    this.type = type;
    this.row = row;
    this.col = col;
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    cc.loader.loadRes(TileType.get(type).path, cc.SpriteFrame, (err, res) => {
      if (err) return;
      const sprite = this.node.getComponent(cc.Sprite);
      sprite.spriteFrame = res;
      this.node.setContentSize(TileWidth, TileHeight);
    });
    if (parent) {
      this.node.setParent(parent);
    }
  }

  /** 摇晃 */
  Shake() {
    cc.tween(this.node).to(0.05, { angle: -10 }).to(0.05, { angle: 0 }).to(0.05, { angle: 10 }).to(0.05, { angle: 0 }).union().repeat(3).start();
  }

  /** 下落到指定位置 */
  FallTo(row: number, col: number, isInit: boolean = false, time: number = 0.5) {
    const position = this.GetTilePos(row, col);
    this.node.x = position.x;
    // this.node.y = !isInit ? this.node.y : (GameAreaHeight + CellHeight) / 2;
    this.node.y = !isInit ? this.node.y : (GameAreaHeight + CellHeight) / 2 + (InitiaRowCount - this.row) * CellHeight;
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

  /** 消除TileNode */
  Remove() {
    const particleNode = cc.instantiate(this.ParticlePrefab);
    const particle = particleNode.getComponent(cc.ParticleSystem);
    cc.loader.loadRes(TileType.get(this.type).path, cc.SpriteFrame, (err, res) => {
      particle.autoRemoveOnFinish = true;
      particle.spriteFrame = res;
      particleNode.zIndex = 100;
      particleNode.setPosition(this.node.position);
      particleNode.setParent(this.node.parent);
      particleNode.active = true;
      this.isTraversal = false;
      this.TileNodePool.put(this.node);
    });
  }

  /** 附属到指定对象池 */
  AttachPool(pool: cc.NodePool) {
    if (!pool) return;
    this.TileNodePool = pool;
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
