import EventManager from './Common/EventManager';
const { ccclass, property } = cc._decorator;

@ccclass
export default class GeneratingPointControl extends cc.Component {
  @property({ type: cc.Prefab, tooltip: 'TileNode的预制体' })
  TilePrefab: cc.Prefab = null;

  onLoad() {
    // this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  onTouchStart(event: cc.Event.EventTouch) {
    EventManager.emit('generate');
  }
}
