const { ccclass, property } = cc._decorator;

@ccclass
export default class TileControl extends cc.Component {
  @property({ type: cc.Sprite, tooltip: 'Tile图片' })
  tileSprite: cc.Sprite = null;
  @property({ type: cc.Sprite, tooltip: 'Tile选中遮罩' })
  tileMask: cc.Sprite = null;
  @property({ type: cc.Sprite, tooltip: 'Tile选中提示图片' })
  tileSelected: cc.Sprite = null;

  /** Tile id */
  id: number;

  /** Tile所处的层级 */
  tier: number;

  /** Tile在当前层级所处的行数 */
  row: number;

  /** Tile在当前层级所处的列数 */
  col: number;

  /** 节流用的 */
  lastTime: number = 0;

  onLoad() {
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  init(id: number) {
    this.id = id;
    const spriteFrame = cc.loader.getRes(`tile/01/tile01_${id}`, cc.SpriteFrame);
    if (spriteFrame) {
      this.tileSprite.spriteFrame = spriteFrame;

      this.node.setContentSize(this.node.width * gi.tileScale, this.node.height * gi.tileScale);

      for (const node of this.node.children) {
        node.setContentSize(node.width * gi.tileScale, node.height * gi.tileScale);
      }
    }
  }

  setRanks(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  setTier(tier: number) {
    this.tier = tier;
  }

  /** 选中 */
  selected() {
    this.tileMask.node.active = true;
    this.tileSelected.node.active = true;
    (cc.tween(this.tileSelected.node) as cc.Tween).to(0.7, { opacity: 100 }).to(0.7, { opacity: 255 }).union().repeatForever().start();
  }

  /** 取消选中 */
  unSelected() {
    this.tileMask.node.active = false;
    this.tileSelected.node.active = false;

    this.tileSelected.node.stopAllActions();
  }

  scaleSelected() {
    this.node.stopAllActions();
    (cc.tween(this.node) as cc.Tween).to(0.07, { scale: 0.9 }, { easing: 'smooth' }).to(0.1, { scale: 1.05 }, { easing: 'backInOut' }).to(0.06, { scale: 1 }, { easing: 'backInOut' }).start();
  }

  /** 无法选中 */
  cannoSelected() {
    const now = cc.director.getTotalTime();
    if (now - this.lastTime >= 400) {
      gi.Event.emit('toast', this.node);
      this.lastTime = now;
      const originPos = this.node.getPosition();
      (cc.tween(this.node) as cc.Tween)
        .to(0.02, { position: cc.v2(this.node.x - 10, this.node.y) })
        .to(0.02, { position: cc.v2(this.node.x + 10, this.node.y) })
        .to(0.01, { position: originPos })
        .union()
        .repeat(8)
        .start();
    }
  }

  onTouchStart(e: cc.Event.EventTouch) {
    gi.Event.emit('touchStart', this);
  }
}
