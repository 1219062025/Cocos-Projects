import Level, { LevelUnitInfo } from './Config/Level';
import { InitiaRowCount, InitiaColCount, UnitInfoMap, UnitType, Unit } from './Config/Game';
import { flat, centerChildren, calculateBoundingBox, debounce, InRange } from './CommonScripts/Utils';
import PlotControl from './PlotControl';
import UnitControl from './UnitControl';
import EventManager from './CommonScripts/EventManager';
import { TouchPosInfo } from './ToolsClass';
import QuadTree from './QuadTree';
import QuadNode from './QuadNode';

const { ccclass, property } = cc._decorator;

@ccclass
export default class OverallControl extends cc.Component {
  @property({ type: cc.Node, tooltip: '游戏区域节点' })
  GameArea: cc.Node = null;
  @property({ type: cc.Node, tooltip: '提示填充区域节点' })
  SelectNode: cc.Node = null;

  @property({ type: cc.Prefab, tooltip: '地块Plot预制体' })
  PlotPrefab: cc.Prefab = null;
  /** 所有的地块PlotNode集合 */
  PlotNodes: cc.Node[][] = [];

  @property({ type: cc.Prefab, tooltip: '单位Unit预制体' })
  UnitPrefab: cc.Prefab = null;
  /** 所有的单位UnitNode集合 */
  UnitNodes: cc.Node[][] = [];

  /** 当前选中的UnitNode */
  CurrentUnitNode: cc.Node = null;

  _CurrentUnit: UnitControl = null;
  /** 当前选中的UnitNode的Unit脚本 */
  get CurrentUnit() {
    if (this.CurrentUnitNode === null) return null;
    return this.CurrentUnitNode.getComponent(UnitControl);
  }

  /** 选中的UnitNode拖动到地块上时，如果地块上存在另一个UnitNode，则那个UnitNode存储在PlotUnitNode中 */
  PlotUnitNode: cc.Node = null;
  /** PlotUnitNode上的Unit脚本 */
  _PlotUnit: UnitControl = null;
  get PlotUnit() {
    if (this.PlotUnitNode === null) return null;
    return this.PlotUnitNode.getComponent(UnitControl);
  }

  /** 拖动当前选中的UnitNode时移动到哪个地块了 */
  _MoveTargetPlotNode: cc.Node = null;
  get MoveTargetPlotNode() {
    return this._MoveTargetPlotNode;
  }

  set MoveTargetPlotNode(value: cc.Node) {
    if (value !== null && value !== this._MoveTargetPlotNode) {
      // this.InspectEqualUnit()
    }
    this._MoveTargetPlotNode = value;
  }

  /** 触摸关系 */
  TouchPosInfo: TouchPosInfo = null;

  /** 地块Plot四叉树 */
  PlotQuadTree: QuadTree<cc.Node> = null;

  /** ___DEBUG START___ */
  @property(cc.Graphics)
  ctx: cc.Graphics = null;
  /** ___DEBUG END___ */

  onLoad() {
    // 初始化触摸相关
    this.TouchPosInfo = new TouchPosInfo();
    // 生成地块Plot
    this.GeneratePlot(Level.Level1.Map);
    // 生成单位Unit
    this.GenerateUnit(Level.Level1.LevelUnitInfos);
    // canvas节点居中
    cc.Canvas.instance.node.setPosition(0, 0);
    // 初始化四叉树
    this.InitQuadTree();

    // 挂载事件
    EventManager.on('TouchStart', this.onTouchStart, this);
    this.GameArea.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.GameArea.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.GameArea.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    cc.director.getCollisionManager().enabled = true;
  }

  onTouchStart(event: cc.Event.EventTouch, { row, col }) {
    const CurrentUnitNode = this.UnitNodes[row][col];
    const CurrentUnit = CurrentUnitNode.getComponent(UnitControl);

    // 选中的是ItemUnit时才可进行后续操作
    if (CurrentUnit.unitType === UnitType.Item) {
      // 设置当前选中的UnitNode
      this.CurrentUnitNode = CurrentUnitNode;
      // 设置提示区域
      this.SelectNode.setPosition(this.CurrentUnitNode.getPosition());
      this.SelectNode.zIndex = 1;
      this.SelectNode.opacity = 255;
    }
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (this.CurrentUnitNode === null) return;
    /** 触摸点当前所在的地块PlotNode */
    const TargetPlotNode = this.GetPointInPlot(event);
    // 存在目标地块
    if (TargetPlotNode) {
      this.MoveTargetPlotNode = TargetPlotNode;
      const TargetPlot = TargetPlotNode.getComponent(PlotControl);
      const { row, col } = TargetPlot;
      /** 目标地块上的UnitNode */
      const PlotUnitNode = this.UnitNodes[row][col];
      /** ___DEBUG START___ */
      this.TweenSetMoveToPlot(this.CurrentUnitNode, row, col);
      this.TweenSetMoveToPlot(this.SelectNode, row, col);
      /** ___DEBUG END___ */

      // this.CurrentUnitNode.setPosition(this.GetPlotPos(row, col));
      // this.SelectNode.setPosition(this.GetPlotPos(row, col));
      if (PlotUnitNode && PlotUnitNode !== this.CurrentUnitNode) {
        // 如果地块上有单位UnitNode了且不是当前选中的UnitNode时
        this.CurrentUnit.SetZIndex(row + 1);
      } else {
        this.CurrentUnit.SetZIndex(row);
      }
    }
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    if (this.CurrentUnitNode === null) return;
    /** 当前选中的UnitNode所处位置的地块PlotNode（注意：这里的“所处位置”是指position，而不是行、列） */
    const TargetPlotNode = this.MoveTargetPlotNode || this.GetPointInPlot(event) || this.GetUnitInPlot(this.CurrentUnitNode);
    // 存在目标地块
    if (TargetPlotNode) {
      const TargetPlot = TargetPlotNode.getComponent(PlotControl);
      const { row: TargetPlotRow, col: TargetPlotCol } = TargetPlot;
      const { row: OriginPlotRow, col: OriginPlotCol } = this.CurrentUnit;
      /** 目标地块上的UnitNode */
      const PlotUnitNode = this.UnitNodes[TargetPlotRow][TargetPlotCol];

      // 放开触摸时所处地块已经存在UnitNode了那就得进行处理
      if (PlotUnitNode && PlotUnitNode !== this.CurrentUnitNode) {
        const PlotUnit = PlotUnitNode.getComponent(UnitControl);
        /** 相邻空地块的行、列信息，如果不存在相邻空地块时为undefined */
        const Ranks = this.InspectAdjoinEmptyPlot(PlotUnit.row, PlotUnit.col);
        if (Ranks) {
          // 如果所处地块相邻有空地块，那就让原本的UnitNode移动到空地块上，并把当前选中的UnitNode放置到此处
          const { EmptyPlotRow, EmptyPlotCol } = Ranks;
          if (EmptyPlotRow === OriginPlotRow && EmptyPlotCol === OriginPlotCol) {
            // 空地块是当前选中的UnitNode所处的地块，进行交换操作
            this.SwapUnitNodeRanks(PlotUnitNode, this.CurrentUnitNode);
          } else {
            // 先设置原本的UnitNode的行、列为空地块Plot的行、列
            this.SetUnitNodeRanks(PlotUnitNode, EmptyPlotRow, EmptyPlotCol);
            // 再放置选中UnitNode
            this.SetUnitNodeRanks(this.CurrentUnitNode, TargetPlotRow, TargetPlotCol);
          }
          // 移动原本的UnitNode以及设置层级
          this.TweenSetMoveToPlot(PlotUnitNode, EmptyPlotRow, EmptyPlotCol);
          PlotUnit.SetZIndex(EmptyPlotRow);
          this.CurrentUnit.SetZIndex(TargetPlotRow);
        } else {
          // 如果所处地块相邻没有空地块，那就让当前选中的UnitNode回归之前的位置
          this.TweenSetMoveToPlot(this.CurrentUnitNode, OriginPlotRow, OriginPlotCol);
          this.CurrentUnit.SetZIndex(OriginPlotRow);
        }
      } else {
        // 放开触摸时所处地块不存在UnitNode的话就直接设置当前选中的UnitNode到该地块Plot上
        this.SetUnitNodeRanks(this.CurrentUnitNode, TargetPlotRow, TargetPlotCol);
      }
    }

    this.SelectNode.zIndex = 0;
    this.SelectNode.opacity = 0;
    this.CurrentUnitNode = null;
    this.MoveTargetPlotNode = null;
  }

  /** 平滑缓动的移动UnitNode */
  TweenSetMoveToPlot(node: cc.Node, row: number, col: number) {
    const position = this.GetPlotPos(row, col);
    const tween = (cc.tween() as cc.Tween).to(0.12, { position });

    (cc.tween(node) as cc.Tween)
      .then(tween)
      .call(() => {})
      .start();
  }

  /** 直接通过UnitNode的位置信息确定其当前所处地块Plot */
  GetUnitInPlot(UnitNode: cc.Node) {
    const TargetPlotNode = flat<cc.Node>(this.PlotNodes).find(PlotNode => {
      return PlotNode.getPosition().equals(UnitNode.getPosition());
    });
    return TargetPlotNode;
  }

  /** 获取触摸点当前所在的地块PlotNode */
  GetPointInPlot(event: cc.Event.EventTouch) {
    /** 触摸点在游戏区域GameArea的局部坐标系中的位置 */
    const InGameAreaPoint = this.GameArea.convertToNodeSpaceAR(event.getLocation());
    /** 根据触摸点搜索四叉树后得到的触摸点所匹配的子树中所有的数据信息 */
    const MatchedNodes = this.PlotQuadTree.Search(InGameAreaPoint.x, InGameAreaPoint.y);
    /** 触摸点与之多边形碰撞组件产生了交点的地块 */
    return MatchedNodes.find(PlotNode => {
      const colliderPoints = PlotNode.getComponent(cc.PolygonCollider).points.map(point => {
        return PlotNode.convertToWorldSpaceAR(point);
      });
      return cc.Intersection.pointInPolygon(event.getLocation(), colliderPoints);
    });
  }

  /** 检查UnitNdoe相邻位置有无相同的Unit（检测顺序为上、下、左、右） */
  InspectAdjoinEqualUnit(UnitNode: cc.Node) {}

  /** 检查指定行、列相邻的8个地块有没有空地块 */
  InspectAdjoinEmptyPlot(row: number, col: number) {
    const Ranks = [
      [row - 1, col - 1],
      [row - 1, col],
      [row - 1, col + 1],
      [row, col - 1],
      [row, col + 1],
      [row + 1, col - 1],
      [row + 1, col],
      [row + 1, col + 1]
    ].find(([row, col]) => {
      const PlotNode = this.PlotNodes[row][col];
      if (!PlotNode) return false;
      const UnitNode = this.UnitNodes[row][col];
      if (UnitNode && UnitNode !== this.CurrentUnitNode) return false;
      return true;
    });

    return Ranks ? { EmptyPlotRow: Ranks[0], EmptyPlotCol: Ranks[1] } : undefined;
  }

  /** 设置UnitNode到指定行、列地块Plot的位置，请清除原地块Plot上的信息 */
  SetUnitNodeRanks(UnitNode: cc.Node, TargetPlotRow: number, TargetPlotCol: number) {
    const Unit = UnitNode.getComponent(UnitControl);
    /** 原地块的行、列 */
    const { row: OriginPlotRow, col: OriginPlotCol } = Unit;
    if (TargetPlotRow === OriginPlotRow && TargetPlotCol === OriginPlotCol) return;
    this.UnitNodes[TargetPlotRow][TargetPlotCol] = UnitNode;
    this.UnitNodes[OriginPlotRow][OriginPlotCol] = null;
    Unit.row = TargetPlotRow;
    Unit.col = TargetPlotCol;
  }

  /** 交换两个UnitNode的行、列 */
  SwapUnitNodeRanks(TargetUnitNode: cc.Node, OriginUnitNode: cc.Node) {
    const TargetUnit = TargetUnitNode.getComponent(UnitControl);
    const OriginUnit = OriginUnitNode.getComponent(UnitControl);
    const { row: TargetUnitRow, col: TargetUnitCol } = TargetUnit;
    const { row: OriginUnitRow, col: OriginUnitCol } = OriginUnit;
    this.UnitNodes[TargetUnitRow][TargetUnitCol] = OriginUnitNode;
    this.UnitNodes[OriginUnitRow][OriginUnitCol] = TargetUnitNode;
    TargetUnit.row = OriginUnitRow;
    TargetUnit.col = OriginUnitCol;
    OriginUnit.row = TargetUnitRow;
    OriginUnit.col = TargetUnitCol;
  }

  /** 生成地块Plot */
  GeneratePlot(PlotMap: number[][]) {
    const Map = JSON.parse(JSON.stringify(PlotMap)) as number[][];
    // 从上到下，从右到左生成地块
    Map.forEach((RowPlot, row) => {
      RowPlot.reverse().forEach((PlotType, col) => {
        if (this.PlotNodes[row] === undefined) this.PlotNodes[row] = [];
        if (PlotType === 0) return;
        const PlotNode = cc.instantiate(this.PlotPrefab);
        const Plot = PlotNode.getComponent(PlotControl);
        PlotNode.setParent(this.GameArea);
        PlotNode.setPosition(this.InitPlotPos(row, col));
        // 由于生成地块时是从上到下，从右到左的，也就是RowPlot一整行的元素的列数都被reverse反转了，所以对应存储时也需要将列数反转
        Plot.Init(PlotType, row, RowPlot.length - 1 - col, PlotMap);
        this.PlotNodes[row][RowPlot.length - 1 - col] = PlotNode;
      });
    });
    const bounds = calculateBoundingBox(this.GameArea);
    this.GameArea.setContentSize(bounds.width, bounds.height);
    centerChildren(this.GameArea);
  }

  /** 生成单位Unit */
  GenerateUnit(LevelUnitInfos: LevelUnitInfo[]) {
    for (let i = 0; i < InitiaRowCount; i++) {
      this.UnitNodes[i] = new Array(InitiaColCount).fill(null);
    }
    LevelUnitInfos.forEach(LevelUnitInfo => {
      const UnitNode = cc.instantiate(this.UnitPrefab);
      /** 单位Unit在当前关卡的信息 */
      const { type, row, col, level } = LevelUnitInfo;

      // 初始化
      const Unit = UnitNode.getComponent(UnitControl);
      Unit.Init(type, row, col, level);

      // 存储到UnitNode集合中
      this.UnitNodes[row][col] = UnitNode;

      // 设置生成的UnitNode的状态
      UnitNode.setParent(this.GameArea);
      UnitNode.setPosition(this.GetPlotPos(row, col));
    });
  }

  /** 获取地块Plot位置 */
  GetPlotPos(row: number, col: number) {
    const PlotNode = this.PlotNodes[row][col];
    return PlotNode.getPosition();
  }

  /** 初始化四叉树 */
  InitQuadTree() {
    const { x: GameAreaX, y: GameAreaY } = this.GameArea.parent.convertToWorldSpaceAR(this.GameArea.getPosition());
    const { width: GameAreaWidth, height: GameAreaHeight } = calculateBoundingBox(this.GameArea);
    this.PlotQuadTree = new QuadTree(GameAreaX, GameAreaY, GameAreaWidth, GameAreaHeight, 15, this.ctx);

    flat<cc.Node>(this.PlotNodes).forEach(PlotNode => {
      const { x: PlotNodeX, y: PlotNodeY } = PlotNode.parent.convertToWorldSpaceAR(PlotNode.getPosition());
      const Node = new QuadNode<cc.Node>(PlotNodeX, PlotNodeY, PlotNode.width, PlotNode.height, PlotNode);
      this.PlotQuadTree.Insert(Node);
    });
  }

  /** 地块Plot初始化时获取其位置，锚点为最右上角的地块 */
  InitPlotPos(row: number, col: number) {
    const RowPos = cc.v2(40, -48).mul(row);
    const ColPos = cc.v2(-95, -20).mul(col);
    const TargetPos = RowPos.add(ColPos);
    return TargetPos;
  }

  //#region
  /** ___DEBUG START___ */
  DebugStrokeGameAreaRect() {
    this.ctx.node.zIndex = 10000;
    this.schedule(() => {
      const boundingBox = calculateBoundingBox(this.GameArea);
      this.ctx.rect(this.GameArea.x - boundingBox.width / 2, this.GameArea.y - boundingBox.height / 2, boundingBox.width, boundingBox.height);
      this.ctx.stroke();
    });
  }

  DebugStrokePlotNodesRect() {
    this.ctx.node.zIndex = 10000;
    this.schedule(() => {
      flat<cc.Node>(this.PlotNodes).forEach(PlotNode => {
        const boundingBox = PlotNode.getBoundingBoxToWorld();
        this.ctx.rect(PlotNode.x - boundingBox.width / 2, PlotNode.y - boundingBox.height / 2, boundingBox.width, boundingBox.height);
        this.ctx.stroke();
      });
    });
  }

  DebugStrokeUnitNodesRect() {
    this.ctx.node.zIndex = 10000;
    this.schedule(() => {
      flat<cc.Node>(this.UnitNodes).forEach(UnitNode => {
        const boundingBox = UnitNode.getBoundingBoxToWorld();
        this.ctx.rect(UnitNode.x - boundingBox.width / 2, UnitNode.y - boundingBox.height / 2, boundingBox.width, boundingBox.height);
        this.ctx.stroke();
      });
    });
  }
  /** ___DEBUG END___ */
  //#endregion
}
