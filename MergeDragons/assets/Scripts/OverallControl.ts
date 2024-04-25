import Level from './Config/Level';
import { InitiaRowCount, InitiaColCount } from './Config/Game';
import { flat, centerChildren } from './CommonScripts/Utils';
import PlotControl from './PlotControl';
const { ccclass, property } = cc._decorator;

@ccclass
export default class OverallControl extends cc.Component {
  @property({ type: cc.Node, tooltip: '游戏区域节点' })
  GameArea: cc.Node = null;

  @property({ type: cc.Prefab, tooltip: '地块Plot预制体' })
  PlotPrefab: cc.Prefab = null;

  @property(cc.Graphics)
  ctx: cc.Graphics = null;

  /** 所有的地块PlotNode集合 */
  PlotNodes: cc.Node[][] = [];

  onLoad() {
    // this.ctx.node.zIndex = 10000;
    this.GeneratePlot();
  }

  GeneratePlot() {
    const Map = JSON.parse(JSON.stringify(Level.Level1)) as number[][];
    // 从上到下，从右到左生成地块
    Map.forEach((RowPlot, row) => {
      RowPlot.reverse().forEach((PlotType, col) => {
        if (this.PlotNodes[row] === undefined) this.PlotNodes[row] = [];
        if (PlotType === 0) return;
        const PlotNode = cc.instantiate(this.PlotPrefab);
        const Plot = PlotNode.getComponent(PlotControl);
        PlotNode.setParent(this.GameArea);
        PlotNode.setPosition(this.GetPos(row, col));
        // 由于生成地块时是从上到下，从右到左的，也就是RowPlot一整行的元素的列数都被reverse反转了，所以对应存储时也需要将列数反转
        Plot.Init(PlotType, row, RowPlot.length - 1 - col, Level.Level1);
        this.PlotNodes[row][RowPlot.length - 1 - col] = PlotNode;
        const boundingBox = PlotNode.getBoundingBoxToWorld();
        this.ctx.rect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
        this.ctx.stroke();
      });
    });
    this.schedule(() => {
      const winSize = cc.director.getWinSize();
      console.log(`视图的宽：${winSize.width}，视图的高：${winSize.height}`);
      const areaSize = this.GameArea.getContentSize();
      console.log(`区域的宽：${areaSize.width}，区域的高：${areaSize.height}`);
      // const boundingBox = this.GameArea.getBoundingBoxToWorld();
      // this.ctx.clear();
      // this.ctx.rect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
      // this.ctx.stroke();
    }, 1);
    centerChildren(this.GameArea);
  }

  GetPos(row: number, col: number) {
    const RowPos = cc.v2(0, 0).add(cc.v2(40, -48)).multiply(cc.v2(row, row));
    const ColPos = cc.v2(-95, -20).mul(col);
    const TargetPos = RowPos.add(ColPos);
    // this.ctx.strokeColor = cc.color(15, 0, 255);
    // this.ctx.moveTo(0, 0);
    // this.ctx.lineTo(TargetPos.x, TargetPos.y);
    // this.ctx.stroke();
    return TargetPos;
  }
}
