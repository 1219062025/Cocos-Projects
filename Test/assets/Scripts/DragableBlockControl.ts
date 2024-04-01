import FixedCellControl from './FixedCellControl';
import { getNodeWorldPosition } from './Utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class DragableBlocControl extends cc.Component {
  /** 方块的唯一id */
  id = null;

  /** 方块成功发生碰撞的格子的id */
  OtherCellId = null;

  /** 与该方块有效碰撞中的格子里面最短的一个距离 */
  minDistance = Infinity;

  /** 有效碰撞距离 */
  EffDistance = Infinity;

  onLoad() {
    // 开启碰撞检测，开启后碰撞不断发生时会持续调用回调函数onCollisionStay
    cc.director.getCollisionManager().enabled = true;
    this.EffDistance = this.node.getComponent(cc.CircleCollider).radius * 0.8;
  }

  /** 发送成功碰撞事件 */
  emitCollider() {
    /** 所有同属于一个区域的方块当前成功碰撞的格子id的集合 */
    const colliderCellIdList = [];

    // 每当某个方块进行了一次成功碰撞，都遍历所属区域所有方块，将所有方块此时发生成功碰撞的格子的id合为数组发送给区域节点进行检测
    const Event = new cc.Event.EventCustom('UpdateCollider', true);
    this.node.parent.children.forEach(HexagonNode => {
      const OtherCellId = HexagonNode.getComponent(DragableBlocControl).OtherCellId;
      if (OtherCellId !== null) colliderCellIdList.push(OtherCellId);
    });

    Event.setUserData(colliderCellIdList);
    this.node.dispatchEvent(Event);
  }

  onCollisionStay(other: cc.CircleCollider, self: cc.CircleCollider) {
    // 碰撞到的是格子的话
    if (other.tag == 1) {
      const HexagonCell = other.node.getComponent(FixedCellControl);
      /** 方块与碰撞中的格子的距离（欧式距离） */
      const distance = cc.Vec2.distance(getNodeWorldPosition(other.node), getNodeWorldPosition(self.node));
      // 判断方块与格子碰撞时是不是处于有效距离以内
      if (distance < this.EffDistance) {
        // 如果当前与方块碰撞的格子进入有效距离，并且没有比当前的格子碰撞距离更短的了，则视作当前格子与方块发生了一次成功的碰撞，保存碰撞的格子id，同时发送事件通知外部
        this.minDistance = Math.min(this.minDistance, distance);
        if (distance > this.minDistance) return;
        this.OtherCellId = HexagonCell.id;
        this.emitCollider();
      } else if (this.OtherCellId === HexagonCell.id) {
        // 如果当前与方块成功碰撞的格子离开了有效距离，那就重置最短距离minDistance，不然后面的格子都没法计入了。同时把OtherCellId也重置了，最后发送事件通知外部
        this.minDistance = Infinity;
        this.OtherCellId = null;
        this.emitCollider();
      }
    }
  }
}
