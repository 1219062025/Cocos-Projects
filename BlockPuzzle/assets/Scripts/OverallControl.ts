import { GameAreaWidth, GameAreaHeight, InitiaRowCount, InitiaColCount, BlockWidth, BlockHeight, CellWidth, CellHeight, BlockCategory, BlockInfoMap } from './Config/GameConfig';
import LevelList, { LevelInfo } from './Config/LevelConfig';
import { ChunkTemplate, Ranks } from './Game';
import { CellControl } from './CellControl';
import { BlockControl } from './BlockControl';
import { ChunkControl } from './ChunkControl';
import { CenterChildren, InRange, flat } from './Common/Utils';
import QuadTree from './Common/QuadTree';
import QuadNode from './Common/QuadNode';
import EventManager from './Common/EventManager';
import CellAreaControl from './CellAreaControl';
import ChunkAreaControl from './ChunkAreaControl';
const { ccclass, property } = cc._decorator;

@ccclass
export class OverallControl extends cc.Component {
  @property({ type: cc.Node, tooltip: '格子区域节点' })
  CellArea: cc.Node = null;

  @property({ type: CellAreaControl, tooltip: '格子区域的控制脚本' })
  CellAreaControl: CellAreaControl = null;

  @property({ type: cc.Node, tooltip: '方块集合区域节点' })
  ChunkArea: cc.Node = null;

  @property({ type: ChunkAreaControl, tooltip: '方块集合区域的控制脚本' })
  ChunkAreaControl: ChunkAreaControl = null;

  @property({ type: cc.Prefab, tooltip: '格子预制体' })
  CellPrefab: cc.Prefab = null;

  @property({ type: cc.Prefab, tooltip: '方块预制体' })
  BlockPrefab: cc.Prefab = null;

  @property({ tooltip: '关卡数' })
  Level = 0;

  /** ___DEBUG START___ */
  @property({ type: cc.Graphics })
  ctx: cc.Graphics = null;
  /** ___DEBUG END___ */

  /** 当前关卡 */
  CurrentLevelInfo: LevelInfo = null;
  /** 格子四叉树 */
  CellQuadTree: QuadTree<cc.Node> = null;

  /** 当前拖动的方块集合 */
  CurrentChunkNode: cc.Node = null;
  /** 当前拖动的方块集合的脚本 */
  get CurrentChunk() {
    return this.CurrentChunkNode === null ? null : this.CurrentChunkNode.getComponent(ChunkControl);
  }

  /** 匹配当前拖动的方块集合的格子 */
  FitCellNodes: Set<cc.Node> = new Set<cc.Node>([]);

  onLoad() {
    const InitGamePromise = this.InitGameConfig();

    InitGamePromise.then(() => {
      this.GenerateGameArea(this.Level);
      this.InitQuadTree();

      /** ___DEBUG START___ */
      this.ChunkAreaControl.RandomChunk();
      /** ___DEBUG END___ */
    });
  }

  onTouchStart(ChunkNode: cc.Node) {
    this.CurrentChunkNode = ChunkNode;
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (!cc.isValid(this.CurrentChunkNode)) return;

    const TouchPos = this.CurrentChunkNode.parent.convertToNodeSpaceAR(event.getLocation());
    const position = cc.v2(TouchPos.x, TouchPos.y + 100);
    this.CurrentChunkNode.setPosition(position);
    this.SaveVacancyState();
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    if (!cc.isValid(this.CurrentChunkNode)) return;

    if (this.CellAreaControl.isFit) {
      this.PlaceCurrentChunk();
      this.CellAreaControl.Remove();
    } else {
      this.CancelCurrentChunk();
    }
    this.CellAreaControl.ClearState();
  }

  /** 拖动方块集合时检查是否有足够的空位可以放置，如果可以的话保存状态并且设置投影 */
  SaveVacancyState() {
    const { StartBlockNode } = this.CurrentChunk;
    /** 起始块的是世界坐标 */
    const WorldPosition = StartBlockNode.convertToWorldSpaceAR(cc.v2(0, 0));
    /** 根据坐标匹配四叉树中的节点 */
    const MatchedNodes = this.CellQuadTree.Search(WorldPosition.x, WorldPosition.y);

    /** 裁剪值，格子有效区域应该是世界包围盒减掉裁剪值 */
    const CroppingSize = 10;
    /** 方块集合起始块目前可放置的格子 */
    const StartCellNode = MatchedNodes.find(CellNode => {
      /** 格子的世界包围盒 */
      const BoundingBoxToWorld = CellNode.getBoundingBoxToWorld();
      /** 有效区域的包围盒 */
      const EffectiveBox = BoundingBoxToWorld;
      // const EffectiveBox = new cc.Rect(BoundingBoxToWorld.x - CroppingSize, BoundingBoxToWorld.y + CroppingSize, BoundingBoxToWorld.width - CroppingSize * 2, BoundingBoxToWorld.height - CroppingSize * 2);
      return EffectiveBox.contains(WorldPosition);
    });

    if (StartCellNode) {
      this.CellAreaControl.FitAndSetState(StartCellNode, this.CurrentChunkNode);
    } else {
      this.CellAreaControl.ClearState();
    }
  }

  /** 放置方块集合 */
  PlaceCurrentChunk() {
    // 放置逻辑就是：根据方块集合起始块的位置、空位起始格子的位置，计算出方块集合中每个方块的位置

    const CurrentChunkNode = this.CurrentChunkNode;
    const CurrentChunk = this.CurrentChunk;

    /** 空位的起始格子*/
    const StartCellNode = this.CellAreaControl.StartCellNode;
    /** 在格子区域坐标系下的起始位置 */
    const StartPosInCellArea = StartCellNode.getPosition();
    /** 方块集合起始块 */
    const StartBlockNode = CurrentChunk.StartBlockNode;
    /** 根据起始块相对于方块集合的位置，推算出此时方块集合应该放到哪里 */
    const TargetPos = StartPosInCellArea.sub(StartBlockNode.getPosition());

    /** 注意切换坐标系 */
    CurrentChunkNode.setParent(this.CellArea);
    CurrentChunkNode.setPosition(TargetPos);

    // 方块集合的位置设置之后，所有的方块其实就已经在应该在的地方了，只不过所处的坐标系还不是格子区域。
    // 所以下面只需要切换一下坐标系就可以了
    CurrentChunk.ChunkBlockNodes.forEach(BlockInfo => {
      const { self: BlockNode, difRows, difCols } = BlockInfo;
      const { rows: startRows, cols: startCols } = StartCellNode.getComponent(CellControl);
      if (BlockNode) {
        const TargetRows = startRows + difRows;
        const TargetCols = startCols + difCols;
        const Block = BlockNode.getComponent(BlockControl);
        this.CellAreaControl.BlockNodes[TargetRows][TargetCols] = BlockNode;
        Block.SetRanks({ rows: TargetRows, cols: TargetCols });

        /** 注意切换坐标系 */
        const WorldPos = BlockNode.convertToWorldSpaceAR(cc.v2(0, 0));
        BlockNode.setParent(this.CellArea);
        BlockNode.setPosition(this.CellArea.convertToNodeSpaceAR(WorldPos));
      }
    });

    // 以防万一，进行一下判断，确保要取消并销毁的是放置了方块的方块集合
    if (this.CurrentChunkNode !== CurrentChunkNode) {
      this.CancelCurrentChunk();
    }
    CurrentChunkNode.destroy();

    /** ___DEBUG START___ */
    this.ChunkAreaControl.RandomChunk();
    /** ___DEBUG END___ */
  }

  CancelCurrentChunk() {
    const position = cc.v2(0, 0);
    (cc.tween(this.CurrentChunkNode) as cc.Tween).to(0.03, { scale: 0.6, position }).start();
    this.CurrentChunkNode = null;
  }

  /** 初始化游戏配置 */
  InitGameConfig() {
    const canvas = cc.Canvas.instance.node;
    EventManager.on('TouchStart', this.onTouchStart, this);
    canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    canvas.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    /** 载入动态资源，需要某个资源时使用cc.loader.getRes从缓存获取 */
    const loadSpritePromise = new Promise(resolve => {
      cc.loader.loadResDir('./', cc.SpriteFrame, (err, assets) => {
        if (err) throw new Error(err.message);
        resolve(true);
      });
    });

    /** 载入Chunk模板JSON */
    const loadTemplatePromise = this.ChunkAreaControl.Init();

    return Promise.all([loadSpritePromise, loadTemplatePromise]);
  }

  GenerateGameArea(Level: number) {
    this.CurrentLevelInfo = LevelList[Level];
    if (!this.CurrentLevelInfo) throw new Error('不存在关卡信息！');
    this.CellArea.setContentSize(GameAreaWidth, GameAreaHeight);
    const Map = this.CurrentLevelInfo.Map;
    const { CellNodes, BlockNodes } = this.CellAreaControl;
    for (let rows = 0; rows < InitiaRowCount; rows++) {
      if (!Map[rows]) Map[rows] = new Array(InitiaColCount).fill(0);
      if (!CellNodes[rows]) CellNodes[rows] = new Array(InitiaColCount).fill(null);
      if (!BlockNodes[rows]) BlockNodes[rows] = new Array(InitiaColCount).fill(null);
      for (let cols = 0; cols < InitiaColCount; cols++) {
        // 生成初始化格子
        const CellNode = this.CellNodeBuilder({ rows, cols });
        const TargetPos = this.GetCellAreaPos(rows, cols);
        CellNode.setParent(this.CellArea);
        CellNode.setPosition(TargetPos);
        CellNodes[rows][cols] = CellNode;

        const type = Map[rows][cols];
        if (type) {
          // 生成初始化方块
          const BlockNode = this.BlockNodeBuilder(type);
          BlockNode.setParent(this.CellArea);
          BlockNode.setPosition(TargetPos);
          BlockNodes[rows][cols] = BlockNode;
        }
      }
    }
  }

  /** 方块生成器 */
  BlockNodeBuilder(type: number) {
    const BlockNode = cc.instantiate(this.BlockPrefab);
    const Block = BlockNode.getComponent(BlockControl);
    Block.Init(type);
    return BlockNode;
  }

  /** 格子生成器 */
  CellNodeBuilder({ rows, cols }: Ranks) {
    const CellNode = cc.instantiate(this.CellPrefab);
    const Cell = CellNode.getComponent(CellControl);
    Cell.Init(rows, cols);
    return CellNode;
  }

  /** 初始化四叉树 */
  InitQuadTree() {
    // 获取格子区域的世界坐标
    const { x: TreeX, y: TreeY } = this.CellArea.convertToWorldSpaceAR(cc.v2(0, 0));
    this.CellQuadTree = new QuadTree(TreeX, TreeY, this.CellArea.width, this.CellArea.height, 4, this.ctx);

    flat<cc.Node>(this.CellAreaControl.CellNodes).forEach(CellNode => {
      // 获取格子的世界坐标
      const { x: CellNodeX, y: CellNodeY } = CellNode.convertToWorldSpaceAR(cc.v2(0, 0));
      const Node = new QuadNode<cc.Node>(CellNodeX, CellNodeY, CellNode.width, CellNode.height, CellNode);

      // 将所有格子插入四叉树
      this.CellQuadTree.Insert(Node);
    });
  }

  /** 获取CellArea中指定行、列格子CellNode的位置。坐标系为CellArea，锚点为左上角 */
  GetCellAreaPos(rows, cols): cc.Vec2 {
    const BeginX = -GameAreaWidth / 2 + CellWidth / 2;
    const BeginY = GameAreaHeight / 2 - CellHeight / 2;
    const targetX = BeginX + cols * CellWidth;
    const targetY = BeginY - rows * CellHeight;
    return cc.v2(targetX, targetY);
  }
}
