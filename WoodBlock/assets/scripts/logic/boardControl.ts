import BlockControl from './blockControl';
import CellControl from './cellControl';
import ChunkControl from './chunkControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardControl extends cc.Component {
  /** 放置区域的节点 */
  @property({ type: cc.Node, tooltip: '放置区域的节点' })
  boardNode: cc.Node = null;

  @property({ type: cc.Prefab, tooltip: '格子预制体' })
  cellPrefab: cc.Prefab = null;

  @property({ type: cc.Prefab, tooltip: '方块预制体' })
  blockPrefab: cc.Prefab = null;

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

  /** 初始化Board */
  initBoard() {
    this.map = gi.Map.createMap<number>(gi.MAPROWS, gi.MAPCOLS, 0);
    this.blocks = gi.Map.createMap<BlockControl>(gi.MAPROWS, gi.MAPCOLS, null);
    this.cells = gi.Map.createMap<CellControl>(gi.MAPROWS, gi.MAPCOLS, null);
    this.boardNode.setContentSize(gi.MAPWIDTH, gi.MAPHEIGHT);

    this.renderCell(this.map);
    this.renderMap(this.map);
    this.renderQuadTree();
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
  }

  /** 消除方块 */
  removeBlock(removeRows: number[], removeCols: number[]) {
    /** 处理所有行 */
    for (const row of removeRows) {
      gi.Map.handleRowAll<BlockControl>(this.blocks, row, block => {
        if (block) {
          this.updateMap(gi.Action.REMOVE, block.row, block.col, block);
          block.Remove();
          block.node.destroy();
        }
      });
    }
    /** 处理所有列 */
    for (const col of removeCols) {
      gi.Map.handleColumnAll<BlockControl>(this.blocks, col, block => {
        if (block) {
          this.updateMap(gi.Action.REMOVE, block.row, block.col, block);
          block.Remove();
          block.node.destroy();
        }
      });
    }
  }

  /** 更新board的映射 */
  updateMap(action: gi.Action, row: number, col: number, block?: BlockControl) {
    const _cell = this.cells[row][col];
    const _block = this.blocks[row][col];
    switch (action) {
      case gi.Action.ADD:
        this.blocks[row][col] = block;
        this.flatBlocks.add(block);
        this.fitCells.add(_cell);
        this.emptyCells.delete(_cell);
        this.map[row][col] = 1;
        break;
      case gi.Action.REMOVE:
        this.blocks[row][col] = null;
        this.flatBlocks.delete(_block);
        this.fitCells.delete(_cell);
        this.emptyCells.add(_cell);
        this.map[row][col] = 0;
        break;
      case gi.Action.UPDATE:
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
      cell.setProjection(chunk.getType(), block.getCategory());
      this.projectionCells.add(cell);
    }
  }

  /** 设置变色 */
  setChange(chunk: ChunkControl, startRow: number, startCol: number) {
    const afterPlaceMap = gi.Map.place(this.map, chunk.data, startRow, startCol);

    // 如果产生了消除的话
    if (gi.Map.canRemove(afterPlaceMap)) {
      // 获取假设放下块之后的消除信息
      const removeInfo = gi.Map.remove(afterPlaceMap);
      /** 处理所有行 */
      for (const row of removeInfo.rows) {
        gi.Map.handleRowAll<BlockControl>(this.blocks, row, block => {
          if (block) {
            block.setChange(chunk.getType(), block.getCategory());
            this.changeBlocks.add(block);
          }
        });
      }
      /** 处理所有列 */
      for (const col of removeInfo.cols) {
        gi.Map.handleColumnAll<BlockControl>(this.blocks, col, block => {
          if (block) {
            block.setChange(chunk.getType(), block.getCategory());
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
          const blockNode = gi.Pool.poolGet('block') || gi.prefabBuilder(this.blockPrefab, BlockControl).node;
          const block = blockNode.getComponent(BlockControl);

          block.init();
          block.setCategory(gi.BlockCategory.BASEBLOCK);
          block.setType(item);
          block.setRanks({ row, col });

          block.node.setParent(this.boardNode);
          block.node.setPosition(gi.Board.getRanksPos({ row, col }));

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
        const cell = this.cellBuilder().ctrl;
        const cellPos = this.getCellPos({ row, col });
        this.cells[row][col] = cell;
        this.flatCells.add(cell);
        this.emptyCells.add(cell);
        cell.setRanks({ row, col });
        cell.node.setParent(this.boardNode);
        cell.node.setPosition(cellPos);
      }
    }
  }

  /** 渲染四叉树 */
  renderQuadTree() {
    const boundingBox = this.boardNode.getBoundingBoxToWorld();

    const { x: treeX, y: treeY } = this.boardNode.convertToWorldSpaceAR(cc.v2(0, 0));
    gi.QuadTree.createQuadTree<CellControl>('cell', { x: treeX, y: treeY, width: boundingBox.width, height: boundingBox.height, maxLen: 6 });

    this.flatCells.forEach(cell => {
      // 获取格子的世界坐标
      const { x: cellNodeX, y: cellNodeY } = cell.node.convertToWorldSpaceAR(cc.v2(0, 0));
      // 将所有格子插入四叉树
      gi.QuadTree.treeInsert<CellControl>('cell', { x: cellNodeX, y: cellNodeY, width: cell.node.width, height: cell.node.height, data: cell });
    });
  }

  /** 获取Board中指定行、列格子的位置。坐标系为Board，起始点为左上角 */
  getCellPos({ row, col }: gi.Ranks): cc.Vec2 {
    const beginX = -gi.MAPWIDTH / 2 + gi.CELLWIDTH / 2;
    const beginY = gi.MAPHEIGHT / 2 - gi.CELLHEIGHT / 2;
    const targetX = beginX + col * gi.CELLWIDTH;
    const targetY = beginY - row * gi.CELLHEIGHT;
    return cc.v2(targetX, targetY);
  }

  /** 格子生成器 */
  cellBuilder() {
    const res = gi.prefabBuilder(this.cellPrefab, CellControl);
    res.ctrl.init();
    return res;
  }

  /** 重置Board */
  reset() {
    // 清空所有方块
    this.flatBlocks.forEach(block => {
      block.Remove();
      block.node.destroy();
      this.flatBlocks.delete(block);
    });
    // 重置所有格子的所属
    this.fitCells.forEach(cell => {
      this.emptyCells.add(cell);
      this.fitCells.delete(cell);
    });
    // 重新填充
    for (let row = 0; row < gi.MAPROWS; row++) {
      this.blocks[row] = new Array(gi.MAPCOLS).fill(null);
      this.map[row] = new Array(gi.MAPCOLS).fill(0);
    }
  }
}
