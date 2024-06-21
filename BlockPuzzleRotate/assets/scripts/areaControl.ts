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
    gi.EventManager.on('toggle', this.onToggle, this);
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onTouchStart(event: cc.Event.EventTouch) {
    /** ___DEBUG START___ */
    if (!this.isAccordGuide()) return;
    /** ___DEBUG END___ */

    const area = this.node;
    const chunkNode = area.getChildByName('chunk');
    area.setSiblingIndex(10);
    if (chunkNode) {
      if (this.isChecked) {
        if (!this.chunk.data.rotations) return;
        const id = this.chunk.data.rotations['90'];
        const chunkData = gi.getChunk(id);
        (cc.tween(this.chunk.node) as cc.Tween)
          .by(0.2, { angle: -90 })
          .call(() => {
            const chunk = this.chunkBuilder(chunkData).ctrl;

            chunk.setType(this.chunk.getType());
            this.chunk.node.destroy();
            this.setChunk(chunk);
            chunk.setArea(this);

            chunk.node.setScale(0.6);
            chunk.node.setParent(this.node);
            chunk.node.setPosition(0, 0);
          })
          .start();

        gi.EventManager.emit('rotate');
      } else {
        const TouchPos = event.getLocation();
        const TouchInParent = area.convertToNodeSpaceAR(TouchPos);
        const position = cc.v2(TouchInParent.x, TouchInParent.y + 100);
        (cc.tween(chunkNode) as cc.Tween).to(0.03, { scale: 1, position }).start();
        const chunk = chunkNode.getComponent(ChunkControl);

        gi.EventManager.emit('touchStart', chunk);
      }
    }
    event.stopPropagation();
  }

  /** ___DEBUG START___ */
  isAccordGuide() {
    if (!gi.Guide.inGuide) return true;

    if (gi.Guide.step === 1) {
      if (this.id === 0) return true;
    }
    if (gi.Guide.step === 3) {
      if (this.id === 1) return true;
    }
    if (gi.Guide.step === 5) {
      if (this.id === 1) return true;
    }
  }
  /** ___DEBUG END___ */

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
