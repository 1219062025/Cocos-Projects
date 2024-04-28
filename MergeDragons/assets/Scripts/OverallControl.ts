import Level, { LevelUnitInfo } from './Config/Level';
import { InitiaRowCount, InitiaColCount, UnitInfoMap, UnitType, Unit } from './Config/Game';
import { flat, centerChildren } from './CommonScripts/Utils';
import PlotControl from './PlotControl';
import UnitControl from './UnitControl';
import ItemUnit from './ItemUnit';
import AdornUnit from './AdornUnit';
import EventManager from './CommonScripts/EventManager';

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

  _CurrentUnitNode: cc.Node = null;
  get CurrentUnitNode() {
    return this._CurrentUnitNode;
  }
  set CurrentUnitNode(value: cc.Node) {
    if (value === null) {
      this._CurrentUnitNode.zIndex = 0;
    } else {
      value.zIndex = 100;
    }
    this._CurrentUnitNode = value;
  }

  /** ___DEBUG START___ */
  @property(cc.Graphics)
  ctx: cc.Graphics = null;
  /** ___DEBUG END___ */

  onLoad() {
    this.GeneratePlot(Level.Level1.Map);
    this.GenerateUnit(Level.Level1.LevelUnitInfos);
    EventManager.on('TouchStart', this.onTouchStart, this);
    this.GameArea.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.GameArea.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.GameArea.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onTouchStart({ row, col }) {
    this.CurrentUnitNode = this.UnitNodes[row][col];
    const CurrentUnit = this.CurrentUnitNode.getComponent(UnitControl);
    // this.SelectNode.setPosition(this.GetPlotPos(CurrentUnit.row, CurrentUnit.col));
    // this.SelectNode.zIndex = 99;
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (this.CurrentUnitNode === null) return;
    this.CurrentUnitNode.setPosition(this.GameArea.convertToNodeSpaceAR(event.getLocation()));
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    if (this.CurrentUnitNode === null) return;
    this.SelectNode.zIndex = 0;
    this.CurrentUnitNode = null;
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
    LevelUnitInfos.forEach(LevelUnitInfo => {
      const UnitNode = cc.instantiate(this.UnitPrefab);
      /** 单位Unit在当前关卡的信息 */
      const { type, row, col, level } = LevelUnitInfo;
      // 根据单位类别unitType调用对应派生类的初始化Init方法
      if (UnitInfoMap.get(type).unitType === UnitType.Item) {
        const Item = UnitNode.getComponent(ItemUnit);
        Item.Init(type, row, col, level);
      } else {
        const Adorn = UnitNode.getComponent(AdornUnit);
        Adorn.Init(type, row, col);
      }
      if (this.UnitNodes[row] === undefined) this.UnitNodes[row] = [];
      this.UnitNodes[row][col] = UnitNode;
      UnitNode.setParent(this.GameArea);
      const position = this.GetPlotPos(row, col);
      UnitNode.setPosition(position.x, position.y);
    });
  }

  /** 获取地块Plot位置 */
  GetPlotPos(row: number, col: number) {
    const PlotNode = this.PlotNodes[row][col];
    return PlotNode.getPosition();
  }

  /** 地块Plot初始化时获取其位置 */
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

  te() {
    const a = [
      [2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, ['obj_1', 3, 2], 2, ['obj_6', 4, 2], 0, ['obj_5', 2, 2], 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, ['obj_5', 2, 2], 2, ['obj_4', 1, 2], 0, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, ['obj_3', 3, 2], 2, 2, 2, 0, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, ['obj_6', 2, 2], 2, 2, 0, 0, 2, 2, 2],
      [2, 2, 2, 2, 2, ['obj_4', 1, 2], ['obj_6', 2, 2], 2, 2, 2, ['obj_5', 1, 2], 0, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, ['obj_4', 1], ['obj_2', 2, 2], 2, 2, 0, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, ['obj_3', 1, 2], 1, ['obj_1', 1], ['obj_2', 1, 2], 2, 0, 2, 2, 2],
      [0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 2, 0, 2, 2, 2],
      [0, 0, 0, ['obj_2', 1, 2], 1, 1, 2, 2, 0, 0, 0, 0, 2, 2, 2],
      [0, 0, 0, ['obj_1', 2, 2], 1, 1, 1, ['obj_1', 2, 2], 2, 0, 0, 0, 2, 2, 2],
      [0, 0, ['obj_3', 1, 2], 1, ['obj_1', 1], 1, ['obj_1', 1], 1, 2, 0, 0, 0, 2, 2, 2],
      [0, 0, 2, 2, 1, 1, 1, ['obj_3', 1, 2], 2, 0, 0, 0, 2, 2, 2],
      [0, 0, 0, ['obj_5', 1, 2], 2, ['obj_2', 2, 2], ['obj_6', 4], 2, 2, 0, 0, 0, 2, 2, 2],
      [2, ['obj_2', 1, 2], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, ['obj_3', 1, 2], 0, ['obj_6', 1, 2], 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
      [2, 0, 0, 2, ['obj_6', 1, 2], 0, 2, 2, 2, 0, 0, 0, 0, 0, 0]
    ];
    a.forEach((rowData, row) => {
      rowData.forEach((data, col) => {
        if (typeof data !== 'number') {
          console.log(`{ type: Unit.item0, level: ${(data[1] as number) - 1}, row: ${row}, col: ${col} }`);
        }
      });
    });
  }
  /** ___DEBUG END___ */
  //#endregion
}
