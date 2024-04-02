import PointControl from './PointControl';
import { InitialMap, PointWidth, PointHeight, PointGap, InitiaRowCount, InitiaColCount, GameAreaWidth, GameAreaHeight } from './GameConfig';
import { flat } from './Utils';
import LineControl from './LineControl';
import FingerControl from './FingerControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
  @property({ type: cc.Prefab, tooltip: '点的预设体' })
  PointPrefab: cc.Prefab = null;

  @property({ type: cc.Prefab, tooltip: '线的预设体' })
  LinePrefab: cc.Prefab = null;

  @property({ type: FingerControl, tooltip: '手指' })
  Finger: FingerControl = null;

  /** 至少触摸了一个PointNode、连接PointNode中 */
  InJoinPoint: boolean = false;

  /** 当前连线的类型 */
  LineType: number = -1;
  /** 所有LineNode */
  LineNodes: cc.Node[] = [];

  /** 所有PointNode，不管有没有被连接 */
  PointNodes: cc.Node[][] = [];
  /** 所有PointNode根据id的映射，不管有没有被连接 */
  PointNodeMap: Map<number, cc.Node> = new Map([]);

  /** 所有已经被连接的PointNode */
  SelectedPointNodes: cc.Node[] = [];
  /** 所有已经被连接的PointNode根据id的映射 */
  SelectedPointNodeMap: Map<number, cc.Node> = new Map([]);

  /** 最后一个被连接着的PointNode */
  get LastPointNode() {
    return this.SelectedPointNodes[this.SelectedPointNodes.length - 1] || null;
  }

  /** 倒数第二个被连接着的PointNode，相当于回退点 */
  get BackspacePoint() {
    return this.SelectedPointNodes[this.SelectedPointNodes.length - 2] || null;
  }

  onLoad() {
    this.CreateGame();
    this.RunFinger();
  }

  CreateGame() {
    this.node.width = GameAreaWidth;
    this.node.height = GameAreaHeight;
    this.GeneratePoints(InitialMap);
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  /** 手指划动动画 */
  RunFinger() {
    this.Finger.Init(this.GetPointPos(0, 1), this.GetPointPos(3, 1));
  }

  onTouchStart(event: cc.Event.EventTouch) {
    // 查找触摸位置处有没有节点，有的话拿到它进行后续操作
    const PointNode = flat<cc.Node>(this.PointNodes).find(PointNode => {
      return this.TouchInPointNodeArea(event, PointNode);
    });
    if (PointNode) {
      this.ApplyJoin(PointNode);
    }
    event.stopPropagation();
  }

  onTouchMove(event: cc.Event.EventTouch) {
    // 查找触摸位置处有没有节点，有的话拿到它进行后续操作
    const PointNode = flat<cc.Node>(this.PointNodes).find(PointNode => {
      return this.TouchInPointNodeArea(event, PointNode);
    });
    if (PointNode) {
      this.ApplyJoin(PointNode);
    }
    event.stopPropagation();
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    if (this.SelectedPointNodes.length >= 2) {
      // 如果此时已经选择的PointNode至少有两个，那么执行消除操作
      this.Eliminate();
      this.Reset();
    } else if (this.SelectedPointNodes.length === 1) {
      // 如果不满足消除操作的条件，但是又有一个PointNode在里面的话得重置状态
      this.UnJoin(this.SelectedPointNodes[0]);
      this.Reset();
    } else {
      this.InJoinPoint = false;
    }
  }

  /** 判断是否可以连接 */
  ApplyJoin(PointNode: cc.Node) {
    this.InJoinPoint = true;
    const Point = PointNode.getComponent(PointControl);
    /** 是否是第一个连接的PointNode */
    const IsFirst = this.SelectedPointNodes.length === 0;
    /** 是否已经被选中了 */
    const IsSelect = Point.isSelect;
    /** 处理第一个选中的节点 */
    if (IsFirst) {
      this.LineType = PointNode.getComponent(PointControl).type;
      this.Join(PointNode);
      return;
    }
    // 连线的PointNode是不是和LastPointNode相邻
    if (!this.IsAdjoinPointNode(PointNode)) return;
    // 连线的PointNode是不是当前连线的类型
    if (this.LineType !== Point.type) return;

    // 如果申请连接的PointNode已经是连接状态时
    if (IsSelect) {
      if (this.BackspacePoint && Point.id === this.BackspacePoint.getComponent(PointControl).id) {
        /** 处理回退 */
        this.UnDrawLine(PointNode, this.LastPointNode);
        this.UnJoin(this.LastPointNode);
      }
      return;
    }
    // 处理连线
    this.DrawLine(this.LineType, this.LastPointNode, PointNode);
    this.Join(PointNode);
  }

  /** 连接PointNode */
  Join(PointNode: cc.Node) {
    const Point = PointNode.getComponent(PointControl);
    this.SelectedPointNodes.push(PointNode);
    this.SelectedPointNodeMap.set(Point.id, PointNode);
    Point.Select();
  }

  /** 连接LineNode，画线段 */
  DrawLine(type: number, BeginPointNode: cc.Node, EndPointNode: cc.Node) {
    const LineNode = cc.instantiate(this.LinePrefab);
    const Line = LineNode.getComponent(LineControl);
    Line.Init(type, BeginPointNode, EndPointNode, this.node);
    this.LineNodes.push(LineNode);
  }

  /** 回退时取消连接PointNode */
  UnJoin(PointNode: cc.Node) {
    const Point = PointNode.getComponent(PointControl);
    this.SelectedPointNodes.pop();
    this.SelectedPointNodeMap.delete(Point.id);
    Point.unSelect();
  }

  /** 回退时移除线段 */
  UnDrawLine(BackBeginPointNode: cc.Node, BackEndPointNode: cc.Node) {
    const LineNode = this.LineNodes.pop();
    if (LineNode) {
      const BackBeginPoint = BackBeginPointNode.getComponent(PointControl);
      const BackEndPoint = BackEndPointNode.getComponent(PointControl);
      const Line = LineNode.getComponent(LineControl);
      const BeginPoint = Line.BeginPointNode.getComponent(PointControl);
      const EndPoint = Line.EndPointNode.getComponent(PointControl);
      if (BackBeginPoint.id === BeginPoint.id && BackEndPoint.id === EndPoint.id) {
        Line.Remove();
      }
    }
  }

  /** 执行消除操作 */
  Eliminate() {
    this.SelectedPointNodeMap.forEach((PointNode, PointId) => {
      const Point = PointNode.getComponent(PointControl);
      this.PointNodes[Point.row][Point.col] = null;
      this.PointNodeMap.delete(PointId);
      this.SelectedPointNodeMap.delete(PointId);
      Point.Remove();
    });
    this.SelectedPointNodes.forEach(PointNode => {
      this.Collapse(PointNode);
    });
    this.FillBlank();
  }

  /** PointNode被消除时，其上所有PointNode往下落，总体逻辑就是：先找到被消除PointNode所处列最低的落点，然后从自己开始往上遍历将所有PointNode下落 */
  Collapse(PointNode: cc.Node) {
    const Point = PointNode.getComponent(PointControl);
    /** 在执行Collapse，所有连接中的PointNode都已经从PointNodes里面Remove掉了，如果这里发现还不为null的话。
     * 意味着这一列已经完成了Collapse操作，此时这个位置是原本上层的PointNode下落后填补的。那就不需要再往下走了
     */
    if (this.PointNodes[Point.row][Point.col] !== null) return;

    /** 当前PointNode所处列应该下落到的最低点的行数 */
    let collapseRow = Point.row;
    while (collapseRow + 1 <= InitiaRowCount - 1) {
      if (this.PointNodes[collapseRow + 1][Point.col] !== null && this.PointNodes[collapseRow][Point.col] === null) {
        break;
      }
      collapseRow++;
    }

    /** 用来遍历上层的PointNode */
    let riseRow = Point.row;
    while (--riseRow >= 0) {
      // 如果找到了不为null的PointNode，也就意味着这个PointNode需要下落到当前最低点的行数
      if (this.PointNodes[riseRow][Point.col] !== null) {
        const CollapsePointNode = this.PointNodes[riseRow][Point.col];
        const CollapsePoint = CollapsePointNode.getComponent(PointControl);

        // 播放下落动画
        CollapsePoint.PlayFallAnimation(this.GetPointPos(collapseRow, Point.col));
        // 下落完成后改变行数
        CollapsePoint.row = collapseRow;
        // 将下落前所处的位置，置null
        this.PointNodes[riseRow][Point.col] = null;
        // 然后设置到新的位置
        this.PointNodes[collapseRow][Point.col] = CollapsePointNode;
        // 最低点行数得往上一行了
        collapseRow--;
      }
    }
  }

  /** 完成消除操作后填充空白 */
  FillBlank() {
    const GeneratePointNodes: number[][] = [];
    this.PointNodes.forEach((rowPointNodes, row) => {
      rowPointNodes.forEach((PointNode, col) => {
        if (GeneratePointNodes[row] === undefined) GeneratePointNodes[row] = [];
        if (PointNode !== null) {
          GeneratePointNodes[row][col] = 0;
        } else {
          GeneratePointNodes[row][col] = Math.floor(Math.random() * 5 + 1);
        }
      });
    });
    this.GeneratePoints(GeneratePointNodes);
  }

  /** 打印当前节点布局 */
  LogMap() {
    let map = '';
    this.PointNodes.forEach((rowPointNodes, row) => {
      rowPointNodes.forEach((PointNode, col) => {
        const Tab = PointNode ? PointNode.getComponent(PointControl).type : 'n';
        map += `${Tab}${col < InitiaColCount - 1 ? ' ' : '\n'}`;
      });
    });
    console.log(map);
  }

  /** 重置游戏状态 */
  Reset() {
    /** 重置PointNode相关 */
    this.SelectedPointNodes.length = 0;
    this.SelectedPointNodeMap.clear();

    /** 重置LineNode相关 */
    this.LineType = -1;
    this.LineNodes.forEach(LineNode => LineNode.getComponent(LineControl).Remove());
    this.LineNodes.length = 0;

    /** 处理完所有状态的重置后，放开连线权限 */
    this.InJoinPoint = false;
  }

  /** 是否与最后被选择的PointNode相邻 */
  IsAdjoinPointNode(PointNode: cc.Node) {
    const Point = PointNode.getComponent(PointControl);
    const LastPoint = this.LastPointNode.getComponent(PointControl);
    const isAdjoin = Math.abs(Point.row + Point.col - (LastPoint.row + LastPoint.col)) === 1;
    return isAdjoin;
  }

  /** 判断触摸位置是否在某个PointNode节点区域内 */
  TouchInPointNodeArea(event: cc.Event.EventTouch, node: cc.Node) {
    if (node === null) return;
    // 获取触摸点在世界坐标系中的位置
    const touchPos = event.getLocation();
    // 获取节点在世界坐标系中的包围盒
    const boundingBox = node.getBoundingBoxToWorld();
    // 判断触摸点是否在节点的区域内
    if (boundingBox.contains(touchPos)) return true;
  }

  /** 根据传入的数字类型二维数组Map生成PointNode */
  GeneratePoints(Map: number[][]) {
    if (Map.length > InitiaRowCount) return '超出行数，不予生成';
    Map.forEach((rowPoints, row) => {
      rowPoints.forEach((type, col) => {
        if (col + 1 > InitiaColCount) return '超出列数，不予生成';
        // type为0意味着这个位置不应该生成PointNode
        if (type === 0) return;
        const PointNode = cc.instantiate(this.PointPrefab);
        const Point = PointNode.getComponent(PointControl);
        Point.Init(type, row, col, this.GetPointPos(row, col), this.node);
        if (this.PointNodes[row] === undefined) this.PointNodes[row] = [];
        this.PointNodes[row][col] = PointNode;
        this.PointNodeMap.set(Point.id, PointNode);
      });
    });
  }

  /** 获取指定行、列的PointNode的位置 */
  GetPointPos(row, col): cc.Vec2 {
    const BeginX = this.node.x - this.node.width / 2 + PointWidth / 2;
    const BeginY = this.node.y + this.node.height / 2 - PointHeight / 2;
    const targetX = BeginX + col * (PointWidth + PointGap);
    const targetY = BeginY - row * (PointHeight + PointGap);
    return cc.v2(targetX, targetY);
  }
}
