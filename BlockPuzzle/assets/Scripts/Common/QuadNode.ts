export default class QuadNode<T> {
  /** 数据节点中点x轴 */
  x: number;
  /** 数据节点中点y轴 */
  y: number;
  /** 数据节点宽度 */
  width: number;
  /** 数据节点高度 */
  height: number;
  /** 存储的数据 */
  data: T;

  get LeftX() {
    return this.x - this.width / 2;
  }

  get RightX() {
    return this.x + this.width / 2;
  }

  get BottomY() {
    return this.y - this.height / 2;
  }

  get TopY() {
    return this.y + this.height / 2;
  }

  constructor(x: number, y: number, width: number, height: number, data: T) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.data = data;
  }
}
