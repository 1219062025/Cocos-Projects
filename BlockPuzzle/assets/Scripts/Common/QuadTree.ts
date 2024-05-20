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
  SubDivideTree() {
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
    //   const CanvasPost = cc.Canvas.instance.node.convertToNodeSpaceAR(cc.v2(tree.LeftX, tree.BottomY));
    //   this.ctx.rect(CanvasPost.x, CanvasPost.y, tree.width, tree.height);
    //   this.ctx.stroke();
    // });
    /** ___DEBUG END___ */
  }

  /** 进行细分节点操作 */
  SubDivideNode() {
    /** 将当前子树的node信息插入到对应象限子树中 */
    this.nodes.forEach(node => {
      this.Insert(node);
    });
    /** 插入后当前子树的数据信息就没必要保存了，因为已经不是叶子节点了 */
    this.nodes.clear();
  }

  /** 插入节点 */
  Insert(node: QuadNode<T>) {
    /** 当前追踪的子树 */
    let CurrentTree: QuadTree<T> = this;

    // 不断的循环以确定新插入的节点应该插入到哪个子树
    while (!CurrentTree.isLeaf()) {
      /** 第一象限子树 */
      const TopRightTree = CurrentTree.subtree[0];
      /** 第二象限子树 */
      const TopLeftTree = CurrentTree.subtree[1];
      /** 第三象限子树 */
      const BottomLeftTree = CurrentTree.subtree[2];
      /** 第四象限子树 */
      const BottomRightTree = CurrentTree.subtree[3];

      const TopRightTreeRect = new cc.Rect(TopRightTree.LeftX, TopRightTree.BottomY, TopRightTree.width, TopRightTree.height);
      const TopLeftTreeRect = new cc.Rect(TopLeftTree.LeftX, TopLeftTree.BottomY, TopLeftTree.width, TopLeftTree.height);
      const BottomLeftTreeRect = new cc.Rect(BottomLeftTree.LeftX, BottomLeftTree.BottomY, BottomLeftTree.width, BottomLeftTree.height);
      const BottomRightTreeRect = new cc.Rect(BottomRightTree.LeftX, BottomRightTree.BottomY, BottomRightTree.width, BottomRightTree.height);

      if (TopRightTreeRect.contains(cc.v2(node.x, node.y))) {
        // 在第一象限子树内
        CurrentTree = TopRightTree;
      } else if (TopLeftTreeRect.contains(cc.v2(node.x, node.y))) {
        // 在第二象限子树内
        CurrentTree = TopLeftTree;
      } else if (BottomLeftTreeRect.contains(cc.v2(node.x, node.y))) {
        // 在第三象限子树内
        CurrentTree = BottomLeftTree;
      } else if (BottomRightTreeRect.contains(cc.v2(node.x, node.y))) {
        // 在第四象限子树内
        CurrentTree = BottomRightTree;
      } else {
        break;
      }
      // if (node.x > TopRightTree.LeftX && node.y > TopRightTree.BottomY) {
      //   // 在第一象限子树内
      //   CurrentTree = TopRightTree;
      // } else if (node.x < TopLeftTree.RightX && node.y > TopLeftTree.BottomY) {
      //   // 在第二象限子树内
      //   CurrentTree = TopLeftTree;
      // } else if (node.x < BottomLeftTree.RightX && node.y < BottomLeftTree.TopY) {
      //   // 在第三象限子树内
      //   CurrentTree = BottomLeftTree;
      // } else if (node.x > BottomRightTree.LeftX && node.y < BottomRightTree.TopY) {
      //   // 在第四象限子树内
      //   CurrentTree = BottomRightTree;
      // }
    }

    // 当前面的循环完毕后得到目标子树，数据信息插入到该子树中
    CurrentTree.nodes.add(node);
    // 检查插入之后该子树所容纳的数据量是否超出了maxLen，如果是的话需要细分成更小的四叉树，否则结束
    if (CurrentTree.isRequiresSubDivide()) {
      CurrentTree.SubDivideTree();
      CurrentTree.SubDivideNode();
    }
  }

  /** 搜索节点 */
  Search(x: number, y: number) {
    /** 当前追踪的子树 */
    let CurrentTree: QuadTree<T> = this;

    // 不断的循环查询目标位置属于哪个象限的子树
    while (!CurrentTree.isLeaf()) {
      /** 第一象限子树 */
      const TopRightTree = CurrentTree.subtree[0];
      /** 第二象限子树 */
      const TopLeftTree = CurrentTree.subtree[1];
      /** 第三象限子树 */
      const BottomLeftTree = CurrentTree.subtree[2];
      /** 第四象限子树 */
      const BottomRightTree = CurrentTree.subtree[3];

      const TopRightTreeRect = new cc.Rect(TopRightTree.LeftX, TopRightTree.BottomY, TopRightTree.width, TopRightTree.height);
      const TopLeftTreeRect = new cc.Rect(TopLeftTree.LeftX, TopLeftTree.BottomY, TopLeftTree.width, TopLeftTree.height);
      const BottomLeftTreeRect = new cc.Rect(BottomLeftTree.LeftX, BottomLeftTree.BottomY, BottomLeftTree.width, BottomLeftTree.height);
      const BottomRightTreeRect = new cc.Rect(BottomRightTree.LeftX, BottomRightTree.BottomY, BottomRightTree.width, BottomRightTree.height);

      if (TopRightTreeRect.contains(cc.v2(x, y))) {
        // 在第一象限子树内
        CurrentTree = TopRightTree;
      } else if (TopLeftTreeRect.contains(cc.v2(x, y))) {
        // 在第二象限子树内
        CurrentTree = TopLeftTree;
      } else if (BottomLeftTreeRect.contains(cc.v2(x, y))) {
        // 在第三象限子树内
        CurrentTree = BottomLeftTree;
      } else if (BottomRightTreeRect.contains(cc.v2(x, y))) {
        // 在第四象限子树内
        CurrentTree = BottomRightTree;
      } else {
        break;
      }
      // if (x > TopRightTree.LeftX && y > TopRightTree.BottomY && x < TopRightTree.RightX && y < TopRightTree.TopY) {
      //   // 在第一象限子树内
      //   CurrentTree = TopRightTree;
      // } else if (x < TopLeftTree.RightX && y > TopLeftTree.BottomY && x > TopLeftTree.LeftX && y < TopLeftTree.TopY) {
      //   // 在第二象限子树内
      //   CurrentTree = TopLeftTree;
      // } else if (x < BottomLeftTree.RightX && y < BottomLeftTree.TopY && x > BottomLeftTree.LeftX && y > BottomLeftTree.BottomY) {
      //   // 在第三象限子树内
      //   CurrentTree = BottomLeftTree;
      // } else if (x > BottomRightTree.LeftX && y < BottomRightTree.TopY && x < BottomRightTree.RightX && y > BottomRightTree.BottomY) {
      //   // 在第四象限子树内
      //   CurrentTree = BottomRightTree;
      // } else {
      //   break;
      // }
    }

    /** ___DEBUG START___ */
    // this.ctx.node.zIndex = 100000;
    // const rect = new cc.Rect(CurrentTree.LeftX, CurrentTree.BottomY, CurrentTree.width, CurrentTree.height);
    // this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
    // this.ctx.stroke();
    /** ___DEBUG END___ */

    // 当前面的循环完毕后得到目标子树，然后将子树中存储的数据返回回去
    const matchedNodes: Array<T> = [];
    CurrentTree.nodes.forEach(node => {
      matchedNodes.push(node.data);
    });
    return matchedNodes;
  }
}
