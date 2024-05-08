/** 存储触摸点以及触摸点与其他点之间位置关系的类 */
export class TouchPosInfo {
  /** 触摸开始时的位置 */
  begin: cc.Vec2 = null;
  move: cc.Vec2 = null;
  /** 触摸点与UnitNode的相对位置 */
  offsetUnitNode: cc.Vec2 = cc.v2(0, 0);
  /** 触摸点与提示区域的相对位置 */
  offsetSelect: cc.Vec2 = null;

  /** 触摸开始，保存触摸开始的位置 */
  BeginTouch(pos: cc.Vec2) {
    this.begin = pos;
  }

  /** 检查触摸移动中的点与触摸开始的点是否满足交换条件，是的话返回从apply指向target的单位向量，否则为undefined */
  TouchMove(pos: cc.Vec2) {
    this.move = pos;
    // const directionVD = this.move.sub(this.begin);
    // if (directionVD.len() < 30) return;
    // if (Math.abs(directionVD.x) > Math.abs(directionVD.y)) {
    //   return directionVD.x > 0 ? cc.v2(1, 0) : cc.v2(-1, 0);
    // } else if (Math.abs(directionVD.x) < Math.abs(directionVD.y)) {
    //   return directionVD.y > 0 ? cc.v2(0, 1) : cc.v2(0, -1);
    // }
    // return;
  }

  clear() {
    this.begin = null;
    this.move = null;
  }
}
