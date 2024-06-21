const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockControl extends cc.Component {
  @property({ type: cc.Sprite, tooltip: '方块Sprite' })
  blockSprite: cc.Sprite = null;

  @property({ type: cc.Sprite, tooltip: '变色Sprite' })
  changeSprite: cc.Sprite = null;

  @property({ type: cc.Prefab, tooltip: '消除粒子预制体' })
  particlePrefab: cc.Prefab = null;

  /** 方块类目 */
  private _category: string;
  /** 当前所属方块类目下的类型 */
  private _type: number;
  /** 行 */
  row: number;
  /** 列 */
  col: number;

  init() {
    this.node.setContentSize(gi.BLOCKWIDTH, gi.BLOCKHEIGHT);
    this.blockSprite.node.setContentSize(gi.BLOCKWIDTH, gi.BLOCKHEIGHT);
  }

  setType(type: number) {
    this._type = type;
    const path = `${this._category}/${this._type}`;
    const spriteFrame = cc.loader.getRes(path, cc.SpriteFrame) as cc.SpriteFrame;
    this.blockSprite.spriteFrame = spriteFrame;
  }

  getType() {
    return this._type;
  }

  setRanks({ row, col }: gi.Ranks) {
    this.row = row;
    this.col = col;
  }

  setCategory(category: string) {
    this._category = category;
  }

  getCategory() {
    return this._category;
  }

  setChange(type: number, category: string) {
    const spriteFrame = gi.getBlockSprite(type, category);
    this.changeSprite.spriteFrame = spriteFrame;
    this.changeSprite.node.active = true;

    this.changeSprite.node.setContentSize(gi.BLOCKWIDTH, gi.BLOCKHEIGHT);
  }

  cancleChange() {
    this.changeSprite.node.active = false;
  }

  Remove() {
    const particleNode = cc.instantiate(this.particlePrefab);
    const particle = particleNode.getComponent(cc.ParticleSystem);

    const path = `${this._category}/${this._type}`;
    const spriteFrame = cc.loader.getRes(path, cc.SpriteFrame) as cc.SpriteFrame;
    particle.autoRemoveOnFinish = true;
    particle.spriteFrame = spriteFrame;
    particleNode.zIndex = 100;
    particleNode.setPosition(this.node.position);
    particleNode.setParent(this.node.parent);
    particleNode.active = true;
  }
}
