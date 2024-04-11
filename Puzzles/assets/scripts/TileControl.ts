const { ccclass, property } = cc._decorator;
import { TileType, TileHeight, GameAreaHeight, InitiaRowCount } from './Config/Game';

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
  Init(type: number, row: number, col: number, position: cc.Vec2, parent: cc.Node) {
    this.type = type;
    this.row = row;
    this.col = col;
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    cc.loader.loadRes(TileType.get(type).value, cc.SpriteFrame, (err, res) => {
      this.sprite.spriteFrame = res;
      this.node.setPosition(position);
    });
    if (parent) {
      this.node.setParent(parent);
      this.FallTo(position, true, 0.7);
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
  FallTo(position: cc.Vec2, isInit: boolean = false, time: number = 0.25) {
    this.node.x = position.x;
    this.node.y = !isInit ? this.node.y : (GameAreaHeight + TileHeight) / 2 + (InitiaRowCount - this.row) * TileHeight;
    return new Promise(resolve => {
      cc.tween(this.node)
        .to(time, { position })
        .call(() => {
          resolve({ row: this.row, col: this.col });
        })
        .start();
    });
  }

  Remove() {
    const particle = this.node.addComponent(cc.ParticleSystem);
    this.sprite.enabled = false;
    particle.playOnLoad = true;
    particle.autoRemoveOnFinish = true;
    this.node.zIndex = 100;
    cc.loader.loadRes('particle/particle_2', cc.ParticleAsset, (err, res) => {
      particle.file = res;
    });
  }
}
