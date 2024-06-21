export default class Node<T> {
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

  get leftX() {
    return this.x - this.width / 2;
  }

  get rightX() {
    return this.x + this.width / 2;
  }

  get bottomY() {
    return this.y - this.height / 2;
  }

  get topY() {
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
