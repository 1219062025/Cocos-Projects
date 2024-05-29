import EventManager from '../Common/EventManager';
import QuadNode from '../Common/QuadNode';
import QuadTree from '../Common/QuadTree';
import { flat } from '../Common/Utils';
import { Libray, Logic, Mode } from '../Type/Enum';
import BoardControl from './BoardControl';
import CellControl from './CellControl';
import ChunkAreaControl from './ChunkAreaControl';
import ChunkControl from './ChunkControl';

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

  /** 格子四叉树 */
  boardQuadTree: QuadTree<CellControl> = null;

  async onLoad() {
    await this.loadGameRes();
    this.loadGameConfig();
    this.initQuadTree();

    const canvas = cc.Canvas.instance.node;
    EventManager.on('TouchStart', this.onTouchStart, this);
    canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    canvas.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    this.chunkArea.generate();
  }

  onTouchStart(Chunk: ChunkControl) {
    this.currentChunk = Chunk;
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (!cc.isValid(this.currentChunk)) return;

    const touchPos = this.currentChunk.node.parent.convertToNodeSpaceAR(event.getLocation());
    const position = cc.v2(touchPos.x, touchPos.y + 100);
    this.currentChunk.node.setPosition(position);

    /** 当前块中起始方块 */
    const startBlock = this.currentChunk.data.startBlock.self;
    /** 起始方块所处位置的格子 */
    const cell = this.getStartCell(this.currentChunk.data.startBlock.self);

    /** ___DEBUG START___ */
    const blocklabel = startBlock.getChildByName('label').getComponent(cc.Label);
    const worldPos = startBlock.convertToWorldSpaceAR(cc.v2(0, 0));
    blocklabel.string = `${worldPos.x.toFixed(0)}\n${worldPos.y.toFixed(0)}`;
    blocklabel.node.setPosition(0, 0);
    /** ___DEBUG END___ */

    if (cell) {
      if (this.startCell === cell) return;
      this.startCell = cell;
      /** 是否可放置该方块 */
      const canPlace = this.board.canPlaceChunk(this.currentChunk.data, cell.row, cell.col, this.board.map);
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
      /** 是否可放置该方块 */
      const canPlace = this.board.canPlaceChunk(this.currentChunk.data, cell.row, cell.col, this.board.map);
      if (canPlace) {
        this.board.placeChunk(this.currentChunk, cell.row, cell.col);
        this.board.clearStatus();
        this.currentChunk.node.destroy();
        this.currentChunk = null;
        if (!this.chunkArea.hasChunkArea()) {
          this.chunkArea.generate();
        }
        this.inspectGameOver();
      } else {
        this.cancelCurrentChunk();
        this.board.clearStatus();
      }
    } else {
      this.cancelCurrentChunk();
      this.board.clearStatus();
    }
  }

  /** 检测剩下的块还能不能继续放入，如果不可以游戏结束 */
  inspectGameOver() {
    // 所有的块都已经放入，游戏继续
    if (!this.chunkArea.hasChunkArea()) return;
    const chunks = this.chunkArea.getChunks();

    /** 是否存在某个块还能继续放入，存在的话游戏继续 */
    const hasCanPlaceChunk = chunks.some(chunk => {
      return Array.from(this.board.emptyCells).some(cell => this.board.canPlaceChunk(chunk.data, cell.row, cell.col, this.board.map));
    });

    if (hasCanPlaceChunk) return;
    this.reset();
  }

  /** 获取指定起始方块所处位置的格子 */
  getStartCell(startBlock: cc.Node) {
    // 获取世界坐标系下当前块中起始方块的位置
    const startBlockPos = startBlock.convertToWorldSpaceAR(cc.v2(0, 0));

    return this.boardQuadTree.search(startBlockPos.x, startBlockPos.y).find(cell => {
      return cell.node.getBoundingBoxToWorld().contains(startBlockPos);
    });
  }

  /** 取消当前选中的块 */
  cancelCurrentChunk() {
    if (!cc.isValid(this.currentChunk)) return;
    const position = cc.v2(0, 0);
    (cc.tween(this.currentChunk.node) as cc.Tween)
      .to(0.03, { scale: 0.6, position })
      .call(() => {})
      .start();
    this.currentChunk = null;
  }

  /** 载入、设置游戏配置 */
  loadGameConfig() {
    gi.setLogic(Logic.ASSISTANCE);
    // gi.setLogic(Logic.EASY);
  }

  /** 载入游戏资源 */
  loadGameRes() {
    /** 提前载入SpriteFrame资源，需要时使用cc.loader.getRes获取 */
    const loadSpritePromise = new Promise(resolve => {
      cc.loader.loadResDir('./', cc.SpriteFrame, (err, assets) => {
        if (err) throw new Error(err.message);
        resolve(true);
      });
    });

    /** 提前载入Json资源，需要时使用cc.loader.getRes获取 */
    const loadJsonPromise = new Promise(resolve => {
      cc.loader.loadResDir('./', cc.JsonAsset, (err, assets) => {
        if (err) throw new Error(err.message);
        resolve(true);
      });
    });

    return Promise.all([loadSpritePromise, loadJsonPromise]);
  }

  /** 初始化四叉树 */
  initQuadTree() {
    // 获取格子区域的世界坐标
    const { x: treeX, y: treeY } = this.boardNode.convertToWorldSpaceAR(cc.v2(0, 0));
    this.boardQuadTree = new QuadTree<CellControl>(treeX, treeY, this.boardNode.width, this.boardNode.height, 4, this.ctx);

    this.board.flatCells.forEach(cell => {
      // 获取格子的世界坐标
      const { x: cellNodeX, y: cellNodeY } = cell.node.convertToWorldSpaceAR(cc.v2(0, 0));
      const Node = new QuadNode<CellControl>(cellNodeX, cellNodeY, cell.node.width, cell.node.height, cell);
      2;

      // 将所有格子插入四叉树
      this.boardQuadTree.insert(Node);
    });
  }

  reset() {
    this.board.reset();
    this.startCell = null;
  }
}
