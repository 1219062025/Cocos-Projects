import { BaseBlock, BlockCategory } from './Type/Enum';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockControl extends cc.Component {
  @property({ type: cc.Sprite, tooltip: '方块Sprite' })
  blockSprite: cc.Sprite = null;

  @property({ type: cc.Sprite, tooltip: '阴影Sprite' })
  shadowSprite: cc.Sprite = null;

  @property({ type: cc.Prefab, tooltip: '消除粒子预制体' })
  ParticlePrefab: cc.Prefab = null;

  /** 方块类目 */
  category: BlockCategory;
  /** 当前所属方块类目下的类型 */
  type: number;
  /** 行 */
  row: number;
  /** 列 */
  col: number;

  init(type: number) {
    this.category = BlockCategory.BASEBLOCK;
    this.type = type;
    const categoryName = BlockCategory[this.category];
    const path = `${categoryName}/${this.type}`;
    const spriteFrame = cc.loader.getRes(path, cc.SpriteFrame) as cc.SpriteFrame;
    this.blockSprite.spriteFrame = spriteFrame;

    this.node.setContentSize(gi.BLOCKWIDTH, gi.BLOCKHEIGHT);
    this.blockSprite.node.setContentSize(gi.BLOCKWIDTH, gi.BLOCKHEIGHT);
  }

  setType(type: number) {
    this.type = type;
    const categoryName = BlockCategory[this.category];
    const path = `${categoryName}/${this.type}`;
    const spriteFrame = cc.loader.getRes(path, cc.SpriteFrame) as cc.SpriteFrame;
    this.blockSprite.spriteFrame = spriteFrame;
    if (this.type === BaseBlock.GREY) {
      this.shadowSprite.node.active = false;
    }
  }

  setRanks({ row, col }: gi.Ranks) {
    this.row = row;
    this.col = col;
  }

  Remove() {
    const particleNode = cc.instantiate(this.ParticlePrefab);
    const particle = particleNode.getComponent(cc.ParticleSystem);
    const categoryName = BlockCategory[this.category];
    const path = `${categoryName}/${this.type}`;
    const spriteFrame = cc.loader.getRes(path, cc.SpriteFrame) as cc.SpriteFrame;
    particle.autoRemoveOnFinish = true;
    particle.spriteFrame = spriteFrame;
    particleNode.zIndex = 100;
    particleNode.setPosition(this.node.position);
    particleNode.setParent(this.node.parent);
    particleNode.active = true;
  }
}
