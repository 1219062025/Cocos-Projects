import { BlockControl } from './BlockControl';
import { CellControl } from './CellControl';
import { ChunkControl } from './ChunkControl';
import { InRange } from './Common/Utils';
import { InitiaRowCount, InitiaColCount, BlockType } from './Config/GameConfig';
import { ChunkTemplate } from './Game';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CellAreaControl extends cc.Component {
  /** 所有格子 */
  CellNodes: cc.Node[][] = [];
  /** 所有已经固定到格子内的方块 */
  BlockNodes: cc.Node[][] = [];
  /** 已经放置的所有方块中匹配当前方块集合的方块（需要变色的方块） */
  MateBlockNodes: cc.Node[] = [];

  /** 当前拖动的方块集合的起始块 */
  StartCellNode: cc.Node = null;
  /** 当前拖动的方块集合的起始块的脚本 */
  get StartCell() {
    return this.StartCellNode === null ? null : this.StartCellNode.getComponent(CellControl);
  }

  /** 所有需要被消除的方块 */
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
      this.FitCellNodes = this.InspectIsFit(this.CurrentChunk.Template, this.StartCell.rows, this.StartCell.cols);
      if (this.isFit) {
        this.SetProjection();
        this.InspectMate();
        this.SetMate();
      }
    }
  }

  /** 从起始块开始检测方块能否放置，可以则Push进FitCellNodes数组，最后确定是否全放得进去，放不进就清空数组 */
  InspectIsFit(Template: ChunkTemplate, StartRows: number, StartCols: number) {
    const FitCellNodes = [];
    /** 方块集合没有整个都处于格子区域内部的话就不需要往下检测了 */
    if (!InRange(Template.rows + StartRows, 0, InitiaRowCount) || !InRange(Template.cols + StartCols, 0, InitiaColCount)) {
      return [];
    }

    for (let i = 0; i < Template.blockInfoList.length; i++) {
      const Info = Template.blockInfoList[i];
      const TargetRows = StartRows + Info.difRows;
      const TargetCols = StartCols + Info.difCols;
      const IsExistBlock = this.BlockNodes[TargetRows][TargetCols];
      if (!IsExistBlock) {
        FitCellNodes.push(this.CellNodes[TargetRows][TargetCols]);
      }
    }

    if (FitCellNodes.length !== Template.blockInfoList.length) {
      return [];
    }

    return FitCellNodes;
  }

  InspectMate() {
    /** 匹配方块集合需要检测的行 */
    const CheckedRows = new Set<number>([]);
    /** 匹配方块集合需要检测的列 */
    const CheckedCols = new Set<number>([]);
    this.FitCellNodes.forEach(CellNode => {
      const { rows, cols } = CellNode.getComponent(CellControl);

      /** 检测还未被检测过的行 */
      if (!CheckedRows.has(rows)) {
        CheckedRows.add(rows);
        /** 该行与方块集合匹配的所有方块 */
        const MateBlockNodes = this.BlockNodes[rows].filter(BlockNode => BlockNode !== null);
        /** 可容纳方块集合的所有格子中处于该行的格子（由于方块集合还未放置，所以为了得知方块集合哪些方块处于该行，利用FitCellNodes） */
        const MateCellNodes = this.FitCellNodes.filter(CellNode => {
          const Cell = CellNode.getComponent(CellControl);
          return Cell.rows === rows;
        });

        // 两个数组的长度相加如果等于行的长度，意味着整行都可以被消除
        if (MateBlockNodes.length + MateCellNodes.length === InitiaColCount) {
          // 把已经放置到格子中的所有方块中匹配的方块保存起来，准备待会进行方块变色
          this.MateBlockNodes = Array.from(new Set([...this.MateBlockNodes, ...MateBlockNodes]));

          // 把所有需要消除的方块保存起来，如果最后放开触摸的话，就根据当前RemoveBlockNodes进行消除
          this.RemoveBlockNodes = Array.from(new Set([...this.MateBlockNodes, ...this.RemoveBlockNodes]));
          this.CurrentChunk.ChunkBlockNodes.forEach(BlockInfo => {
            if (this.StartCell.rows + BlockInfo.difRows === rows) {
              this.RemoveBlockNodes.push(BlockInfo.self);
            }
          });
        }
      }

      /** 检测还未被检测过的列 */
      if (!CheckedCols.has(cols)) {
        // 处理列的逻辑和处理行一样，只是因为二维数组的原因有点点不同
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
              this.RemoveBlockNodes.push(BlockInfo.self);
            }
          });
        }
      }
    });
  }

  Remove() {
    if (this.isRemove) {
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
