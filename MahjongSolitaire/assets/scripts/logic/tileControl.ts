const { ccclass, property } = cc._decorator;

@ccclass
export default class TileControl extends cc.Component {
  @property({ type: cc.Sprite, tooltip: 'Tile图片' })
  tileSprite: cc.Sprite = null;

  /** Tile id */
  id: number;

  /** Tile所处的层级 */
  tier: number;

  /** Tile在当前层级所处的行数 */
  row: number;

  /** Tile在当前层级所处的列数 */
  col: number;

  onLoad() {
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  init(id: number) {
    this.id = id;
    const spriteFrame = cc.loader.getRes(`tile/01/tile01_${id}`, cc.SpriteFrame);
    if (spriteFrame) {
      this.tileSprite.spriteFrame = spriteFrame;
    }
    this.node.setContentSize(this.node.width * gi.tileScale, this.node.height * gi.tileScale);

    for (const node of this.node.children) {
      node.setContentSize(node.width * gi.tileScale, node.height * gi.tileScale);
    }
  }

  setRanks(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  setTier(tier: number) {
    this.tier = tier;
  }

  onTouchStart(e: cc.Event.EventTouch) {
    console.log(e.currentTarget);
  }
}
