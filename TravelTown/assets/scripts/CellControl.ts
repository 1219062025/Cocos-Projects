const { ccclass, property } = cc._decorator;
import { CellType, TileWidth, TileHeight } from './Config/Game';

@ccclass
export default class CellControl extends cc.Component {
  @property({ type: cc.Prefab, tooltip: 'UnLockParticle预制体' })
  UnLockParticle: cc.Prefab = null;
  /** 格子的id */
  id: number = Infinity;
  /** 格子类型 */
  type: number = 0;
  /** 格子在哪行 */
  row: number = -1;
  /** 格子在哪列 */
  col: number = -1;
  /** 格子是否处于锁定状态 */
  get isLock() {
    return this.type === -1;
  }
  /** 是否是奖励类型的格子 */
  isAward: boolean = false;
  /** 格子是否被占据了 */
  isFillIn: boolean = false;
  /** 如果是奖励类型的话匹配那个TileNode类型 */
  awardMatch: number = Infinity;

  Init(type: number, row: number, col: number, parent: cc.Node) {
    this.type = type;
    this.row = row;
    this.col = col;
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    this.node.setParent(parent);
    this.node.setPosition(this.GetTilePos(row, col));
    this.node.setContentSize(120, 120);
    // 根据Cell类型生成图片节点
    if (CellType.has(this.type)) {
      const CellInfo = CellType.get(this.type);
      this.isAward = CellInfo.isAward;
      this.awardMatch = CellInfo.awardMatch;
      const SpriteFrame = CellInfo.isRandomValue ? CellInfo.value[Math.floor(Math.random() * CellInfo.value.length)] : CellInfo.value;
      cc.loader.loadRes(`${SpriteFrame}`, cc.SpriteFrame, (err, res) => {
        if (err) return;
        const CellContentNode = this.node.getChildByName(`CellContent`);
        CellContentNode.getComponent(cc.Sprite).spriteFrame = res;
        CellContentNode.active = true;
      });
    }
  }

  RemoveAward() {
    this.isAward = false;
    this.awardMatch = Infinity;
    const CellContentNode = this.node.getChildByName(`CellContent`);
    CellContentNode.getComponent(cc.Sprite).spriteFrame = null;
    CellContentNode.active = false;
  }

  RemoveLock() {
    const CellInfo = CellType.get(this.type);
    const particleNode = cc.instantiate(this.UnLockParticle);
    cc.loader.loadRes(`un${CellInfo.value[Math.floor(Math.random() * CellInfo.value.length)]}`, cc.SpriteFrame, (err, res) => {
      if (err) return;
      const particle = particleNode.getComponent(cc.ParticleSystem);
      particle.spriteFrame = res;
      particleNode.zIndex = 999;
      particle.autoRemoveOnFinish = true;
      particleNode.setParent(this.node.parent);
      particleNode.setPosition(this.node.getPosition());
      const CellContentNode = this.node.getChildByName(`CellContent`);
      cc.tween(CellContentNode)
        .to(0.2, { scale: 0.9 })
        .to(0.2, { scale: 1 })
        .call(() => {
          CellContentNode.getComponent(cc.Sprite).spriteFrame = null;
          CellContentNode.active = false;
          this.type = 0;
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
