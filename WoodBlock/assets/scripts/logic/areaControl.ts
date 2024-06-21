import ChunkControl from './chunkControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class AreaControl extends cc.Component {
  @property(cc.Node)
  rotateIcon: cc.Node = null;

  @property({ type: cc.Prefab, tooltip: '方块集合预制体' })
  chunkPrefab: cc.Prefab = null;

  @property(cc.Integer)
  id: number = 0;

  chunk: ChunkControl = null;

  isChecked: boolean = false;

  onLoad() {
    gi.Event.on('toggle', this.onToggle, this);
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onTouchStart(event: cc.Event.EventTouch) {
    const area = this.node;
    const chunkNode = area.getChildByName('chunk');
    area.setSiblingIndex(10);

    if (!chunkNode) return;

    if (this.isChecked) {
      if (!this.chunk.data.rotations) return;
      const chunkData = gi.getChunk(this.chunk.data.rotations['90']);
      (cc.tween(this.chunk.node) as cc.Tween)
        .by(0.2, { angle: -90 })
        .call(() => {
          const chunk = this.chunkBuilder(chunkData).ctrl;

          chunk.setType(this.chunk.getType());
          this.chunk.node.destroy();
          this.setChunk(chunk);
          chunk.setArea(this);

          chunk.node.setScale(gi.CHUNKSCALE);
          chunk.node.setParent(this.node);
          chunk.node.setPosition(0, 0);
        })
        .start();
    } else {
      const touchPos = event.getLocation();
      const touchInParent = area.convertToNodeSpaceAR(touchPos);
      const position = cc.v2(touchInParent.x, touchInParent.y + 100);
      (cc.tween(chunkNode) as cc.Tween).to(0.03, { scale: 1, position }).start();
      const chunk = chunkNode.getComponent(ChunkControl);

      gi.Event.emit('touchStart', chunk);
    }
    event.stopPropagation();
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    const area = this.node;
    area.setSiblingIndex(0);
  }

  onToggle(isChecked: boolean) {
    this.isChecked = isChecked;
    if (this.chunk && isChecked) {
      this.rotateIcon.active = true;
      (cc.tween(this.rotateIcon) as cc.Tween).by(0.1, { angle: -10 }).repeatForever().start();
      this.rotateIcon.setSiblingIndex(10);
    } else {
      this.rotateIcon.active = false;
      this.rotateIcon.setSiblingIndex(0);
    }
  }

  /** 设置块到该区域 */
  setChunk(chunk: ChunkControl) {
    this.chunk = chunk;
  }

  /** 块生成器 */
  chunkBuilder(chunkData: gi.ChunkData) {
    const res = gi.prefabBuilder(this.chunkPrefab, ChunkControl);
    res.ctrl.init(chunkData);
    return res;
  }
}
