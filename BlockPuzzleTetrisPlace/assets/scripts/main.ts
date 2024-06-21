import ChunkAreaControl from './chunkAreaControl';
import BoardControl from './boardControl';
import ChunkControl from './chunkControl';
import LevelList from './config/LevelConfig';
import BlockControl from './blockControl';
import EventManager from './commonScripts/EventManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  /** 块区域 */
  @property({ type: ChunkAreaControl })
  chunkArea: ChunkAreaControl = null;

  /** 网格区域 */
  @property({ type: BoardControl, tooltip: '网格区域' })
  board: BoardControl = null;

  /** 滑动区域 */
  @property({ type: cc.Node, tooltip: '滑动区域' })
  slideArea: cc.Node = null;

  @property({ type: cc.Node, tooltip: '游戏区域' })
  wrap: cc.Node = null;

  /** 当前选中块 */
  currentChunk: ChunkControl = null;

  /** 是否运行 */
  isRun: boolean = false;

  /** 到达下一行前的上升距离 */
  totalDistance: number = 0;

  onLoad() {
    gi.loadGameRes().then(() => {
      gi.loadGameConfig();
      this.initGame();
    });
  }

  /** 初始化游戏 */
  initGame() {
    this.generateChunks();
    this.initBoard();
    this.slideArea.parent.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.slideArea.parent.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.slideArea.parent.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    this.run();
  }

  onTouchMove(event: cc.Event.EventTouch) {}

  onTouchEnd(event: cc.Event.EventTouch) {}

  /** 生成块 */
  generateChunks() {
    /** 获取当前出块逻辑 */
    const logic = gi.getLogic();

    switch (logic) {
      case gi.Logic.EASY:
        this.chunkArea.easyGenerate(gi.Libray.GLOBAL);
        break;
    }
  }

  /** 更新状态 */
  update(dt: number) {
    if (this.isRun) {
      /** 每一帧移动的距离 */
      const ydt = 50 * dt;
      /** 到达下一行前移动的距离 */
      const distance = ydt + this.totalDistance;

      // 当distance > gi.BLOCKHEIGHT时意味着已经上升了一行的距离，此时就需要做处理
      if (distance > gi.BLOCKHEIGHT) {
        this.totalDistance = 0;

        // 到顶了，游戏结束
        if (this.board.hasTopRowBlock) {
        }

        // 拉回整个棋盘
        this.board.boardNode.y -= distance;

        // 渲染棋盘
        // this.board.incRow(rowData, this.board.map);
        // this.board.renderMap(this.board.map);
      } else {
        this.totalDistance = distance;
      }

      // 不管需不需要拉回棋盘，该走的距离都得走才能保持连贯性
      this.board.boardNode.y += ydt;
    }
  }

  /** 运行 */
  run() {
    this.isRun = true;
  }

  /** 暂停 */
  stop() {
    this.isRun = false;
  }

  /** 初始化网格 */
  initBoard() {
    this.board.map = this.createMap<number>(gi.MAPROWS, gi.MAPCOLS, 0);
    this.board.blocks = this.createMap<BlockControl>(gi.MAPROWS, gi.MAPCOLS, null);
    const levelInfo = LevelList[gi.getLevel()];
    // while (this.currentLevelRow <= 10) {
    //   const rowData = levelInfo.Map[this.currentLevelRow];
    //   this.board.incRow(rowData, this.board.map);
    //   this.currentLevelRow++;
    // }

    this.board.renderMap(this.board.map);
  }

  /** 创建映射 */
  createMap<T>(rows: number, cols: number, value: T) {
    const _map: T[][] = [];
    for (let i = 0; i < rows; i++) {
      _map.push(new Array(cols).fill(value));
    }
    return _map;
  }
}
