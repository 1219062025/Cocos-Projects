import FixedCellAreaControl from './FixedCellAreaControl';
import { setsAreEqual } from './Utils';
const { ccclass, property } = cc._decorator;

@ccclass
export default class DragableBlockAreaControl extends cc.Component {
  @property({ type: FixedCellAreaControl, tooltip: '格子区域的脚本' })
  FixedCellArea: FixedCellAreaControl = null;

  /** 方块区域的缩放 */
  scale: cc.Vec2 | number = cc.v2({ x: 1, y: 1 });

  /** 方块区域原本的位置 */
  originPosition: cc.Vec2 = cc.v2(0, 0);

  /** 当前成功碰撞的格子的id集合 */
  colliderCellIdList: Set<number> = null;

  /** 方块个数 */
  count = 0;

  /** 方块区域是否已经放置到格子中了 */
  isPlace = false;

  onLoad() {
    // 记录可拖动方块区域的原始状态
    this.scale = this.node.getScale(cc.v2());
    this.originPosition = this.node.getPosition();

    // 监听开始拖动事件
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);

    // 监听拖动中事件
    this.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventMouse) => {
      this.node.setPosition(this.node.parent.convertToNodeSpaceAR(event.getLocation()));
    });

    // 监听更新碰撞状态事件
    this.node.on('UpdateCollider', (event: cc.Event.EventCustom) => {
      this.colliderCellIdList = new Set(event.getUserData());
      this.UpdateCollider();
      event.stopPropagation();
    });

    // 监听结束拖动事件
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  /** 拖动开始事件回调 */
  onTouchStart() {
    if (this.isPlace) {
      this.isPlace = false;
      this.FixedCellArea.PickUpBlock(this.colliderCellIdList);
    }
    this.node.setScale(cc.v2({ x: 1, y: 1 }));
    this.node.setSiblingIndex(100);
  }

  /** 结束拖动事件回调 */
  onTouchEnd() {
    if (!this.colliderCellIdList) return;
    /** 方块个数与当前发生了成功碰撞的格子个数是否一致 */
    const isNormal = this.count === this.colliderCellIdList.size;
    if (isNormal) {
      /** 放置方块的动作成功了没有 */
      const succeed = this.FixedCellArea.PlaceBlock(this.colliderCellIdList, this.node.getChildByName('wrap').children);
      // 执行完放置方块后，获取是否成功的标识并设置方块是否放置标识
      this.isPlace = succeed;
      if (succeed === false) this.ResetStatus();
    } else {
      this.ResetStatus();
    }
    this.FixedCellArea.RemoveGhost();
  }

  // 放回原位
  ResetStatus() {
    this.node.setPosition(this.originPosition);
    this.node.setScale(this.scale);
  }

  /** 更新碰撞状态事件回调 */
  UpdateCollider() {
    if (this.count === this.colliderCellIdList.size && this.isPlace === false) {
      this.FixedCellArea.GenerateGhost(this.colliderCellIdList);
    } else {
      this.FixedCellArea.RemoveGhost();
    }
  }
}
