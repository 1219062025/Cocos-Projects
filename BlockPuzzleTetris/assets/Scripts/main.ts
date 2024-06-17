import { Action, BaseBlock, Libray, Logic } from './Type/Enum';
import ChunkAreaControl from './chunkAreaControl';
import BoardControl from './boardControl';
import ChunkControl from './chunkControl';
import LevelList from './Config/LevelConfig';
import BlockControl from './blockControl';
import EventManager from './CommonScripts/EventManager';

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

  @property({ type: cc.Node, tooltip: '结束弹窗' })
  pop: cc.Node = null;

  @property({ type: cc.Node, tooltip: '游戏区域' })
  wrap: cc.Node = null;

  @property({ type: cc.ProgressBar, tooltip: '进度条' })
  progress: cc.ProgressBar = null;

  @property(cc.Node)
  guide: cc.Node = null;

  /** 当前选中块 */
  currentChunk: ChunkControl = null;

  /** 投影块 */
  projectChunk: ChunkControl = null;

  currentLevelRow: number = 0;

  /** 是否运行 */
  isRun: boolean = false;

  /** 到达下一行前的上升距离 */
  totalDistance: number = 0;

  /** 顶部行是否存在block */
  get hasTopRowBlock() {
    const topRowBlock = this.board.blocks[0].find(block => block);
    return Boolean(topRowBlock);
  }

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
    this.slideArea.parent.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.slideArea.parent.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.slideArea.parent.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.slideArea.parent.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    EventManager.on('remove', this.onRemove, this);
    this.run();
  }

  onTouchStart() {
    this.guide.active = false;
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (!this.currentChunk) return;
    const v1 = cc.v2(0, 1);
    const v2 = event.getLocation().sub(event.getPreviousLocation());
    // 触摸一定距离才算有效，避免抖动
    if (v2.len() > 2) {
      let targetX;
      const c = v2.cross(v1);
      /** 可滑动的最左侧x值 */
      const leftX = -this.slideArea.width / 2 + this.currentChunk.node.width / 2;
      /** 可滑动的最右侧x值 */
      const rightX = this.slideArea.width / 2 - this.currentChunk.node.width / 2;
      // 根据v2与v1叉乘的值判断触摸移动方向是左边还是右边
      if (c > 0) {
        // 正值意味着v2在v1的右侧
        targetX = this.currentChunk.node.x + v2.len() * 2;
        targetX = targetX <= rightX ? targetX : this.slideArea.width / 2 - this.currentChunk.node.width / 2;
      } else {
        // 负值意味着v2在v1的左侧
        targetX = this.currentChunk.node.x - v2.len() * 2;
        targetX = targetX >= leftX ? targetX : -this.slideArea.width / 2 + this.currentChunk.node.width / 2;
      }
      this.currentChunk.node.x = targetX;
      const libray = gi.getLibrary(Libray.GLOBAL);
      const chunkData = libray.find(chunkData => chunkData.id === this.currentChunk.data.id);
      this.setProjection(chunkData);
    }
  }

  async onTouchEnd(event: cc.Event.EventTouch) {
    if (!this.currentChunk) return;
    let startCol = this.getSlideStartCol(this.currentChunk.data.startBlock.self);
    // 如果startRow为undefined则赋值最后一行
    let startRow = this.getSlideStartRow(startCol) || gi.MAPROWS - 1;

    // 从startRow开始逐行向上检查块是否可以放入
    while (startRow >= 0) {
      if (this.board.canPlaceChunk(this.currentChunk.data, startRow, startCol, this.board.map)) {
        await this.board.placeChunk(this.currentChunk, startRow, startCol);

        this.currentChunk = null;

        // 清除投影
        this.board.clearProject(this.projectChunk);
        this.projectChunk = null;

        // 消除方块以及填补位置
        await this.inspectRemoveAndCollapse(this.board.map);

        if (!this.chunkArea.hasChunkArea()) {
          this.end();
        }
        // 获取新的块
        this.createCurrentChunk();
        return;
      }
      startRow--;
    }
  }

  onRemove(rows: number) {
    const total = 10;
    const value = rows / total;
    this.shake();
    (cc.tween(this.progress) as cc.Tween)
      .to(0.4, { progress: this.progress.progress + value }, { easing: 'sineInOut' })
      .call(() => {
        if (this.progress.progress >= 1) {
          this.end();
        }
      })
      .start();
  }

  async inspectRemoveAndCollapse(map: number[][]) {
    // 检查是否存在可消除的行，如果不存在则返回当前map，否则递归
    if (this.board.canRemoveBlock(map) === false) return (this.board.map = map);
    this.stop();

    const removeInfo = this.board.getAfterRemoveBlockInfo(map);
    await this.board.removeBlock(removeInfo.rows);

    /** 上一行 */
    let preRow = removeInfo.rows.sort((a, b) => a - b)[0] - 1;

    const promises = [];
    // 从消除的最小行的上一行开始往上遍历
    while (preRow >= 0) {
      this.board.blocks[preRow].forEach(block => {
        if (block) {
          const y = removeInfo.rows.length * gi.BLOCKHEIGHT;
          promises.push(this.collapse(block, this.board.map));
        }
      });
      preRow--;
    }
    await Promise.all([...promises]);
    this.board.renderMap(map);
    await this.inspectRemoveAndCollapse(map);

    this.run();
  }

  collapse(block: BlockControl, map: number[][]) {
    let collapseRow = 0;
    let r = block.row + 1;
    while (r < gi.MAPROWS) {
      if (map[r][block.col] === 0) {
        collapseRow++;
        r++;
      } else {
        break;
      }
    }
    const y = collapseRow * gi.BLOCKHEIGHT;
    return new Promise(resolve => {
      const time = (y / gi.BLOCKHEIGHT) * 0.1;
      (cc.tween(block.node) as cc.Tween)
        .by(time, { position: cc.v2(0, -y) })
        .call(() => {
          resolve(true);
        })
        .start();
      this.board.updateMap(Action.UPDATE, block.row + collapseRow, block.col, block);
      this.board.updateMap(Action.REMOVE, block.row, block.col);
    });
  }

  /** 获取当前块的起始方块在滑动区域所处列 */
  getSlideStartCol(startBlock: cc.Node) {
    const worldPos = startBlock.convertToWorldSpaceAR(cc.v2(0, 0));

    const startBlockX = this.board.boardNode.convertToNodeSpaceAR(worldPos).x + this.board.boardNode.width / 2;
    for (let i = 1; i <= gi.MAPCOLS; i++) {
      const x = gi.BLOCKWIDTH * i;
      if (startBlockX < x) {
        return i - 1;
      }
    }
  }

  /** 找到所处列最顶部block的上一行，如果该列不存在block的话则为undefined */
  getSlideStartRow(startCol: number) {
    for (let row = 0; row < gi.MAPROWS; row++) {
      const block = this.board.blocks[row][startCol];
      if (block) {
        return row - 1;
      }
    }
  }

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
  update(dt: number) {
    if (this.isRun) {
      /** 每一帧移动的距离 */
      const ydt = 50 * dt;
      // const ydt = 250 * dt;
      /** 到达下一行前移动的距离 */
      const distance = ydt + this.totalDistance;
      /** 关卡信息 */
      const levelInfo = LevelList[gi.getLevel()];
      /** 行数据 */
      let rowData;

      // 当distance > gi.BLOCKHEIGHT时意味着已经上升了一行的距离，此时就需要做处理
      if (distance > gi.BLOCKHEIGHT) {
        this.totalDistance = 0;

        // 到顶了，游戏结束
        if (this.hasTopRowBlock) {
          return this.end();
          // return this.stop();
        }

        // 关卡里面取行数据或者随机生成
        if (this.currentLevelRow < levelInfo.Map.length) {
          rowData = levelInfo.Map[this.currentLevelRow++];
        } else {
          rowData = [];
          for (let i = 0; i < gi.MAPCOLS; i++) {
            rowData.push(Math.random() > 0.6 ? Math.floor(Math.random() * gi.BASEBLOCKCOUNT + 1) : 0);
          }
        }

        // 拉回整个棋盘
        this.board.boardNode.y -= distance;

        // 渲染投影
        if (this.projectChunk) {
          this.board.incRowProject(this.projectChunk);
          this.board.renderProject(this.projectChunk);
        }

        // 渲染棋盘
        this.board.incRow(rowData, this.board.map);
        this.board.renderMap(this.board.map);
      } else {
        this.totalDistance = distance;
      }

      // 不管需不需要拉回棋盘，该走的距离都得走才能保持连贯性
      this.board.boardNode.y += ydt;
    }
  }

  /** 设置投影 */
  setProjection(chunkData: gi.ChunkData) {
    let startCol = this.getSlideStartCol(this.currentChunk.data.startBlock.self);
    // 如果startRow为undefined则赋值最后一行
    let startRow = this.getSlideStartRow(startCol) || gi.MAPROWS - 1;

    // 从startRow开始逐行向上检查块是否可以放入
    while (startRow >= 0) {
      if (this.board.canPlaceChunk(chunkData, startRow, startCol, this.board.map)) {
        if (!this.projectChunk || this.projectChunk.data.id !== chunkData.id) {
          // 设置投影
          this.projectChunk = this.chunkArea.chunkBuilder(chunkData).ctrl;
          this.projectChunk.setType(BaseBlock.GREY);
        }
        const projectStartCol = this.getSlideStartCol(this.projectChunk.data.startBlock.self);
        if (startCol !== projectStartCol) {
          this.board.placeProjectionChunk(this.projectChunk, startRow, startCol);
          this.board.renderProject(this.projectChunk);
        }
        return;
      }
      startRow--;
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

  end() {
    this.stop();
    this.guide.active = false;
    this.pop.active = true;
    (cc.tween(this.pop) as cc.Tween).to(1, { opacity: 255 }).start();
  }

  shake() {
    const camera = cc.Camera.main;

    if (camera) {
      const originalPosition = camera.node.position;
      const amplitude = 10; // 振动幅度
      const duration = 0.5; // 振动总时间
      const frequency = 0.05; // 振动频率

      let elapsedTime = 0;
      let shakeTime = 0;

      this.schedule(() => {
        shakeTime += frequency;
        if (shakeTime > duration) {
          camera.node.setPosition(originalPosition); // 振动结束后恢复原位
          this.unscheduleAllCallbacks();
          return;
        }

        const offsetX = (Math.random() - 0.5) * amplitude * 2;
        const offsetY = (Math.random() - 0.5) * amplitude * 2;
        camera.node.setPosition(originalPosition.add(cc.v3(offsetX, offsetY, 0)));
      }, frequency);
    }
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

  /** 创建映射 */
  createMap<T>(rows: number, cols: number, value: T) {
    const _map: T[][] = [];
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
