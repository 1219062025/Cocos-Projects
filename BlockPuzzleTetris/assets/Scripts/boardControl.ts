import EventManager from './Common/EventManager';
import { inRange } from './Common/Utils';
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
          const block = this.blockBuilder(item);
          block.setRanks({ row, col });
          block.node.setParent(this.boardNode);
          block.node.setPosition(this.getBlockPos({ row, col }));
          this.updateMap(Action.ADD, row, col, block);
        }
      }
    }
  }

  /** 上升 */
  riseOneRowsTween(length?: number) {
    const _length = length || gi.BLOCKHEIGHT;
    const riseTween = (cc.tween() as cc.Tween).by(0.5, { position: cc.v2(0, _length) }, { easing: 'smooth' });
    return new Promise(resolve => {
      (cc.tween(this.boardNode) as cc.Tween)
        .then(riseTween)
        .call(() => {
          resolve(true);
        })
        .start();
    });
  }

  /** 新增一行 */
  incRow(rowData: number[], map: number[][]) {
    map.shift();
    map.push(rowData);
    return map;
  }

  /** 渲染 */
  renderMap(map: number[][]) {
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        const item = map[row][col];
        if (item === 0) continue;
        const block = this.blocks[row][col];
        if (block) {
          if (item !== block.type) block.setType(item);
          block.setRanks({ row, col });
          block.node.setSiblingIndex(row + row * col);
          this.updateMap(Action.UPDATE, row, col, block);
        } else {
          const newBlock = this.blockBuilder(item);
          newBlock.setRanks({ row, col });
          newBlock.node.setParent(this.boardNode);
          newBlock.node.setSiblingIndex(row + row * col);
          newBlock.node.setPosition(this.getBlockPos({ row, col }));
          this.updateMap(Action.ADD, row, col, newBlock);
        }
      }
    }
  }

  /** 是否可以放置块 */
  canPlaceChunk(chunkData: gi.ChunkData, startRow: number, startCol: number, map: number[][]) {
    const _map = map || this.map;
    for (const blockInfo of chunkData.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;
      if (!inRange(targetCol, 0, gi.MAPCOLS - 1)) {
        return false;
      }

      if (_map[targetRow][targetCol]) {
        return false;
      }
    }
    return true;
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
    const blockNode = cc.instantiate(this.blockPrefab);
    const block = blockNode.getComponent(BlockControl);
    block.init(type);
    return block;
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
