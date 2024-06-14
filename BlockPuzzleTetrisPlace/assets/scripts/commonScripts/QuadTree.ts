import QuadNode from './QuadNode';

export default class QuadTree<T> {
  /** 四叉树中点x轴 */
  x: number;
  /** 四叉树中点y轴 */
  y: number;
  /** 四叉树宽度 */
  width: number;
  /** 四叉树高度 */
  height: number;
  /** 当前树包含的数据 */
  nodes: Set<QuadNode<T>>;
  /** 子树集合 */
  subtree: QuadTree<T>[] = [];
  /** 每颗子树所框画的范围内至多可以有的数据量 */
  maxLen: number;

  /** ___DEBUG START___ */
  ctx: cc.Graphics = null;
  /** ___DEBUG END___ */

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

  /** x、y坐标需要传入中点坐标而不是左下角坐标。maxLen代表一个子树所能容纳的最大数据量 */
  constructor(x: number, y: number, width: number, height: number, maxLen: number, ctx: cc.Graphics) {
    if (maxLen <= 0) throw new Error('创建QuadTree实例时，传入的maxLen树区域容纳数据量不可小于或等于0');
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.maxLen = maxLen;
    this.nodes = new Set<QuadNode<T>>([]);
    /** ___DEBUG START___ */
    this.ctx = ctx;
    /** ___DEBUG END___ */
  }

  /** 是否是叶子节点树 */
  isLeaf() {
    return this.subtree.length === 0;
  }

  /** 是否需要继续细分 */
  isRequiresSubDivide() {
    return this.nodes.size > this.maxLen;
  }

  /** 进行细分子树操作 */
  subDivideTree() {
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
      this.subtree.push(new QuadTree<T>(x, y, width, height, maxLen, this.ctx));
    });

    /** ___DEBUG START___ */
    // this.ctx.node.zIndex = 100;
    // this.subtree.forEach(tree => {
    //   const CanvasPost = cc.Canvas.instance.node.convertToNodeSpaceAR(cc.v2(tree.leftX, tree.bottomY));
    //   this.ctx.rect(CanvasPost.x, CanvasPost.y, tree.width, tree.height);
    //   this.ctx.stroke();
    // });
    /** ___DEBUG END___ */
  }

  /** 进行细分节点操作 */
  subDivideNode() {
    /** 将当前子树的node信息插入到对应象限子树中 */
    this.nodes.forEach(node => {
      this.insert(node);
    });
    /** 插入后当前子树的数据信息就没必要保存了，因为已经不是叶子节点了 */
    this.nodes.clear();
  }

  /** 插入节点 */
  insert(node: QuadNode<T>) {
    /** 当前追踪的子树 */
    let currentTree: QuadTree<T> = this;

    // 不断的循环以确定新插入的节点应该插入到哪个子树
    while (!currentTree.isLeaf()) {
      /** 第一象限子树 */
      const topRightTree = currentTree.subtree[0];
      /** 第二象限子树 */
      const topLeftTree = currentTree.subtree[1];
      /** 第三象限子树 */
      const bottomLeftTree = currentTree.subtree[2];
      /** 第四象限子树 */
      const bottomRightTree = currentTree.subtree[3];

      const topRightTreeRect = new cc.Rect(topRightTree.leftX, topRightTree.bottomY, topRightTree.width, topRightTree.height);
      const topLeftTreeRect = new cc.Rect(topLeftTree.leftX, topLeftTree.bottomY, topLeftTree.width, topLeftTree.height);
      const bottomLeftTreeRect = new cc.Rect(bottomLeftTree.leftX, bottomLeftTree.bottomY, bottomLeftTree.width, bottomLeftTree.height);
      const bottomRightTreeRect = new cc.Rect(bottomRightTree.leftX, bottomRightTree.bottomY, bottomRightTree.width, bottomRightTree.height);

      if (topRightTreeRect.contains(cc.v2(node.x, node.y))) {
        // 在第一象限子树内
        currentTree = topRightTree;
      } else if (topLeftTreeRect.contains(cc.v2(node.x, node.y))) {
        // 在第二象限子树内
        currentTree = topLeftTree;
      } else if (bottomLeftTreeRect.contains(cc.v2(node.x, node.y))) {
        // 在第三象限子树内
        currentTree = bottomLeftTree;
      } else if (bottomRightTreeRect.contains(cc.v2(node.x, node.y))) {
        // 在第四象限子树内
        currentTree = bottomRightTree;
      } else {
        break;
      }
      // if (node.x > topRightTree.leftX && node.y > topRightTree.bottomY) {
      //   // 在第一象限子树内
      //   currentTree = topRightTree;
      // } else if (node.x < topLeftTree.rightX && node.y > topLeftTree.bottomY) {
      //   // 在第二象限子树内
      //   currentTree = topLeftTree;
      // } else if (node.x < bottomLeftTree.rightX && node.y < bottomLeftTree.topY) {
      //   // 在第三象限子树内
      //   currentTree = bottomLeftTree;
      // } else if (node.x > bottomRightTree.leftX && node.y < bottomRightTree.topY) {
      //   // 在第四象限子树内
      //   currentTree = bottomRightTree;
      // }
    }

    // 当前面的循环完毕后得到目标子树，数据信息插入到该子树中
    currentTree.nodes.add(node);
    // 检查插入之后该子树所容纳的数据量是否超出了maxLen，如果是的话需要细分成更小的四叉树，否则结束
    if (currentTree.isRequiresSubDivide()) {
      currentTree.subDivideTree();
      currentTree.subDivideNode();
    }
  }

  /** 搜索节点 */
  search(x: number, y: number) {
    /** 当前追踪的子树 */
    let currentTree: QuadTree<T> = this;

    // 不断的循环查询目标位置属于哪个象限的子树
    while (!currentTree.isLeaf()) {
      /** 第一象限子树 */
      const topRightTree = currentTree.subtree[0];
      /** 第二象限子树 */
      const topLeftTree = currentTree.subtree[1];
      /** 第三象限子树 */
      const bottomLeftTree = currentTree.subtree[2];
      /** 第四象限子树 */
      const bottomRightTree = currentTree.subtree[3];

      const topRightTreeRect = new cc.Rect(topRightTree.leftX, topRightTree.bottomY, topRightTree.width, topRightTree.height);
      const topLeftTreeRect = new cc.Rect(topLeftTree.leftX, topLeftTree.bottomY, topLeftTree.width, topLeftTree.height);
      const bottomLeftTreeRect = new cc.Rect(bottomLeftTree.leftX, bottomLeftTree.bottomY, bottomLeftTree.width, bottomLeftTree.height);
      const bottomRightTreeRect = new cc.Rect(bottomRightTree.leftX, bottomRightTree.bottomY, bottomRightTree.width, bottomRightTree.height);

      if (topRightTreeRect.contains(cc.v2(x, y))) {
        // 在第一象限子树内
        currentTree = topRightTree;
      } else if (topLeftTreeRect.contains(cc.v2(x, y))) {
        // 在第二象限子树内
        currentTree = topLeftTree;
      } else if (bottomLeftTreeRect.contains(cc.v2(x, y))) {
        // 在第三象限子树内
        currentTree = bottomLeftTree;
      } else if (bottomRightTreeRect.contains(cc.v2(x, y))) {
        // 在第四象限子树内
        currentTree = bottomRightTree;
      } else {
        break;
      }
      // if (x > topRightTree.leftX && y > topRightTree.bottomY && x < topRightTree.rightX && y < topRightTree.topY) {
      //   // 在第一象限子树内
      //   currentTree = topRightTree;
      // } else if (x < topLeftTree.rightX && y > topLeftTree.bottomY && x > topLeftTree.leftX && y < topLeftTree.topY) {
      //   // 在第二象限子树内
      //   currentTree = topLeftTree;
      // } else if (x < bottomLeftTree.rightX && y < bottomLeftTree.topY && x > bottomLeftTree.leftX && y > bottomLeftTree.bottomY) {
      //   // 在第三象限子树内
      //   currentTree = bottomLeftTree;
      // } else if (x > bottomRightTree.leftX && y < bottomRightTree.topY && x < bottomRightTree.rightX && y > bottomRightTree.bottomY) {
      //   // 在第四象限子树内
      //   currentTree = bottomRightTree;
      // } else {
      //   break;
      // }
    }

    /** ___DEBUG START___ */
    // this.ctx.node.zIndex = 100000;
    // const rect = new cc.Rect(currentTree.leftX, currentTree.bottomY, currentTree.width, currentTree.height);
    // this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
    // this.ctx.stroke();
    /** ___DEBUG END___ */

    // 当前面的循环完毕后得到目标子树，然后将子树中存储的数据返回回去
    const matchedNodes: Array<T> = [];
    currentTree.nodes.forEach(node => {
      matchedNodes.push(node.data);
    });
    return matchedNodes;
  }
}
