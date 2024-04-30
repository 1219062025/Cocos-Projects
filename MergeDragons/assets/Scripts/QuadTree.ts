import QuadNode from './QuadNode';

export default class QuadTree<QuadNode> {
  /** 四叉树中点x轴 */
  x: number;
  /** 四叉树中点y轴 */
  y: number;
  /** 四叉树宽度 */
  width: number;
  /** 四叉树高度 */
  height: number;
  /** 当前树包含的数据 */
  nodes: Set<QuadNode>;
  /** 子树集合 */
  subtree: QuadTree<QuadNode>[];
  /** 每颗子树所框画的范围内至多可以有的数据量 */
  maxLen: number;

  constructor(x: number, y: number, width: number, height: number, maxLen: number) {
    if (maxLen <= 0) throw new Error('树区域限制数量不可小于或等于0');
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.maxLen = maxLen;
    this.nodes = new Set<QuadNode>([]);
  }

  isLeaf() {
    return this.subtree.length === 0;
  }

  isRequiresSubDivide() {
    return this.nodes.size > this.maxLen;
  }

  SubDivide() {
    const subWidth = this.width / 2;
    const subHeight = this.height / 2;
    const { x: midX, y: midY } = this;
    // 细分子树，按照坐标轴象限顺序创建子树
    /**
     * 1 | 0
     * -----
     * 2 | 3
     */
    [
      [midX + subWidth / 2, midY + subHeight / 2, subWidth, subHeight, this.maxLen],
      [midX - subWidth / 2, midY + subHeight / 2, subWidth, subHeight, this.maxLen],
      [midX - subWidth / 2, midY - subHeight / 2, subWidth, subHeight, this.maxLen],
      [midX + subWidth / 2, midY - subHeight / 2, subWidth, subHeight, this.maxLen]
    ].forEach(([x, y, width, height, maxLen]) => {
      this.subtree.push(new QuadTree<QuadNode>(x, y, width, height, maxLen));
    });
  }

  Insert(D: QuadNode) {
    if (this.isRequiresSubDivide()) 1;
  }
}
