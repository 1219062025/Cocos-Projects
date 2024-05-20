import { BlockControl } from './BlockControl';
import { CellControl } from './CellControl';
import { ChunkControl } from './ChunkControl';
import { InRange } from './Common/Utils';
import { InitiaRowCount, InitiaColCount, BlockType } from './Config/GameConfig';
import { ChunkTemplate } from './Game';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CellAreaControl extends cc.Component {
  /** 当前拖动的方块集合的起始块 */
  StartCellNode: cc.Node = null;
  get StartCell() {
    return this.StartCellNode === null ? null : this.StartCellNode.getComponent(CellControl);
  }
  /** 所有格子 */
  CellNodes: cc.Node[][] = [];
  /** 所有已经固定到格子内的方块 */
  BlockNodes: cc.Node[][] = [];
  /** 匹配当前方块集合的方块 */
  MateBlockNodes: cc.Node[] = [];
  RemoveBlockNodes: cc.Node[] = [];
  /** 是否可以消除了 */
  get isRemove() {
    return this.RemoveBlockNodes.length !== 0;
  }
  /** 容纳当前拖动的方块集合的格子 */
  FitCellNodes: cc.Node[] = [];
  /** 是否可容纳当前的方块集合的格子 */
  get isFit() {
    return this.FitCellNodes.length !== 0;
  }
  /** 当前拖动的方块集合 */
  CurrentChunkNode: cc.Node = null;
  /** 当前拖动的方块集合的脚本 */
  get CurrentChunk() {
    return this.CurrentChunkNode === null ? null : this.CurrentChunkNode.getComponent(ChunkControl);
  }

  /** 匹配可容纳格子，设置投影，设置匹配变色 */
  FitAndSetState(StartCellNode: cc.Node, CurrentChunkNode: cc.Node) {
    if (this.StartCellNode !== StartCellNode) {
      this.Reset();
      this.CurrentChunkNode = CurrentChunkNode;
      this.StartCellNode = StartCellNode;
      this.InspectFit(this.CurrentChunk.Template);
      if (this.isFit) {
        this.SetProjection();
        this.InspectMate();
        this.SetMate();
      }
    }
  }

  /** 从起始块开始检测方块能否放置，可以则Push进FitCellNodes数组，最后确定是否全放得进去，放不进就清空数组 */
  InspectFit(Template: ChunkTemplate) {
    const StartRows = this.StartCell.rows;
    const StartCols = this.StartCell.cols;

    /** 方块集合没有整个都处于格子区域内部的话就不需要往下检测了 */
    if (!InRange(Template.rows + StartRows, 0, InitiaRowCount) || !InRange(Template.cols + StartCols, 0, InitiaColCount)) {
      return (this.FitCellNodes = []);
    }

    for (let i = 0; i < Template.blockInfoList.length; i++) {
      const Info = Template.blockInfoList[i];
      const TargetRows = StartRows + Info.difRows;
      const TargetCols = StartCols + Info.difCols;
      const TargetBlockNode = this.BlockNodes[TargetRows][TargetCols];
      if (TargetBlockNode) break;
      this.FitCellNodes.push(this.CellNodes[TargetRows][TargetCols]);
    }

    if (this.FitCellNodes.length !== Template.blockInfoList.length) {
      this.FitCellNodes = [];
    }
  }

  InspectMate() {
    const CheckedRows = new Set<number>([]);
    const CheckedCols = new Set<number>([]);
    this.FitCellNodes.forEach(CellNode => {
      const { rows, cols } = CellNode.getComponent(CellControl);

      if (!CheckedRows.has(rows)) {
        CheckedRows.add(rows);
        const MateBlockNodes = this.BlockNodes[rows].filter(BlockNode => BlockNode !== null);
        const MateCellNodes = this.FitCellNodes.filter(CellNode => {
          const Cell = CellNode.getComponent(CellControl);
          return Cell.rows === rows;
        });
        if (MateBlockNodes.length + MateCellNodes.length === InitiaColCount) {
          this.MateBlockNodes = Array.from(new Set([...this.MateBlockNodes, ...MateBlockNodes]));

          this.RemoveBlockNodes = Array.from(new Set([...this.MateBlockNodes, ...this.RemoveBlockNodes]));

          this.CurrentChunk.ChunkBlockNodes.forEach(BlockInfo => {
            if (this.StartCell.rows + BlockInfo.difRows === rows) {
              this.RemoveBlockNodes.push(BlockInfo.blockNode);
            }
          });
        }
      }

      if (!CheckedCols.has(cols)) {
        CheckedCols.add(cols);
        const MateRowBlockNodes = this.BlockNodes.filter(RowBlockNode => RowBlockNode[cols] !== null);
        const MateCellNodes = this.FitCellNodes.filter(CellNode => {
          const Cell = CellNode.getComponent(CellControl);
          return Cell.cols === cols;
        });
        if (MateRowBlockNodes.length + MateCellNodes.length === InitiaColCount) {
          const MateBlockNodes = MateRowBlockNodes.map(RowBlockNodes => {
            return RowBlockNodes[cols];
          });
          this.MateBlockNodes = Array.from(new Set([...this.MateBlockNodes, ...MateBlockNodes]));
          this.RemoveBlockNodes = Array.from(new Set([...this.MateBlockNodes, ...this.RemoveBlockNodes]));

          this.CurrentChunk.ChunkBlockNodes.forEach(BlockInfo => {
            if (this.StartCell.cols + BlockInfo.difCols === cols) {
              this.RemoveBlockNodes.push(BlockInfo.blockNode);
            }
          });
        }
      }
    });
  }

  Remove() {
    if (this.isRemove) {
      console.log(this.BlockNodes);
      this.RemoveBlockNodes.forEach(BlockNode => {
        const Block = BlockNode.getComponent(BlockControl);
        this.BlockNodes[Block.rows][Block.cols] = null;
        BlockNode.destroy();
      });
    }
  }

  /** 设置可容纳格子的投影 */
  SetProjection() {
    this.FitCellNodes.forEach(CellNode => {
      const Cell = CellNode.getComponent(CellControl);
      Cell.OpenProjection(this.CurrentChunk.ChunkType);
    });
  }

  SetMate() {
    this.MateBlockNodes.forEach(BlockNode => {
      const Block = BlockNode.getComponent(BlockControl);
      Block.OpenMate(this.CurrentChunk.ChunkType);
    });
  }

  /** 清除投影，清除匹配变色 */
  ClearState() {
    if (this.isFit) {
      this.StartCellNode = null;
      while (this.FitCellNodes.length) {
        const CellNode = this.FitCellNodes.shift();
        const Cell = CellNode.getComponent(CellControl);
        Cell.CancelProjection();
      }
      while (this.MateBlockNodes.length) {
        const BlockNode = this.MateBlockNodes.shift();
        const Block = BlockNode.getComponent(BlockControl);
        Block.CancelMate();
      }
      this.RemoveBlockNodes = [];
    }
  }

  Reset() {
    this.ClearState();
    this.FitCellNodes = [];
  }
}
