import BoardControl from './boardControl';
import CellControl from './cellControl';
import ChunkAreaControl from './chunkAreaControl';
import ChunkControl from './chunkControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  @property({ type: cc.Node, tooltip: '放置区域的节点' })
  boardNode: cc.Node = null;

  @property({ type: BoardControl, tooltip: '放置区域的控制脚本' })
  board: BoardControl = null;

  @property({ type: ChunkAreaControl, tooltip: '块生成区域的控制脚本' })
  chunkArea: ChunkAreaControl = null;

  /** ___DEBUG START___ */
  @property({ type: cc.Graphics })
  ctx: cc.Graphics = null;
  /** ___DEBUG END___ */

  /** 当前选中的块 */
  currentChunk: ChunkControl = null;

  startCell: CellControl = null;

  onLoad() {
    gi.loadGameRes().then(() => {
      gi.loadGameConfig();
      this.initGame();
    });
  }

  initGame() {
    this.board.initBoard();

    gi.Board.init(this.board);

    const canvas = cc.Canvas.instance.node;
    gi.Event.on('touchStart', this.onTouchStart, this);
    canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    canvas.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    this.chunkArea.generate();
  }

  onTouchStart(chunk: ChunkControl) {
    this.currentChunk = chunk;
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (!cc.isValid(this.currentChunk)) return;

    const touchPos = this.currentChunk.node.parent.convertToNodeSpaceAR(event.getLocation());
    const position = cc.v2(touchPos.x, touchPos.y + 100);
    this.currentChunk.node.setPosition(position);

    /** 当前块中起始方块 */
    const startBlock = this.currentChunk.data.startBlock.self;
    /** 起始方块所处位置的格子 */
    const cell = this.getStartCell(startBlock);

    /** ___DEBUG START___ */
    // const blocklabel = startBlock.getChildByName('label').getComponent(cc.Label);
    // const worldPos = startBlock.convertToWorldSpaceAR(cc.v2(0, 0));
    // blocklabel.string = `${worldPos.x.toFixed(0)}\n${worldPos.y.toFixed(0)}`;
    // blocklabel.node.setPosition(0, 0);
    /** ___DEBUG END___ */

    if (cell) {
      if (this.startCell === cell) return;
      this.startCell = cell;
      /** 是否可放置该方块 */
      const canPlace = gi.Map.canPlace(this.board.map, this.currentChunk.data, cell.row, cell.col);
      if (canPlace) {
        this.board.updateStatus(this.currentChunk, cell.row, cell.col);
      } else {
        this.board.clearStatus();
      }
    } else {
      this.startCell = cell;
      this.board.clearStatus();
    }
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    if (!cc.isValid(this.currentChunk)) return;

    /** 当前块中起始方块 */
    const startBlock = this.currentChunk.data.startBlock.self;
    /** 起始方块所处位置的格子 */
    const cell = this.getStartCell(startBlock);

    if (cell) {
      if (this.startCell !== cell) return;
      const chunkData = this.currentChunk.data; // 块数据
      const startRow = cell.row; // 起始行
      const startCol = cell.col; // 起始列
      const map = this.board.map; // 映射

      /** 是否可放置该方块 */
      const canPlace = gi.Map.canPlace(map, chunkData, startRow, startCol);
      if (canPlace) {
        this.board.placeChunk(this.currentChunk, startRow, startCol);

        if (gi.Map.canRemove(map)) {
          const removeInfo = gi.Map.remove(map);
          this.board.removeBlock(removeInfo.rows, removeInfo.cols);
          gi.Utils.shake();
        }

        this.currentChunk.splitArea();
        this.currentChunk.node.destroy();

        if (!this.chunkArea.hasChunkArea()) {
          this.chunkArea.generate();
        }
        this.inspectGameOver();
      }
    }

    this.cancelCurrentChunk();
    this.board.clearStatus();
  }

  /** 检测剩下的块还能不能继续放入，如果不可以游戏结束 */
  inspectGameOver() {
    // 所有的块都已经放入，游戏继续
    if (!this.chunkArea.hasChunkArea()) return;
    const chunks = this.chunkArea.getChunks();

    /** 是否存在某个块还能继续放入，存在的话游戏继续 */
    const hasCanPlaceChunk = chunks.some(chunk => {
      return Array.from(this.board.emptyCells).some(cell => gi.Map.canPlace(this.board.map, chunk.data, cell.row, cell.col));
    });

    if (hasCanPlaceChunk) return;
    this.reset();
  }

  /** 获取指定起始方块所处位置的格子 */
  getStartCell(startBlock: cc.Node) {
    // 获取世界坐标系下当前块中起始方块的位置
    const startBlockPos = startBlock.convertToWorldSpaceAR(cc.v2(0, 0));

    return gi.QuadTree.treeSearch<CellControl>('cell', startBlockPos.x, startBlockPos.y).find(cell => {
      return cell.node.getBoundingBoxToWorld().contains(startBlockPos);
    });
  }

  /** 取消当前选中的块 */
  cancelCurrentChunk() {
    if (!cc.isValid(this.currentChunk)) return;
    const position = cc.v2(0, 0);
    (cc.tween(this.currentChunk.node) as cc.Tween)
      .to(0.03, { scale: gi.CHUNKSCALE, position })
      .call(() => {})
      .start();
    this.currentChunk = null;
  }

  reset() {
    this.board.reset();
    this.startCell = null;
  }
}
