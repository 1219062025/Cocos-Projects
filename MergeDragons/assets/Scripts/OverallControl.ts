import Level, { LevelUnitInfo } from './Config/Level';
import { InitiaRowCount, InitiaColCount, UnitInfoMap, UnitType, Unit } from './Config/Game';
import { flat, centerChildren, InRange } from './CommonScripts/Utils';
import PlotControl from './PlotControl';
import UnitControl from './UnitControl';
import EventManager from './CommonScripts/EventManager';
import { TouchPosInfo } from './ToolsClass';

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

  /** 触摸关系 */
  TouchPosInfo: TouchPosInfo = null;

  /** 拖动着的UnitNode是否落地到某个地块上了 */
  isSettle: boolean = false;

  /** ___DEBUG START___ */
  @property(cc.Graphics)
  ctx: cc.Graphics = null;
  /** ___DEBUG END___ */

  onLoad() {
    this.TouchPosInfo = new TouchPosInfo();
    this.GeneratePlot(Level.Level1.Map);
    this.GenerateUnit(Level.Level1.LevelUnitInfos);
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

      const TouchPos = this.GameArea.convertToNodeSpaceAR(event.getLocation());

      // 设置提示区域
      this.SelectNode.setPosition(this.GetPlotPos(this.CurrentUnit.row, this.CurrentUnit.col));
      this.SelectNode.zIndex = 1;

      this.TouchPosInfo.BeginTouch(event.getLocation());
      // 计算触摸点与UnitNode的相对位置
      this.TouchPosInfo.offsetUnitNode = this.CurrentUnitNode.getPosition().sub(TouchPos);
      // 计算触摸点与SelectNode的相对位置
      this.TouchPosInfo.offsetSelect = this.SelectNode.getPosition().sub(TouchPos);
    }
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (this.CurrentUnitNode === null) return;
    /** 触摸点在游戏区域GameArea的局部坐标系中的位置 */
    const InGameAreaPoint = this.GameArea.convertToNodeSpaceAR(event.getLocation());

    // this.scheduleOnce(() => {
    //   // 保持TouchStart时触摸点与UnitNode的相对位置进行拖动
    //   this.CurrentUnitNode.setPosition(cc.v2(InGameAreaPoint.x + this.TouchPosInfo.offsetUnitNode.x, InGameAreaPoint.y + this.TouchPosInfo.offsetUnitNode.y));
    // }, 0.08);

    // // 保持TouchStart时触摸点与Select的相对位置进行拖动
    // this.SelectNode.setPosition(cc.v2(InGameAreaPoint.x + this.TouchPosInfo.offsetSelect.x, InGameAreaPoint.y + this.TouchPosInfo.offsetSelect.y));

    this.InspectInPlotArea(event);
  }

  InspectInPlotArea(event: cc.Event.EventTouch) {
    if (this.CurrentUnitNode === null) return;
    const TouchPos = event.getLocation();
    /** 就检查当前所处地块Plot上下左右四个地块 */
    const Ranks = [
      [this.CurrentUnit.row, this.CurrentUnit.col - 1],
      [this.CurrentUnit.row, this.CurrentUnit.col + 1],
      [this.CurrentUnit.row - 1, this.CurrentUnit.col],
      [this.CurrentUnit.row + 1, this.CurrentUnit.col]
    ].find(([inspectRow, inspectCol]) => {
      if (!InRange(inspectRow, 0, InitiaRowCount - 1) || !InRange(inspectCol, 0, InitiaColCount - 1)) return;
      if (!this.PlotNodes[inspectRow][inspectCol]) return;
      // 判断触摸点是否已经进入了其他地块的区域，这里的区域指的是Plot预制体上设置的多边形碰撞组件
      const PlotNode = this.PlotNodes[inspectRow][inspectCol];
      const colliderPoints = PlotNode.getComponent(cc.PolygonCollider).points.map(point => {
        return PlotNode.convertToWorldSpaceAR(point);
      });
      return cc.Intersection.pointInPolygon(TouchPos, colliderPoints);
    });

    if (Ranks) {
      const [row, col] = Ranks;
      const UnitNode = this.UnitNodes[row][col];
      if (UnitNode) {
        // 如果目标地块已经存在UnitNode时
      } else {
        this.SetUnitNodeRanks(this.CurrentUnitNode, row, col);
        this.CurrentUnit.SetUnitNodePosition(this.GetPlotPos(row, col));
        this.SelectNode.setPosition(this.GetPlotPos(row, col));
      }
    }
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    if (this.CurrentUnitNode === null) return;
    this.SelectNode.zIndex = 0;
    this.CurrentUnitNode = null;
    // 清除所有定时器
    this.unscheduleAllCallbacks();
  }

  SetUnitNodeRanks(UnitNode: cc.Node, targetRow: number, targetCol: number) {
    const Unit = UnitNode.getComponent(UnitControl);
    const { row: originRow, col: originCol } = Unit;
    this.UnitNodes[targetRow][targetCol] = UnitNode;
    this.UnitNodes[originRow][originCol] = null;
    Unit.row = targetRow;
    Unit.col = targetCol;
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
      const position = this.GetPlotPos(row, col);
      UnitNode.setParent(this.GameArea);
      Unit.SetUnitNodePosition(cc.v2(position.x, position.y));
    });
  }

  /** 获取地块Plot位置 */
  GetPlotPos(row: number, col: number) {
    const PlotNode = this.PlotNodes[row][col];
    return PlotNode.getPosition();
  }

  /** 地块Plot初始化时获取其位置，锚点为最右上角的地块 */
  InitPlotPos(row: number, col: number) {
    const RowPos = cc.v2(0, 0).add(cc.v2(40, -48)).multiply(cc.v2(row, row));
    const ColPos = cc.v2(-95, -20).mul(col);
    const TargetPos = RowPos.add(ColPos);
    return TargetPos;
  }

  //#region
  /** ___DEBUG START___ */
  DebugStrokeGameAreaRect() {
    this.schedule(() => {
      const boundingBox = this.GameArea.getBoundingBoxToWorld();
      this.ctx.clear();
      this.ctx.rect(this.GameArea.x - boundingBox.width / 2, this.GameArea.y - boundingBox.height / 2, boundingBox.width, boundingBox.height);
      this.ctx.stroke();
    });
  }

  DebugStrokePlotNodesRect(isTopDraw?: boolean) {
    if (isTopDraw) this.ctx.node.zIndex = 10000;
    this.schedule(() => {
      flat<cc.Node>(this.PlotNodes).forEach(PlotNode => {
        const boundingBox = PlotNode.getBoundingBoxToWorld();
        this.ctx.rect(PlotNode.x - boundingBox.width / 2, PlotNode.y - boundingBox.height / 2, boundingBox.width, boundingBox.height);
        this.ctx.stroke();
      });
    });
  }

  DebugStrokeUnitNodesRect(isTopDraw?: boolean) {
    if (isTopDraw) this.ctx.node.zIndex = 10000;
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
