import levelList from './config/levelConfig';
import BlockControl from './blockControl';
import ChunkControl from './chunkControl';
import CellControl from './cellControl';
const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardControl extends cc.Component {
  @property({ type: cc.Prefab, tooltip: '方块预制体' })
  blockPrefab: cc.Prefab = null;

  @property({ type: cc.Prefab, tooltip: '格子预制体' })
  cellPrefab: cc.Prefab = null;

  /** 放置区域的节点 */
  @property({ type: cc.Node, tooltip: '网格区域的节点' })
  boardNode: cc.Node = null;

  /** Board的二维数组映射，0代表空位，1代表存在方块 */
  map: number[][] = [];

  /** Board中的所有格子，以二维数组形式表示 */
  cells: CellControl[][] = [];
  /** Board中的所有格子，以一维Set形式表示 */
  flatCells: Set<CellControl> = new Set([]);

  /** Board中的所有方块，以二维数组形式表示 */
  blocks: BlockControl[][] = [];
  /** Board中的所有方块，以一维Set形式表示 */
  flatBlocks: Set<BlockControl> = new Set([]);

  /** Board中所有被设置了投影的格子，以一维Set形式表示 */
  projectionCells: Set<CellControl> = new Set([]);
  /** Board中所有被设置了变色的方块，以一维Set形式表示 */
  changeBlocks: Set<BlockControl> = new Set([]);
  cellMap: number[][] = [];

  /** ___DEBUG START___ */
  @property({ type: cc.Graphics })
  ctx: cc.Graphics = null;
  /** ___DEBUG END___ */

  initBoard(level: number) {
    this.map = this.createMap<number>(gi.MAPROWS, gi.MAPCOLS, 0);
    this.blocks = this.createMap<BlockControl>(gi.MAPROWS, gi.MAPCOLS, null);
    this.cells = this.createMap<CellControl>(gi.MAPROWS, gi.MAPCOLS, null);
    this.boardNode.setContentSize(gi.MAPWIDTH, gi.MAPHEIGHT);

    // 创建Block对象池
    gi.createPool('block', 100, this.blockPrefab);

    const { map, cellMap } = levelList[level];

    this.cellMap = cellMap;

    this.renderCell(cellMap);
    this.renderMap(map);

    // gi.Utils.centerChildren(this.boardNode);

    this.initQuadTree();
  }

  /** 渲染方块 */
  renderMap(map: number[][]) {
    // 从左到右，从上到下
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        const item = map[row][col];

        if (item === 0) continue;

        if (this.blocks[row][col]) {
          const block = this.blocks[row][col];
          // 已存在有block了，更新就行了
          if (item !== block.getType()) block.setType(item);

          block.setRanks({ row, col });

          this.updateMap(gi.Action.UPDATE, row, col, block);
        } else {
          // 不存在block，新生成一个
          const blockNode = gi.poolGet('block') || gi.prefabBuilder(this.blockPrefab, BlockControl).node;
          const block = blockNode.getComponent(BlockControl);

          block.init();
          block.setCategory(gi.BlockCategory.BASEBLOCK);
          block.setType(item);
          block.setRanks({ row, col });

          block.node.setParent(this.boardNode);
          block.node.setPosition(gi.getRanksPos({ row, col }));

          this.updateMap(gi.Action.ADD, row, col, block);
        }

        this.map[row][col] = 1;
      }
    }
  }

  /** 渲染格子 */
  renderCell(map: number[][]) {
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        const item = map[row][col];

        if (item === 0) continue;

        const cell = this.cellBuilder().ctrl;
        this.cells[row][col] = cell;
        this.flatCells.add(cell);
        cell.setRanks({ row, col });
        cell.node.setParent(this.boardNode);
        cell.node.setPosition(gi.getRanksPos({ row, col }));
      }
    }
  }

  /** 创建映射 */
  createMap<T>(rows: number, cols: number, value: T) {
    const _map: T[][] = [];
    for (let i = 0; i < rows; i++) {
      _map.push(new Array(cols).fill(value));
    }
    return _map;
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

  /** 设置变色 */
  setChange(chunk: ChunkControl, startRow: number, startCol: number) {
    const { map: afterPlaceChunkMap } = this.getAfterPlaceChunkInfo(chunk.data, startRow, startCol, this.map);

    // 如果产生了消除的话
    if (this.canRemoveBlock(afterPlaceChunkMap)) {
      // 获取假设放下块之后的消除信息
      const removeInfo = this.getAfterRemoveBlockInfo(afterPlaceChunkMap);
      /** 处理所有行 */
      for (const row of removeInfo.rows) {
        this.handleRowAll<BlockControl>(this.blocks, row, block => {
          if (block) {
            block.setChange(chunk.getType(), block.getCategory());
            this.changeBlocks.add(block);
          }
        });
      }
      /** 处理所有列 */
      for (const col of removeInfo.cols) {
        this.handleColumnAll<BlockControl>(this.blocks, col, block => {
          if (block) {
            block.setChange(chunk.getType(), block.getCategory());
            this.changeBlocks.add(block);
          }
        });
      }
    }
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

  /** 设置投影 */
  setProjection(chunk: ChunkControl, startRow: number, startCol: number) {
    for (const blockInfo of chunk.data.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;

      const cell = this.cells[targetRow][targetCol];
      const block = blockInfo.self.getComponent(BlockControl);

      if (cell && block) {
        cell.setProjection(chunk.getType(), block.getCategory());
        this.projectionCells.add(cell);
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
      this.updateMap(gi.Action.ADD, targetRow, targetCol, block);

      /** 切换坐标系 */
      const worldPos = block.node.convertToWorldSpaceAR(cc.v2(0, 0));
      block.node.setParent(this.boardNode);
      block.node.setPosition(this.boardNode.convertToNodeSpaceAR(worldPos));
    }

    gi.EventManager.emit('placeChunk');

    if (this.canRemoveBlock(this.map)) {
      const removeInfo = this.getAfterRemoveBlockInfo(this.map);
      this.removeBlock(removeInfo.rows, removeInfo.cols);

      gi.EventManager.emit('removeBlock', targetPos);
    }
  }

  /** 消除方块 */
  removeBlock(removeRows: number[], removeCols: number[]) {
    /** 处理所有行 */
    for (const row of removeRows) {
      this.handleRowAll<BlockControl>(this.blocks, row, block => {
        if (block) {
          this.updateMap(gi.Action.REMOVE, block.row, block.col, block);

          block.Remove();
          gi.poolPut('block', block.node);
          // block.node.destroy();
        }
      });
    }
    /** 处理所有列 */
    for (const col of removeCols) {
      this.handleColumnAll<BlockControl>(this.blocks, col, block => {
        if (block) {
          this.updateMap(gi.Action.REMOVE, block.row, block.col, block);

          block.Remove();
          gi.poolPut('block', block.node);
          // block.node.destroy();
        }
      });
    }
  }

  /** 获取假设chunk放下后的map映射 */
  getAfterPlaceChunkInfo(chunkData: gi.ChunkData, startRow: number, startCol: number, map: number[][]) {
    const _map = JSON.parse(JSON.stringify(map)) as number[][];
    for (const blockInfo of chunkData.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;
      _map[targetRow][targetCol] = 1;
    }
    return { map: _map };
  }

  /** 获取假设消除方块后的信息 */
  getAfterRemoveBlockInfo(map: number[][]) {
    /** 消除后的map */
    const _map = JSON.parse(JSON.stringify(map)) as number[][];
    /** 消除了哪些行 */
    const rows: number[] = [];
    /** 消除了哪些列 */
    const cols: number[] = [];
    for (let row = 0; row < gi.MAPROWS; row++) {
      if (this.isRowAllTarget(_map, row, 1)) {
        this.setRowAllValue(_map, row, 0);
        rows.push(row);
      }
    }
    for (let col = 0; col < gi.MAPCOLS; col++) {
      if (this.isColumnAllTarget(_map, col, 1)) {
        this.setColumnAllValue(_map, col, 0);
        cols.push(col);
      }
    }
    /** 一共消除了多少行、多少列 */
    const count = rows.length + cols.length;
    return { map: _map, rows, cols, count };
  }

  /** 是否可以放置块 */
  canPlaceChunk(chunkData: gi.ChunkData, startRow: number, startCol: number, map: number[][]) {
    const _map = map || this.map;
    for (const blockInfo of chunkData.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;

      if (!gi.Utils.inRange(targetRow, 0, gi.MAPROWS - 1) || !gi.Utils.inRange(targetCol, 0, gi.MAPCOLS - 1)) {
        return false;
      }

      if (this.cellMap[targetRow][targetCol] === 0) {
        return false;
      }

      if (_map[targetRow][targetCol]) {
        return false;
      }
    }
    return true;
  }

  /** 根据传入的map判断当前是否能产生消除 */
  canRemoveBlock(map: number[][]) {
    const _map = map;
    for (let row = 0; row < gi.MAPROWS; row++) {
      if (this.isRowAllTarget(_map, row, 1)) return true;
    }
    for (let col = 0; col < gi.MAPCOLS; col++) {
      if (this.isColumnAllTarget(_map, col, 1)) return true;
    }

    return false;
  }

  /** 对传入的二维T泛型数组的某行执行操作 */
  handleRowAll<T>(map: T[][], row: number, func: (item: T) => void) {
    for (let col = 0; col < map[row].length; col++) {
      if (this.cellMap[row][col] === 1) {
        func.call(this, map[row][col]);
      }
    }
  }

  /** 对传入的二维T泛型数组的某列执行操作 */
  handleColumnAll<T>(map: T[][], col: number, func: (item: T) => void) {
    for (let row = 0; row < map.length; row++) {
      if (this.cellMap[row][col] === 1) {
        func.call(this, map[row][col]);
      }
    }
  }

  /** 某列是否全是target值 */
  isColumnAllTarget(map: number[][], col: number, target: any) {
    for (let row = 0; row < map.length; row++) {
      if (this.cellMap[row][col] === 1 && map[row][col] !== target) {
        return false;
      }
    }
    return true;
  }

  /** 某行是否全是target值 */
  isRowAllTarget(map: number[][], row: number, target: any) {
    for (let col = 0; col < map[row].length; col++) {
      if (this.cellMap[row][col] === 1 && map[row][col] !== target) {
        return false;
      }
    }
    return true;
  }

  /** 设置某列为target值 */
  setColumnAllValue(map: any[][], col: number, target: any) {
    for (let row = 0; row < map.length; row++) {
      if (this.cellMap[row][col] === 1) {
        map[row][col] = target;
      }
    }
  }

  /** 设置某行为target值 */
  setRowAllValue(map: any[][], row: number, target: any) {
    for (let col = 0; col < map[row].length; col++) {
      if (this.cellMap[row][col] === 1) {
        map[row][col] = target;
      }
    }
  }

  /** 某行是否全不是target值 */
  isRowAllNoTarget(map: number[][], row: number, target: any) {
    for (let col = 0; col < map[row].length; col++) {
      if (this.cellMap[row][col] === 1 && map[row][col] === target) {
        return false;
      }
    }
    return true;
  }

  /** 更新映射 */
  updateMap(action: gi.Action, row: number, col: number, block?: BlockControl) {
    const _block = this.blocks[row][col];
    switch (action) {
      case gi.Action.ADD:
        this.blocks[row][col] = block;
        this.flatBlocks.add(block);
        this.map[row][col] = 1;
        break;
      case gi.Action.REMOVE:
        this.blocks[row][col] = null;
        this.flatBlocks.delete(_block);
        this.map[row][col] = 0;
        break;
      case gi.Action.UPDATE:
        this.blocks[row][col] = block;
        this.flatBlocks.delete(_block);
        this.flatBlocks.add(block);
        this.map[row][col] = 1;
        break;

      default:
        break;
    }
  }

  /** 方块生成器 */
  blockBuilder(type: number) {
    const res = gi.prefabBuilder(this.blockPrefab, BlockControl);
    res.ctrl.init();
    res.ctrl.setCategory(gi.BlockCategory.BASEBLOCK);
    res.ctrl.setType(type);
    return res;
  }

  /** 方块生成器 */
  cellBuilder() {
    const res = gi.prefabBuilder(this.cellPrefab, CellControl);
    return res;
  }

  initQuadTree() {
    const boundingBox = this.boardNode.getBoundingBoxToWorld();

    const { x: treeX, y: treeY } = this.boardNode.convertToWorldSpaceAR(cc.v2(0, 0));
    gi.createQuadTree<CellControl>('cell', { x: treeX, y: treeY, width: boundingBox.width, height: boundingBox.height, maxLen: 6 });
    // gi.createQuadTree<CellControl>('cell', { x: treeX, y: treeY, width: this.boardNode.width, height: this.boardNode.height, maxLen: 12, ctx: this.ctx });

    this.flatCells.forEach(cell => {
      // 获取格子的世界坐标
      const { x: cellNodeX, y: cellNodeY } = cell.node.convertToWorldSpaceAR(cc.v2(0, 0));
      // 将所有格子插入四叉树
      gi.treeInsert<CellControl>('cell', { x: cellNodeX, y: cellNodeY, width: cell.node.width, height: cell.node.height, data: cell });
    });
  }

  /** 打印当前节点布局 */
  LogMap() {
    let map = '';
    this.blocks.forEach((rows, row) => {
      rows.forEach((block, col) => {
        const Tab = block ? block.getType() : 'n';
        map += `${Tab}${col < gi.MAPCOLS - 1 ? ' ' : '\n'}`;
      });
    });
    console.log(map);
  }
}
