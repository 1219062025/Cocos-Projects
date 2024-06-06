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

  @property({ type: cc.Node, tooltip: '禁止线' })
  line: cc.Node = null;

  /** 放置区域的节点 */
  @property({ type: cc.Node, tooltip: '放置区域的节点' })
  boardNode: cc.Node = null;

  currentChunk: ChunkControl = null;

  startCol: number = -1;

  /** Board的二维数组映射，0代表空位，1代表存在方块 */
  map: number[][] = [];

  /** Board中的所有方块，以二维数组形式表示 */
  blocks: BlockControl[][] = [];
  /** Board中的所有方块，以一维Set形式表示 */
  flatBlocks: Set<BlockControl> = new Set([]);

  get topBlockY() {
    const _blocks = this.blocks;
    const topRow = _blocks.findIndex(item => item.length !== 0);
    if (topRow !== -1) {
      const topBlock = _blocks[topRow].find(item => item !== null);
      const worldPos = topBlock.node.convertToWorldSpaceAR(cc.v2(0, 0));
      const pos = this.boardNode.parent.convertToNodeSpaceAR(worldPos);
      return pos.y;
    } else {
      return 0;
    }
  }

  isRun: boolean = false;

  onTouchMove(event: cc.Event.EventTouch) {
    const v1 = cc.v2(0, 1);
    const v2 = event.getLocation().sub(event.getPreviousLocation());
    if (v2.len() > 2) {
      const c = v2.cross(v1);
      const leftX = -this.boardNode.width / 2 + this.currentChunk.node.width / 2;
      const rightX = this.boardNode.width / 2 - this.currentChunk.node.width / 2;
      let targetX;
      if (c > 0) {
        targetX = this.currentChunk.node.x + v2.len() * 2;
        targetX = targetX <= rightX ? targetX : this.boardNode.width / 2 - this.currentChunk.node.width / 2;
      } else {
        targetX = this.currentChunk.node.x - v2.len() * 2;
        targetX = targetX >= leftX ? targetX : -this.boardNode.width / 2 + this.currentChunk.node.width / 2;
      }
      this.currentChunk.node.x = targetX;
      const startCol = this.getStartBlockRow(this.currentChunk);
      this.setProjection(this.currentChunk.data, startCol);

      // const tween = (cc.tween() as cc.Tween).to(0.01, { position: cc.v2(targetX, this.currentChunk.node.y) });
      // cc.tween(this.currentChunk.node)
      //   .then(tween)
      //   .call(() => {
      //     this.getStartBlockRow(this.currentChunk);
      //   })
      //   .start();
    }
  }

  onTouchEnd(event: cc.Event.EventTouch) {}

  getStartBlockRow(chunk: ChunkControl) {
    const startBlock = chunk.data.startBlock.self;
    const pos = this.boardNode.convertToNodeSpaceAR(startBlock.convertToWorldSpaceAR(cc.v2(0, 0)));
    let col = 0;
    for (let i = 0; i < gi.initiaColCount; i++) {
      const x = i * gi.blockWidth;
      if (x < pos.x + this.boardNode.width / 2) {
        col = i;
      }
    }
    return col;
  }

  setProjection(chunkData: gi.ChunkData, startCol: number) {
    if (this.startCol === startCol) return;
    this.startCol = startCol;
    for (let row = 0; row < this.map.length; row++) {
      const block = this.map[row][startCol];
      if (block) {
      }
    }
    console.log(startCol);
  }

  initBoard(level: number) {
    this.boardNode.setContentSize(gi.gameAreaWidth, gi.gameAreaHeight);
    const levelInfo = LevelList[level];
    for (let row = 0; row < levelInfo.Map.length; row++) {
      if (!this.blocks[row]) {
        this.blocks[row] = new Array(gi.initiaColCount).fill(null);
        this.map[row] = new Array(gi.initiaColCount).fill(0);
      }
      for (let col = 0; col < levelInfo.Map[row].length; col++) {
        const item = levelInfo.Map[row][col];
        if (item !== 9) {
          const block = this.blockBuilder(item);
          block.setRanks({ row, col });
          block.node.setParent(this.node);
          block.node.setPosition(this.getBlockPos({ row, col }));
          this.updateMap(Action.ADD, row, col, block);
        }
      }
    }
    this.boardNode.setPosition(0, -this.boardNode.height / 2);
    this.boardNode.parent.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.boardNode.parent.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.boardNode.parent.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  putChunk(chunk: ChunkControl) {
    this.currentChunk = chunk;
    const leftX = -this.boardNode.width / 2 + chunk.node.width / 2;
    const rightX = this.boardNode.width / 2 - chunk.node.width / 2;
    const x = Math.floor(Math.random() * (rightX + Math.abs(leftX)) - Math.abs(leftX));
    chunk.node.setParent(this.boardNode.parent);
    const y = (this.boardNode.height / 2 - this.line.y) / 2 + this.line.y;
    (cc.tween(chunk.node) as cc.Tween)
      .call(() => {
        chunk.node.setPosition(x, this.boardNode.parent.height / 2 + chunk.node.height);
      })
      .to(0.1, { scale: 1 })
      .to(0.3, { position: cc.v2(x, y) })
      .union()
      .start();
  }

  /** 是否可以放置块 */
  canPlaceChunk(chunkData: gi.ChunkData, startRow: number, startCol: number, map: number[][]) {
    const _map = map || this.map;
    for (const blockInfo of chunkData.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;
      if (!inRange(targetCol, 0, gi.initiaColCount - 1)) {
        return false;
      }

      if (_map[targetRow][targetCol]) {
        return false;
      }
    }
    return true;
  }

  run() {
    this.isRun = true;
  }

  stop() {
    this.isRun = false;
  }

  /** 更新board的映射 */
  updateMap(action: Action, row: number, col: number, block?: BlockControl) {
    const _block = this.blocks[row][col];
    switch (action) {
      case Action.ADD:
        this.blocks[row][col] = block;
        this.flatBlocks.add(block);
        this.map[row][col] = 1;
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
    const beginX = -gi.gameAreaWidth / 2 + gi.blockWidth / 2;
    const beginY = gi.gameAreaHeight / 2 - gi.blockHeight / 2;
    const targetX = beginX + col * gi.blockWidth;
    const targetY = beginY - row * gi.blockHeight;
    return cc.v2(targetX, targetY);
  }

  update(dt: number): void {
    if (this.isRun) {
      this.boardNode.y += 40 * dt;
      if (this.topBlockY > this.line.y) {
        this.stop();
      }
    }
  }
}
