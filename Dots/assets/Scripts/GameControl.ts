import PointControl from './PointControl';
import { InitialMap, PointWidth, PointHeight, PointGap, InitiaRowCount, InitiaColCount, GameAreaWidth, GameAreaHeight } from './GameConfig';
import { flat, throttle } from './Utils';
import LineControl from './LineControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
  @property({ type: cc.Prefab, tooltip: '点的预设体' })
  PointPrefab: cc.Prefab = null;

  @property({ type: cc.Prefab, tooltip: '线的预设体' })
  LinePrefab: cc.Prefab = null;

  /** 至少触摸了一个PointNode、连接PointNode中 */
  InJoinPoint: boolean = false;

  /** 当前连线的类型 */
  LineType: number = -1;

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
  }

  CreateGame() {
    this.node.width = GameAreaWidth;
    this.node.height = GameAreaHeight;
    this.GeneratePoints(InitialMap);
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, throttle(this.onTouchMove, 100), this);
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
    // 连线的PointNode不是当前连线的类型
    if (this.LineType !== Point.type) return;

    // 如果申请连接的PointNode已经是连接状态时
    if (IsSelect) {
      if (this.BackspacePoint && Point.id === this.BackspacePoint.getComponent(PointControl).id) {
        /** 处理回退 */
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

  /** 画线 */
  DrawLine(type: number, BeginPointNode: cc.Node, EndPointNode: cc.Node) {
    const LineNode = cc.instantiate(this.LinePrefab);
    const Line = LineNode.getComponent(LineControl);
    Line.Init(type, BeginPointNode, EndPointNode, this.node);
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
