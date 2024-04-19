import EventManager from './Common/EventManager';
import CellControl from './CellControl';
import { TileType, TileWidth, TileHeight, GameAreaHeight, InitiaRowCount } from './Config/Game';
import { Level } from './Config/Level';
import { flat } from './Common/Utils';
import TileControl from './TileControl';
import TipsControl from './TipsControl';
import AwardControl from './AwardControl';
const { ccclass, property } = cc._decorator;

@ccclass
export default class CellAraaControl extends cc.Component {
  @property({ type: cc.Prefab, tooltip: '格子预制体' })
  CellPrefab: cc.Prefab = null;

  @property({ type: cc.Prefab, tooltip: 'TileNode预制体' })
  TilePrefab: cc.Prefab = null;

  @property({ type: cc.Prefab, tooltip: 'TipsNode预制体' })
  TipsPrefab: cc.Prefab = null;

  @property({ type: cc.Prefab, tooltip: 'AwardNode预制体' })
  AwardPrefab: cc.Prefab = null;

  @property({ type: cc.Node, tooltip: '生产点节点' })
  GeneratingPoint: cc.Node = null;

  /** 所有格子 */
  CellNodes: cc.Node[][] = [];
  /** 所有可用的(解锁了、未被占据的)格子 */
  get UsableCellNodes() {
    return flat<cc.Node>(this.CellNodes).filter(CellNode => {
      const Cell = CellNode.getComponent(CellControl);
      return !Cell.isLock && !Cell.isFillIn && !Cell.isAward;
    });
  }
  /** 最后一个可用的格子 */
  get LastUsableCellNode() {
    return flat<cc.Node>(this.CellNodes).find(CellNode => {
      const Cell = CellNode.getComponent(CellControl);
      return !Cell.isLock && !Cell.isFillIn && !Cell.isAward;
    });
  }

  /** 所有锁定的格子 */
  get LockCellNodes() {
    return flat<cc.Node>(this.CellNodes).filter(CellNode => {
      return CellNode.getComponent(CellControl).isLock;
    });
  }

  /** 所有TileNode */
  TileNodes: cc.Node[][] = [];
  /** 当前选中的TileNode */
  CurrentTileNode: cc.Node = null;

  LevelInfo: Level = null;
  TouchStartPos: cc.Vec2 = null;
  TouchEndPos: cc.Vec2 = null;

  onLoad() {
    this.GenerateCellArea(1);
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  onTouchStart(event: cc.Event.EventTouch) {
    const TileNode = flat<cc.Node>(this.TileNodes).find(TileNode => {
      return this.TouchTileNodeArea(event, TileNode);
    });
    if (TileNode) {
      const Tile = TileNode.getComponent(TileControl);
      if (Tile.inAction) return;
      this.TouchStartPos = event.getLocation();
      this.CurrentTileNode = TileNode;
      Tile.Select();
      this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
      this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
      this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (!this.CurrentTileNode) return;
    const Tile = this.CurrentTileNode.getComponent(TileControl);
    if (Tile.inAction) return;
    this.CurrentTileNode.zIndex = 100;
    this.CurrentTileNode.setPosition(this.node.convertToNodeSpaceAR(event.getLocation()));
  }

  async onTouchEnd(event: cc.Event.EventTouch) {
    if (!this.CurrentTileNode) return;
    this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    if (this.TouchStartPos.equals((this.TouchEndPos = event.getLocation()))) return this.ResetCurrent(false);
    // 获取接触到并且距离最近的一个格子
    const CellNodes = flat<cc.Node>(this.CellNodes).filter(CellNode => {
      return this.BoxTileNodeArea(this.CurrentTileNode, CellNode);
    });

    const DistanceMap: Map<number, cc.Node> = new Map([]);
    const Distances: number[] = [];
    CellNodes.forEach(CellNode => {
      const Distance = CellNode.position.sub(this.CurrentTileNode.position).mag();
      if (Distance < CellNode.width * 0.7) {
        DistanceMap.set(Distance, CellNode);
        Distances.push(Distance);
      }
    });
    const CellNode = DistanceMap.get(Math.min(...Distances));
    if (!CellNode) return this.ResetCurrent(true);
    const Cell = CellNode.getComponent(CellControl);
    /** 目标格子是否有TileNode占领了 */
    const hasTileNode = this.TileNodes[Cell.row] && this.TileNodes[Cell.row][Cell.col];
    if (hasTileNode) {
      // 有TileNode的话就进行匹配
      if (this.CurrentTileNode === this.TileNodes[Cell.row][Cell.col]) return this.ResetCurrent(true);
      this.InspectMatchCurrent(this.TileNodes[Cell.row][Cell.col]);
    } else {
      // 不然看是不是奖励格子
      this.InspectMatchAward(CellNode);
    }
  }

  /** 重置当前选中的TileNode的状态 */
  async ResetCurrent(isBack: boolean) {
    if (!this.CurrentTileNode) return;
    const CurrentTileNode = this.CurrentTileNode;
    const CurrentTile = CurrentTileNode.getComponent(TileControl);
    CurrentTile.UnSelect();
    if (isBack) await CurrentTile.Back();
    CurrentTileNode.zIndex = 0;

    // 有可能在重置为null之前，又开始了下一次触摸，那这时的CurrentTileNode值就不能去修改成null了
    if (this.CurrentTileNode === CurrentTileNode) {
      this.CurrentTileNode = null;
    }
  }

  /** 检查是否匹配并合成 */
  async InspectMatchCurrent(TileNode: cc.Node) {
    if (!this.CurrentTileNode) return;
    const Tile = TileNode.getComponent(TileControl);
    const CurrentTileNode = this.CurrentTileNode;
    const CurrentTile = CurrentTileNode.getComponent(TileControl);
    // 检查类型相同，等级相同且没满级
    if (Tile.type === CurrentTile.type && Tile.level === CurrentTile.level && Tile.level !== Tile.maxLevel) {
      const CompositeTileNode = cc.instantiate(this.TilePrefab);
      const CompositeTile = CompositeTileNode.getComponent(TileControl);
      const Cell = this.CellNodes[CurrentTile.row][CurrentTile.col].getComponent(CellControl);
      Cell.isFillIn = false;
      // 合成，移除两个匹配的两个节点，并生成高一个等级的新节点
      this.TileNodes[CurrentTile.row][CurrentTile.col] = null;
      this.TileNodes[Tile.row][Tile.col] = CompositeTileNode;
      await CompositeTile.Init(Tile.type, Tile.row, Tile.col, this.node, Tile.level + 1);
      CurrentTileNode.destroy();
      TileNode.destroy();
      CompositeTile.Compound();
      // 弹出Tips
      const TipsNode = cc.instantiate(this.TipsPrefab);
      const Tips = TipsNode.getComponent(TipsControl);
      TipsNode.setParent(this.node);
      Tips.Init(CompositeTileNode.getPosition());
    } else {
      this.ResetCurrent(true);
    }
  }

  /** 检查是否匹配奖励格子 */
  async InspectMatchAward(CellNode: cc.Node) {
    const Cell = CellNode.getComponent(CellControl);
    const CurrentTile = this.CurrentTileNode.getComponent(TileControl);
    if (!Cell.isAward) return this.ResetCurrent(true);
    if (Cell.awardMatch === CurrentTile.type) {
      const AwardNode = cc.instantiate(this.AwardPrefab);
      const Award = AwardNode.getComponent(AwardControl);
      this.TileNodes[CurrentTile.row][CurrentTile.col] = null;
      this.CellNodes[CurrentTile.row][CurrentTile.col].getComponent(CellControl).isFillIn = false;
      Cell.RemoveAward();
      this.CurrentTileNode.destroy();
      await Award.Init(CurrentTile.type, Cell.row, Cell.col, this.node);
      Award.Play();
      [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1]
      ].forEach(([row, col]) => {
        const UnLockCellNode = this.CellNodes[Cell.row + row][Cell.col + col];
        const UnLockCell = UnLockCellNode.getComponent(CellControl);
        UnLockCell.RemoveLock();
      });
    } else {
      this.ResetCurrent(true);
    }
  }

  /** 初始化游戏区域 */
  GenerateCellArea(level: number) {
    this.LevelInfo = Level[`Level${level}`];
    this.LevelInfo.CellArea.forEach((rowCells, row) => {
      rowCells.forEach((type, col) => {
        const CellNode = cc.instantiate(this.CellPrefab);
        const Cell = CellNode.getComponent(CellControl);
        Cell.Init(type, row, col, this.node);
        if (this.CellNodes[row] === undefined) this.CellNodes[row] = [];
        this.CellNodes[row][col] = CellNode;
      });
    });
    this.InitGeneratingPoint(this.LevelInfo.GeneratingPointRow, this.LevelInfo.GeneratingPointCol);
  }

  /** 初始化生产点节点 */
  InitGeneratingPoint(row: number, col: number) {
    this.GeneratingPoint.on(cc.Node.EventType.TOUCH_START, this.GenerateTile, this);
    this.GeneratingPoint.setParent(this.node);
    this.GeneratingPoint.setPosition(this.GetTilePos(row, col));
    this.GeneratingPoint.zIndex = 99;
    this.GeneratingPoint.active = true;
    this.CellNodes[row][col].getComponent(CellControl).isFillIn = true;
  }

  /** 生成TileNode */
  async GenerateTile(event: cc.Event.EventTouch) {
    cc.tween(this.GeneratingPoint)
      .parallel(
        cc.tween().to(0.1, { scale: 0.8 }).to(0.1, { scale: 1 }),
        cc.tween().call(async () => {
          if (!this.UsableCellNodes.length) return;
          const SequenceInit = this.LevelInfo.SequenceInit;
          const type = SequenceInit.length ? SequenceInit.shift() : Math.floor(Math.random() * 5 + 1);
          const TileNode = cc.instantiate(this.TilePrefab);
          const Tile = TileNode.getComponent(TileControl);
          const LastCell = this.LastUsableCellNode.getComponent(CellControl);
          await Tile.Init(type, LastCell.row, LastCell.col, this.node);
          Tile.MoveTo(this.GeneratingPoint.getPosition());
          LastCell.isFillIn = true;
          if (!this.TileNodes[LastCell.row]) this.TileNodes[LastCell.row] = [];
          this.TileNodes[LastCell.row][LastCell.col] = TileNode;
        })
      )
      .start();
  }

  /** 判断触摸位置是否在某个TileNode节点区域内 */
  TouchTileNodeArea(event: cc.Event.EventTouch, node: cc.Node) {
    if (node === null) return;
    // 获取触摸点在世界坐标系中的位置
    const touchPos = event.getLocation();
    // 获取节点在世界坐标系中的包围盒
    const boundingBox = node.getBoundingBoxToWorld();
    // 判断触摸点是否在节点的区域内
    if (boundingBox.contains(touchPos)) return true;
  }

  /** 判断两个TileNode是否重合 */
  BoxTileNodeArea(self: cc.Node, other: cc.Node) {
    if (self === null || other === null) return;
    const selfBoundingBox = self.getBoundingBoxToWorld();
    const otherBoundingBox = other.getBoundingBoxToWorld();
    return cc.Intersection.rectRect(selfBoundingBox, otherBoundingBox);
  }

  /** 获取指定行、列的TileNode的位置 */
  GetTilePos(row, col): cc.Vec2 {
    const BeginX = this.node.x - this.node.width / 2 + TileWidth / 2;
    const BeginY = this.node.y + this.node.height / 2 - TileHeight / 2;
    const targetX = BeginX + col * TileWidth;
    const targetY = BeginY - row * TileHeight;
    return cc.v2(targetX, targetY);
  }
}
