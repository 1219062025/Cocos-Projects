import EventManager from './CommonScripts/EventManager';
import { inRange } from './CommonScripts/Utils';
import LevelList from './Config/LevelConfig';
import { Action } from './Type/Enum';
import BlockControl from './blockControl';
import ChunkControl from './chunkControl';
const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardControl extends cc.Component {
  @property({ type: cc.Prefab, tooltip: '方块预制体' })
  blockPrefab: cc.Prefab = null;

  /** 放置区域的节点 */
  @property({ type: cc.Node, tooltip: '网格区域的节点' })
  boardNode: cc.Node = null;

  currentChunk: ChunkControl = null;

  startCol: number = -1;

  /** Board的二维数组映射，0代表空位，1代表存在方块 */
  map: number[][] = [];

  /** Board中的所有方块，以二维数组形式表示 */
  blocks: BlockControl[][] = [];
  /** Board中的所有方块，以一维Set形式表示 */
  flatBlocks: Set<BlockControl> = new Set([]);

  initBoard(level: number) {
    this.boardNode.setContentSize(gi.MAPWIDTH, gi.MAPHEIGHT);
    const levelInfo = LevelList[level];
    for (let row = 0; row < levelInfo.Map.length; row++) {
      if (!this.blocks[row]) {
        this.blocks[row] = new Array(gi.MAPCOLS).fill(null);
        this.map[row] = new Array(gi.MAPCOLS).fill(0);
      }
      for (let col = 0; col < levelInfo.Map[row].length; col++) {
        const item = levelInfo.Map[row][col];
        if (item !== 0) {
          const block = this.blockBuilder(item).ctrl;
          block.setRanks({ row, col });
          block.node.setParent(this.boardNode);
          block.node.setPosition(this.getBlockPos({ row, col }));
          this.updateMap(Action.ADD, row, col, block);
        }
      }
    }
  }

  /** 新增一行 */
  incRow(rowData: number[], map: number[][]) {
    map.shift();
    map.push(rowData);
    return map;
  }

  /** 渲染 */
  renderMap(map: number[][]) {
    this.clearMap();
    // 从左到右，从上到下
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        const item = map[row][col];

        if (item === 0) continue;

        const block = this.blocks[row][col];
        if (block) {
          // 已存在有block了，更新就行了
          if (item !== block.type) block.setType(item);

          block.setRanks({ row, col });
          block.node.setSiblingIndex(row + row * col);

          this.updateMap(Action.UPDATE, row, col, block);
        } else {
          // 不存在block，新生成一个
          const newBlock = this.blockBuilder(item).ctrl;
          newBlock.setRanks({ row, col });
          newBlock.node.setParent(this.boardNode);
          newBlock.node.setSiblingIndex(row + row * col);
          newBlock.node.setPosition(this.getBlockPos({ row, col }));

          this.updateMap(Action.ADD, row, col, newBlock);
        }
      }
    }
  }

  // 清空当前网格节点
  clearMap() {
    Array.from(this.flatBlocks).forEach(block => {
      this.blocks[block.row][block.col] = null;
      this.flatBlocks.delete(block);
      block.node.destroy();
    });
  }

  incRowProject(chunk: ChunkControl) {
    /** 起始方块 */
    const startBlock = chunk.data.startBlock.self.getComponent(BlockControl);
    startBlock.setRanks({ row: startBlock.row - 1, col: startBlock.col });
  }

  renderProject(chunk: ChunkControl) {
    /** 起始方块 */
    const startBlock = chunk.data.startBlock.self.getComponent(BlockControl);
    const startRow = startBlock.row;
    const startCol = startBlock.col;
    for (const blockInfo of chunk.data.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;

      const block = blockInfo.self.getComponent(BlockControl);
      block.setRanks({ row: targetRow, col: targetCol });
      block.node.setParent(this.boardNode);
      block.node.setSiblingIndex(targetRow + targetRow * targetCol);
      block.node.setPosition(this.getBlockPos({ row: targetRow, col: targetCol }));
    }
  }

  clearProject(chunk: ChunkControl) {
    for (const blockInfo of chunk.data.blocks) {
      blockInfo.self.destroy();
    }
  }

  placeProjectionChunk(chunk: ChunkControl, startRow: number, startCol: number) {
    /** 起始方块 */
    const startBlockNode = chunk.data.startBlock.self;
    /** 根据起始方块相对于块的位置，推算出此时块位于board坐标系下应该放到哪里 */
    const targetPos = this.getBlockPos({ row: startRow, col: startCol }).sub(startBlockNode.getPosition());

    // 切换块的坐标系之后再设置位置
    chunk.node.setParent(this.boardNode);
    chunk.node.setPosition(targetPos);

    for (const blockInfo of chunk.data.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;

      const block = blockInfo.self.getComponent(BlockControl);
      block.setRanks({ row: targetRow, col: targetCol });
    }
  }

  /** 放置块 */
  placeChunk(chunk: ChunkControl, startRow: number, startCol: number) {
    /** 起始方块 */
    const startBlockNode = chunk.data.startBlock.self;
    /** 根据起始方块相对于块的位置，推算出此时块位于board坐标系下应该放到哪里 */
    const targetPos = this.getBlockPos({ row: startRow, col: startCol }).sub(startBlockNode.getPosition());

    const worldPos = this.boardNode.convertToWorldSpaceAR(targetPos);
    const pos = chunk.node.parent.convertToNodeSpaceAR(worldPos);
    return new Promise(resolve => {
      // 切换块的坐标系之后再设置位置
      // chunk.node.setPosition(targetPos);
      // chunk.node.setParent(this.boardNode);
      const time = (pos.len() / gi.BLOCKHEIGHT) * 0.02;
      (cc.tween(chunk.node) as cc.Tween)
        .to(time, { position: pos }, { easing: 'cubicIn' })
        .call(() => {
          for (const blockInfo of chunk.data.blocks) {
            const targetRow = startRow + blockInfo.difRows;
            const targetCol = startCol + blockInfo.difCols;

            const block = blockInfo.self.getComponent(BlockControl);
            block.setRanks({ row: targetRow, col: targetCol });
            this.updateMap(Action.ADD, targetRow, targetCol, block);

            /** 切换坐标系 */
            const worldPos = block.node.convertToWorldSpaceAR(cc.v2(0, 0));
            block.node.setParent(this.boardNode);
            block.node.setPosition(this.getBlockPos({ row: targetRow, col: targetCol }));
          }
          resolve(true);
        })
        .start();
    });
  }

  /** 打印当前节点布局 */
  LogMap() {
    let map = '';
    this.blocks.forEach((rows, row) => {
      rows.forEach((block, col) => {
        const Tab = block ? block.type : 'n';
        map += `${Tab}${col < gi.MAPCOLS - 1 ? ' ' : '\n'}`;
      });
    });
    console.log(map);
  }

  /** 消除方块 */
  removeBlock(removeRows: number[]) {
    const removePromises = [];
    /** 处理所有行 */
    for (const row of removeRows) {
      this.handleRowAll<BlockControl>(this.blocks, row, block => {
        if (block) {
          this.updateMap(Action.REMOVE, block.row, block.col, block);
          removePromises.push(
            new Promise(resolve => {
              block.Remove();
              block.node.destroy();
              this.scheduleOnce(resolve, 0.5);
            })
          );
        }
      });
    }

    EventManager.emit('remove', removeRows.length);

    return Promise.all([...removePromises]);
  }

  /** 获取假设消除方块后的信息 */
  getAfterRemoveBlockInfo(map: number[][]) {
    /** 消除后的map */
    const _map = JSON.parse(JSON.stringify(map)) as number[][];
    /** 消除了哪些行 */
    const rows: number[] = [];

    for (let row = 0; row < gi.MAPROWS; row++) {
      if (this.isRowAllNoTarget(_map, row, 0)) {
        this.setRowAllValue(_map, row, 0);
        rows.push(row);
      }
    }
    /** 一共消除了多少行 */
    const count = rows.length;
    return { map: _map, rows, count };
  }

  /** 是否可以放置块 */
  canPlaceChunk(chunkData: gi.ChunkData, startRow: number, startCol: number, map: number[][]) {
    const _map = map || this.map;
    for (const blockInfo of chunkData.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;
      if (!inRange(targetRow, 0, gi.MAPROWS - 1) || !inRange(targetCol, 0, gi.MAPCOLS - 1)) {
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
      if (this.isRowAllNoTarget(_map, row, 0)) return true;
    }

    return false;
  }

  /** 对传入的二维T泛型数组的某行执行操作 */
  handleRowAll<T>(map: T[][], row: number, func: (item: T) => void) {
    for (let col = 0; col < map[row].length; col++) {
      func.call(this, map[row][col]);
    }
  }

  /** 某行是否全是target值 */
  isRowAllNoTarget(map: number[][], row: number, target: any) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === target) {
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

  /** 更新映射 */
  updateMap(action: Action, row: number, col: number, block?: BlockControl) {
    const _block = this.blocks[row][col];
    switch (action) {
      case Action.ADD:
        this.blocks[row][col] = block;
        this.flatBlocks.add(block);
        this.map[row][col] = block.type;
        break;
      case Action.REMOVE:
        this.blocks[row][col] = null;
        this.flatBlocks.delete(_block);
        this.map[row][col] = 0;
        break;
      case Action.UPDATE:
        this.blocks[row][col] = block;
        this.flatBlocks.delete(_block);
        this.flatBlocks.add(block);
        this.map[row][col] = block.type;
        break;

      default:
        break;
    }
  }

  /** 方块生成器 */
  blockBuilder(type: number) {
    const res = gi.prefabBuilder(this.blockPrefab, BlockControl);
    res.ctrl.init(type);
    return res;
  }

  /** 获取Board中指定行、列格子的位置。坐标系为Board，起始点为左上角 */
  getBlockPos({ row, col }: gi.Ranks): cc.Vec2 {
    const beginX = -gi.MAPWIDTH / 2 + gi.BLOCKWIDTH / 2;
    const beginY = gi.MAPHEIGHT / 2 - gi.BLOCKHEIGHT / 2;
    const targetX = beginX + col * gi.BLOCKWIDTH;
    const targetY = beginY - row * gi.BLOCKHEIGHT;
    return cc.v2(targetX, targetY);
  }
}
