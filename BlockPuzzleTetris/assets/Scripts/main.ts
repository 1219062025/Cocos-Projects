import { Libray, Logic } from './Type/Enum';
import ChunkAreaControl from './chunkAreaControl';
import BoardControl from './boardControl';
import ChunkControl from './chunkControl';
import LevelList from './Config/LevelConfig';
import BlockControl from './blockControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  @property({ type: ChunkAreaControl })
  chunkArea: ChunkAreaControl = null;

  @property({ type: BoardControl, tooltip: '网格区域' })
  board: BoardControl = null;

  @property({ type: cc.Node, tooltip: '滑动区域' })
  slideArea: cc.Node = null;

  currentChunk: ChunkControl = null;

  currentLevelRow: number = 0;

  startCol: number = -1;
  /** 是否运行 */
  isRun: boolean = false;
  /** 上升距离 */
  totalDistance: number = 0;
  async onLoad() {
    await this.loadGameRes();
    this.loadGameConfig();
    this.initGame();
  }

  /** 初始化游戏 */
  initGame() {
    this.generateChunks();
    this.initBoard();
    this.createCurrentChunk();
    this.slideArea.parent.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.slideArea.parent.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.slideArea.parent.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    this.run();
  }

  onTouchMove(event: cc.Event.EventTouch) {
    const v1 = cc.v2(0, 1);
    const v2 = event.getLocation().sub(event.getPreviousLocation());
    if (v2.len() > 2) {
      const c = v2.cross(v1);
      const leftX = -this.slideArea.width / 2 + this.currentChunk.node.width / 2;
      const rightX = this.slideArea.width / 2 - this.currentChunk.node.width / 2;
      let targetX;
      if (c > 0) {
        targetX = this.currentChunk.node.x + v2.len() * 2;
        targetX = targetX <= rightX ? targetX : this.slideArea.width / 2 - this.currentChunk.node.width / 2;
      } else {
        targetX = this.currentChunk.node.x - v2.len() * 2;
        targetX = targetX >= leftX ? targetX : -this.slideArea.width / 2 + this.currentChunk.node.width / 2;
      }
      this.currentChunk.node.x = targetX;
    }
  }

  onTouchEnd(event: cc.Event.EventTouch) {}

  /** 生成块 */
  generateChunks() {
    /** 获取当前出块逻辑 */
    const logic = gi.getLogic();

    switch (logic) {
      case Logic.EASY:
        this.chunkArea.easyGenerate(Libray.GLOBAL);
        break;
    }
  }

  /** 更新状态 */
  update(dt: number): void {
    if (this.isRun) {
      const ydt = 30 * dt;
      const distance = ydt + this.totalDistance;
      if (distance > gi.BLOCKHEIGHT) {
        this.totalDistance = 0;
        this.board.boardNode.y -= distance;
      } else {
        this.totalDistance = distance;
      }
      if (this.totalDistance === 0) {
        const levelInfo = LevelList[gi.getLevel()];
        if (this.currentLevelRow < levelInfo.Map.length) {
          const rowData = levelInfo.Map[this.currentLevelRow++];
          this.board.incRow(rowData, this.board.map);
          this.board.renderMap(this.board.map);
        } else {
          this.stop();
        }
      }
      this.board.boardNode.y += ydt;
    }
  }

  run() {
    this.isRun = true;
  }

  stop() {
    this.isRun = false;
  }

  /** 初始化网格 */
  initBoard() {
    this.board.map = this.createMap<number>(gi.MAPROWS, gi.MAPCOLS, 0);
    this.board.blocks = this.createMap<BlockControl>(gi.MAPROWS, gi.MAPCOLS, null);
    const levelInfo = LevelList[gi.getLevel()];

    while (this.currentLevelRow <= 10) {
      const rowData = levelInfo.Map[this.currentLevelRow];
      this.board.incRow(rowData, this.board.map);
      this.currentLevelRow++;
    }

    this.board.renderMap(this.board.map);
  }

  createMap<T>(rows: number, cols: number, value: T) {
    const _map: any[][] = [];
    for (let i = 0; i < rows; i++) {
      _map.push(new Array(cols).fill(value));
    }
    return _map;
  }

  /** 拿出一个块 */
  createCurrentChunk() {
    if (this.chunkArea.hasChunkArea()) {
      const chunk = this.chunkArea.shiftChunk();
      const scaleTween = (cc.tween() as cc.Tween).to(0.2, { scale: 1.1 }).to(0.2, { scale: 0 });
      (cc.tween(chunk.node) as cc.Tween)
        .then(scaleTween)
        .call(() => {
          this.currentChunk = chunk;
          this.putToSlideTween(chunk);
        })
        .start();
    } else {
      // 生成
    }
  }

  /** 放入滑动区域的缓动动画 */
  putToSlideTween(chunk: ChunkControl) {
    const leftX = -this.slideArea.width / 2 + chunk.node.width / 2;
    const rightX = this.slideArea.width / 2 - chunk.node.width / 2;

    const x = Math.floor(Math.random() * (rightX + Math.abs(leftX)) - Math.abs(leftX));
    chunk.node.setParent(this.slideArea);
    const y = 0;

    const putTween = (cc.tween() as cc.Tween).to(0.1, { scale: 1 }).to(0.2, { position: cc.v2(x, y) });
    (cc.tween(chunk.node) as cc.Tween)
      .call(() => {
        chunk.node.setPosition(x, this.slideArea.height);
      })
      .then(putTween)
      .start();
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

  /** 载入、设置游戏配置 */
  loadGameConfig() {
    gi.setLogic(Logic.EASY);
  }
}
