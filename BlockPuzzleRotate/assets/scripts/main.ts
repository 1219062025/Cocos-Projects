import ChunkAreaControl from './chunkAreaControl';
import BoardControl from './boardControl';
import ChunkControl from './chunkControl';
import LevelList from './config/levelConfig';
import BlockControl from './blockControl';
import CellControl from './cellControl';
import Counter from './commonScripts/Counter';
import GuideIcon from './guideControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  /** 块区域 */
  @property({ type: ChunkAreaControl })
  chunkArea: ChunkAreaControl = null;

  @property({ type: cc.Node, tooltip: '结束弹窗' })
  pop: cc.Node = null;

  /** 网格区域 */
  @property({ type: BoardControl, tooltip: '网格区域' })
  board: BoardControl = null;

  @property({ type: cc.Node, tooltip: '游戏区域' })
  wrap: cc.Node = null;

  @property({ type: cc.Prefab, tooltip: '效果预制体' })
  effectPrefab: cc.Prefab = null;

  @property(Counter)
  counter: Counter = null;

  @property({ type: GuideIcon })
  guideIcon: GuideIcon = null;

  /** 当前选中块 */
  currentChunk: ChunkControl = null;

  startCell: CellControl = null;

  onLoad() {
    gi.loadGameRes().then(() => {
      gi.loadGameConfig();
      this.initGame();
    });
  }

  /** 初始化游戏 */
  initGame() {
    this.generateChunks();
    this.board.initBoard(gi.getLevel());

    // 创建Effect对象池
    gi.createPool('effect', 3, this.effectPrefab);

    const canvas = cc.Canvas.instance.node;
    gi.EventManager.on('rotate', this.onRotate, this);
    gi.EventManager.on('toggle', this.onToggle, this);
    gi.EventManager.on('placeChunk', this.onPlaceChunk, this);
    gi.EventManager.on('removeBlock', this.onRemoveBlock, this);
    gi.EventManager.on('touchStart', this.onTouchStart, this);
    gi.EventManager.on(
      'resize',
      () => {
        this.scheduleOnce(() => {
          this.runGuide(gi.Guide.step);
        });
      },
      this
    );
    canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    canvas.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    /** ___DEBUG START___ */
    if (gi.Guide.inGuide) {
      this.guideIcon.node.active = true;
      this.runGuide(gi.Guide.step);
    }
    /** ___DEBUG END___ */
  }

  /** 监听消除方块事件 */
  onRemoveBlock(chunkPos: cc.Vec2) {
    this.counter.by(100);
    gi.score += 100;
    if (gi.score >= 600) {
      this.end();
    }
    this.shake();
    const effectsNode = gi.poolGet('effect') || cc.instantiate(this.effectPrefab);
    const index = Math.floor(Math.random() * effectsNode.childrenCount);

    effectsNode.children[index].active = true;
    effectsNode.setSiblingIndex(100);
    effectsNode.setParent(this.board.boardNode);
    effectsNode.setPosition(chunkPos);
    (cc.tween(effectsNode) as cc.Tween)
      .call(() => {
        effectsNode.setScale(0);
        effectsNode.opacity = 255;
      })
      .to(0.2, { scale: 1.2, position: cc.v2(effectsNode.x, effectsNode.y + 30) })
      .to(0.2, { scale: 1, position: cc.v2(effectsNode.x, effectsNode.y + 30) })
      .to(0.8, { opacity: 0, position: cc.v2(effectsNode.x, effectsNode.y + 120) })
      .union()
      .call(() => {
        effectsNode.children[index].active = false;
        gi.poolPut('effect', effectsNode);
      })
      .start();
  }

  end() {
    this.pop.active = true;
    (cc.tween(this.pop) as cc.Tween).to(1, { opacity: 255 }).start();
  }

  /** ___DEBUG START___ */
  /** 监听放置方块事件 */
  onPlaceChunk() {
    if (gi.Guide.inGuide) {
      gi.Guide.step++;
      this.runGuide(gi.Guide.step);
    }
  }

  onToggle(isChecked: boolean) {
    if (gi.Guide.inGuide) {
      gi.Guide.step++;
      this.runGuide(gi.Guide.step);
    }
  }

  onRotate() {
    if (gi.Guide.inGuide) {
      gi.Guide.step++;
      this.runGuide(gi.Guide.step);
    }
  }

  /** 运行引导 */
  runGuide(step: number) {
    // 引导步骤一，拖动第一块到格子
    if (step === 1) {
      this.guideIcon.node.stopAllActions();
      const chunk = this.chunkArea.areaList[0].chunk;
      const chunkData = gi.getChunk(chunk.data.id);
      const type = chunk.getType();
      const copyChunk = this.chunkArea.chunkBuilder(chunkData).ctrl;
      copyChunk.setType(type);

      const fromNode1 = this.chunkArea.areaList[0].node;
      const toNode1 = this.board.cells[6][0].node;
      const moveTween = this.guideIcon.moveNode(fromNode1, toNode1, { time: 1.5, node: copyChunk.node });
      gi.Guide.currentTween = moveTween.union().repeatForever();
      gi.Guide.currentTween.start();
    } else if (step === 2) {
      this.guideIcon.node.stopAllActions();
      this.guideIcon.destroyCopyNode();
      const rotateNode = cc.find('Canvas/rotate_check');

      const canvas = cc.Canvas.instance.node;
      const rotatePos = canvas.convertToNodeSpaceAR(rotateNode.convertToWorldSpaceAR(cc.v2(0, 0)));

      /** 移动到开启旋转按钮上 */
      this.guideIcon.movePos(this.guideIcon.node.getPosition(), rotatePos, { time: 0.5 }).start();

      /** 提示点击 */
      this.guideIcon.promptClick();
    } else if (step === 3) {
      this.guideIcon.node.stopAllActions();
      const areaNode = this.chunkArea.areaList[1].node;

      const canvas = cc.Canvas.instance.node;
      const areaPos = canvas.convertToNodeSpaceAR(areaNode.convertToWorldSpaceAR(cc.v2(0, 0)));
      /** 移动到开启旋转按钮上 */
      this.guideIcon.movePos(this.guideIcon.node.getPosition(), areaPos, { time: 0.5 }).start();

      /** 提示点击 */
      this.guideIcon.promptClick();
    } else if (step === 4) {
      this.guideIcon.node.stopAllActions();
      const rotateNode = cc.find('Canvas/rotate_check');

      const canvas = cc.Canvas.instance.node;
      const rotatePos = canvas.convertToNodeSpaceAR(rotateNode.convertToWorldSpaceAR(cc.v2(0, 0)));

      /** 移动到开启旋转按钮上 */
      this.guideIcon.movePos(this.guideIcon.node.getPosition(), rotatePos, { time: 0.5 }).start();

      /** 提示点击 */
      this.guideIcon.promptClick();
    } else if (step === 5) {
      this.guideIcon.node.stopAllActions();
      const chunk = this.chunkArea.areaList[1].chunk;
      const chunkData = gi.getChunk(chunk.data.id);
      const type = chunk.getType();
      const copyChunk = this.chunkArea.chunkBuilder(chunkData).ctrl;
      copyChunk.setType(type);

      const fromNode1 = this.chunkArea.areaList[1].node;
      const toNode1 = this.board.cells[5][4].node;
      const moveTween = this.guideIcon.moveNode(fromNode1, toNode1, { time: 1.5, node: copyChunk.node });
      gi.Guide.currentTween = moveTween.union().repeatForever();
      gi.Guide.currentTween.start();
    } else {
      if (this.guideIcon.node) {
        this.guideIcon.node.stopAllActions();
        this.guideIcon.destroyCopyNode();
        this.guideIcon.node.destroy();
        gi.Guide.inGuide = false;
      }
    }
  }

  isAccordGuide({ row, col }: gi.Ranks) {
    if (!gi.Guide.inGuide) return true;

    if (gi.Guide.step === 1) {
      if (row !== 5 || col !== 0) return false;
    }

    if (gi.Guide.step === 5) {
      if (row !== 5 || col !== 3) return false;
    }
    return true;
  }
  /** ___DEBUG END___ */

  onTouchStart(Chunk: ChunkControl) {
    this.currentChunk = Chunk;
    if (this.guideIcon.node && [1, 5].includes(gi.Guide.step)) {
      this.guideIcon.node.active = false;
      this.guideIcon.node.stopAllActions();
    }
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

    if (cell) {
      /** ___DEBUG START___ */
      if (!this.isAccordGuide({ row: cell.row, col: cell.col })) {
        this.board.clearStatus();
        return;
      }
      /** ___DEBUG END___ */

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
    if (this.guideIcon.node && [1, 5].includes(gi.Guide.step)) {
      this.guideIcon.node.active = true;
      gi.Guide.currentTween.start();
    }
    if (!cc.isValid(this.currentChunk)) return;

    /** 当前块中起始方块 */
    const startBlock = this.currentChunk.data.startBlock.self;
    /** 起始方块所处位置的格子 */
    const cell = this.getStartCell(startBlock);

    if (cell) {
      /** ___DEBUG START___ */
      if (!this.isAccordGuide({ row: cell.row, col: cell.col })) {
        this.cancelCurrentChunk();
        this.board.clearStatus();
        return;
      }
      /** ___DEBUG END___ */

      if (this.startCell !== cell) return;
      /** 是否可放置该方块 */
      const canPlace = this.board.canPlaceChunk(this.currentChunk.data, cell.row, cell.col, this.board.map);
      if (canPlace) {
        this.board.placeChunk(this.currentChunk, cell.row, cell.col);
        this.board.clearStatus();
        this.currentChunk.splitArea();
        this.currentChunk.node.destroy();
        this.currentChunk = null;

        gi.handleCount++;
        if (gi.handleCount >= 10) {
          this.end();
          return;
        }

        if (!this.chunkArea.hasChunkArea()) {
          this.generateChunks();
        }
        // this.inspectGameOver();
      } else {
        this.cancelCurrentChunk();
        this.board.clearStatus();
      }
    } else {
      this.cancelCurrentChunk();
      this.board.clearStatus();
    }
  }

  /** 获取指定起始方块所处位置的格子 */
  getStartCell(startBlock: cc.Node) {
    // 获取世界坐标系下当前块中起始方块的位置
    const startBlockPos = startBlock.convertToWorldSpaceAR(cc.v2(0, 0));

    return gi.treeSearch<CellControl>('cell', startBlockPos.x, startBlockPos.y).find(cell => {
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

  /** 生成块 */
  generateChunks() {
    this.chunkArea.easyGenerate();
  }

  /** 屏幕振动 */
  shake() {
    const camera = cc.Camera.main;

    if (camera) {
      const originalPosition = camera.node.position;
      const amplitude = 8; // 振动幅度
      const duration = 0.3; // 振动总时间
      const frequency = 0.05; // 振动频率

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
}
