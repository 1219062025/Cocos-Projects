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

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}
