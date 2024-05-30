import { inRange } from '../Common/Utils';
import { Action } from '../Type/Enum';
import BlockControl from './BlockControl';
import CellControl from './CellControl';
import ChunkControl from './ChunkControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardControl extends cc.Component {
  /** 放置区域的节点 */
  @property({ type: cc.Node, tooltip: '放置区域的节点' })
  boardNode: cc.Node = null;

  @property({ type: cc.Prefab, tooltip: '格子预制体' })
  cellPrefab: cc.Prefab = null;

  /** Board的二维数组映射，0代表空位，1代表存在方块 */
  map: number[][] = [];

  /** Board中的所有格子，以二维数组形式表示 */
  cells: CellControl[][] = [];
  /** Board中的所有格子，以一维Set形式表示 */
  flatCells: Set<CellControl> = new Set([]);
  /** Board中所有已被方块填充的格子，以一维Set形式表示 */
  fitCells: Set<CellControl> = new Set([]);
  /** Board中所有未被方块填充的格子，以一维Set形式表示 */
  emptyCells: Set<CellControl> = new Set([]);

  /** Board中的所有方块，以二维数组形式表示 */
  blocks: BlockControl[][] = [];
  /** Board中的所有方块，以一维Set形式表示 */
  flatBlocks: Set<BlockControl> = new Set([]);

  /** Board中所有被设置了投影的格子，以一维Set形式表示 */
  projectionCells: Set<CellControl> = new Set([]);
  /** Board中所有被设置了变色的方块，以一维Set形式表示 */
  changeBlocks: Set<BlockControl> = new Set([]);

  onLoad() {
    this.initBoard();
  }

  /** 初始化Board */
  initBoard() {
    this.boardNode.setContentSize(gi.gameAreaWidth, gi.gameAreaHeight);
    for (let row = 0; row < gi.initiaRowCount; row++) {
      if (!this.cells[row]) {
        this.cells[row] = new Array(gi.initiaColCount).fill(null);
        this.blocks[row] = new Array(gi.initiaColCount).fill(null);
        this.map[row] = new Array(gi.initiaColCount).fill(0);
      }
      for (let col = 0; col < gi.initiaColCount; col++) {
        const cell = this.cellNodeBuilder({ row, col });
        const cellPos = this.getCellPos({ row, col });
        this.cells[row][col] = cell;
        this.flatCells.add(cell);
        this.emptyCells.add(cell);
        cell.node.setParent(this.boardNode);
        cell.node.setPosition(cellPos);
      }
    }
  }

  /** 是否可以放置块 */
  canPlaceChunk(chunkData: gi.ChunkData, startRow: number, startCol: number, map: number[][]) {
    const _map = map || this.map;
    for (const blockInfo of chunkData.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;
      if (!inRange(targetRow, 0, gi.initiaRowCount - 1) || !inRange(targetCol, 0, gi.initiaColCount - 1)) {
        return false;
      }

      if (_map[targetRow][targetCol]) {
        return false;
      }
    }
    return true;
  }

  /** 获取假设chunk放下后的map映射 */
  getAfterPlaceChunkInfo(chunkData: gi.ChunkData, startRow: number, startCol: number, map: number[][]) {
    const _map = JSON.parse(JSON.stringify(map)) as number[][];
    for (const blockInfo of chunkData.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;
      _map[targetRow][targetCol] = 1;
    }
    return _map;
  }

  /** 根据传入的map判断当前是否能产生消除 */
  canRemoveBlock(map: number[][]) {
    const _map = map;
    for (let row = 0; row < gi.initiaRowCount; row++) {
      if (this.isRowAllTarget(_map, row, 1)) return true;
    }
    for (let col = 0; col < gi.initiaColCount; col++) {
      if (this.isColumnAllTarget(_map, col, 1)) return true;
    }

    return false;
  }

  /** 获取假设消除方块后的信息 */
  getRemoveBlockInfo(map: number[][]) {
    /** 消除后的map */
    const _map = JSON.parse(JSON.stringify(map)) as number[][];
    /** 消除了哪些行 */
    const rows: number[] = [];
    /** 消除了哪些列 */
    const cols: number[] = [];
    for (let row = 0; row < gi.initiaRowCount; row++) {
      if (this.isRowAllTarget(_map, row, 1)) {
        this.setRowAllValue(_map, row, 0);
        rows.push(row);
      }
    }
    for (let col = 0; col < gi.initiaColCount; col++) {
      if (this.isColumnAllTarget(_map, col, 1)) {
        this.setColumnAllValue(_map, col, 0);
        cols.push(col);
      }
    }
    /** 一共消除了多少行、多少列 */
    const count = rows.length + cols.length;
    return { map: _map, rows, cols, count };
  }

  /** 放置块 */
  placeChunk(chunk: ChunkControl, startRow: number, startCol: number) {
    /** 起始方块 */
    const startBlockNode = chunk.data.startBlock.self;
    /** 起始方块所处位置的格子 */
    const startCell = this.cells[startRow][startCol];
    /** 根据起始方块相对于块的位置，推算出此时块位于board坐标系下应该放到哪里 */
    const targetPos = startCell.node.getPosition().sub(startBlockNode.getPosition());

    // 切换块的坐标系之后再设置位置
    chunk.node.setParent(this.boardNode);
    chunk.node.setPosition(targetPos);

    for (const blockInfo of chunk.data.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;

      const block = blockInfo.self.getComponent(BlockControl);
      block.setRanks({ row: targetRow, col: targetCol });
      this.updateMap(Action.ADD, targetRow, targetCol, block);

      /** 切换坐标系 */
      const worldPos = block.node.convertToWorldSpaceAR(cc.v2(0, 0));
      block.node.setParent(this.boardNode);
      block.node.setPosition(this.boardNode.convertToNodeSpaceAR(worldPos));
    }

    if (this.canRemoveBlock(this.map)) {
      const removeInfo = this.getRemoveBlockInfo(this.map);
      this.removeBlock(removeInfo.rows, removeInfo.cols);
    }
  }

  /** 消除方块 */
  removeBlock(removeRows: number[], removeCols: number[]) {
    /** 处理所有行 */
    for (const row of removeRows) {
      this.handleRowAll<BlockControl>(this.blocks, row, block => {
        if (block) {
          this.updateMap(Action.REMOVE, block.row, block.col, block);
          block.node.destroy();
        }
      });
    }
    /** 处理所有列 */
    for (const col of removeCols) {
      this.handleColumnAll<BlockControl>(this.blocks, col, block => {
        if (block) {
          this.updateMap(Action.REMOVE, block.row, block.col, block);
          block.node.destroy();
        }
      });
    }
  }

  /** 更新board的映射 */
  updateMap(action: Action, row: number, col: number, block?: BlockControl) {
    const _cell = this.cells[row][col];
    const _block = this.blocks[row][col];
    switch (action) {
      case Action.ADD:
        this.blocks[row][col] = block;
        this.flatBlocks.add(block);
        this.fitCells.add(_cell);
        this.emptyCells.delete(_cell);
        this.map[row][col] = 1;
        break;
      case Action.REMOVE:
        this.blocks[row][col] = null;
        this.flatBlocks.delete(_block);
        this.fitCells.delete(_cell);
        this.emptyCells.add(_cell);
        this.map[row][col] = 0;
        break;
      case Action.UPDATE:
        this.blocks[row][col] = block;
        this.flatBlocks.delete(_block);
        this.flatBlocks.add(block);
        break;

      default:
        break;
    }
  }

  /** 更新状态 */
  updateStatus(chunk: ChunkControl, startRow: number, startCol: number) {
    this.clearStatus();
    this.setProjection(chunk, startRow, startCol);
    this.setChange(chunk, startRow, startCol);
  }

  /** 清除状态 */
  clearStatus() {
    this.cancleProjection();
    this.cancleChange();
  }

  /** 设置投影 */
  setProjection(chunk: ChunkControl, startRow: number, startCol: number) {
    for (const blockInfo of chunk.data.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;

      const cell = this.cells[targetRow][targetCol];
      const block = blockInfo.self.getComponent(BlockControl);
      cell.setProjection(chunk.type, block.category);
      this.projectionCells.add(cell);
    }
  }

  /** 设置变色 */
  setChange(chunk: ChunkControl, startRow: number, startCol: number) {
    const afterPlaceChunkMap = this.getAfterPlaceChunkInfo(chunk.data, startRow, startCol, this.map);

    // 如果产生了消除的话
    if (this.canRemoveBlock(afterPlaceChunkMap)) {
      // 获取假设放下块之后的消除信息
      const removeInfo = this.getRemoveBlockInfo(afterPlaceChunkMap);
      /** 处理所有行 */
      for (const row of removeInfo.rows) {
        this.handleRowAll<BlockControl>(this.blocks, row, block => {
          if (block) {
            block.setChange(chunk.type, block.category);
            this.changeBlocks.add(block);
          }
        });
      }
      /** 处理所有列 */
      for (const col of removeInfo.cols) {
        this.handleColumnAll<BlockControl>(this.blocks, col, block => {
          if (block) {
            block.setChange(chunk.type, block.category);
            this.changeBlocks.add(block);
          }
        });
      }
    }
  }

  /** 取消投影 */
  cancleProjection() {
    this.projectionCells.forEach(cell => {
      if (cell) {
        cell.cancleProjection();
      }
    });
    this.projectionCells.clear();
  }

  /** 取消变色 */
  cancleChange() {
    this.changeBlocks.forEach(block => {
      if (block) {
        block.cancleChange();
      }
    });
    this.changeBlocks.clear();
  }

  /** 格子生成器 */
  cellNodeBuilder({ row, col }: gi.Ranks) {
    const cellNode = cc.instantiate(this.cellPrefab);
    const cell = cellNode.getComponent(CellControl);
    cell.init({ row, col });
    return cell;
  }

  /** 获取Board中指定行、列格子的位置。坐标系为Board，起始点为左上角 */
  getCellPos({ row, col }: gi.Ranks): cc.Vec2 {
    const beginX = -gi.gameAreaWidth / 2 + gi.cellWidth / 2;
    const beginY = gi.gameAreaHeight / 2 - gi.cellHeight / 2;
    const targetX = beginX + col * gi.cellWidth;
    const targetY = beginY - row * gi.cellHeight;
    return cc.v2(targetX, targetY);
  }

  /** 某行是否全是target值 */
  isRowAllTarget(map: number[][], row: number, target: any) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] !== target) {
        return false;
      }
    }
    return true;
  }

  /** 某列是否全是target值 */
  isColumnAllTarget(map: number[][], col: number, target: any) {
    for (let row = 0; row < map.length; row++) {
      if (map[row][col] !== target) {
        return false;
      }
    }
    return true;
  }

  /** 设置某行为target值 */
  setRowAllValue(map: any[][], row: number, target: any) {
    for (let col = 0; col < map[row].length; col++) {
      map[row][col] = target;
    }
  }

  /** 设置某列为target值 */
  setColumnAllValue(map: any[][], col: number, target: any) {
    for (let row = 0; row < map.length; row++) {
      map[row][col] = target;
    }
  }

  /** 对传入的二维T泛型数组的某行执行操作 */
  handleRowAll<T>(map: T[][], row: number, func: (item: T) => void) {
    for (let col = 0; col < map[row].length; col++) {
      func.call(this, map[row][col]);
    }
  }

  /** 对传入的二维T泛型数组的某列执行操作 */
  handleColumnAll<T>(map: T[][], col: number, func: (item: T) => void) {
    for (let row = 0; row < map.length; row++) {
      func.call(this, map[row][col]);
    }
  }

  /** 重置Board */
  reset() {
    // 清空所有方块
    this.flatBlocks.forEach(block => {
      block.node.destroy();
      this.flatBlocks.delete(block);
    });
    // 重置所有格子的所属
    this.fitCells.forEach(cell => {
      this.emptyCells.add(cell);
      this.fitCells.delete(cell);
    });
    // 重新填充
    for (let row = 0; row < gi.initiaRowCount; row++) {
      this.blocks[row] = new Array(gi.initiaColCount).fill(null);
      this.map[row] = new Array(gi.initiaColCount).fill(0);
    }
  }
}
