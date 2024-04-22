import { TileWidth, TileHeight, CellWidth, CellHeight, InitiaRowCount, InitiaColCount, InitiaTileCount, Tile, TileType, GameAreaWidth, GameAreaHeight } from './Config/Game';
import Level from './Config/Level';
import { flat } from './CommonScripts/Utils';
import TileControl from './TileControl';
import CellControl from './CellControl';
const { ccclass, property } = cc._decorator;

@ccclass
export default class CellAreaControl extends cc.Component {
  @property({ type: cc.Prefab, tooltip: 'TileNode预制体' })
  TilePrefab: cc.Prefab = null;

  @property({ type: cc.Prefab, tooltip: 'CellNode预制体' })
  CellPrefab: cc.Prefab = null;

  /** 管理TileNode的对象池 */
  TileNodePool: cc.NodePool = new cc.NodePool();
  /** 所有TileNode */
  TileNodes: cc.Node[][] = [];
  /** 所有CellNode */
  CellNodes: cc.Node[][] = [];
  /** 所有TileNode根据id的映射*/
  TileNodeMap: Map<number, cc.Node> = new Map([]);
  /** 存储被遍历过的TileNode的队列 */
  TraversalQueue: cc.Node[] = [];
  /** 遍历的起点TileNode的type */
  TraversalType: number = 0;
  /** 是否处于某个操作中，如果是的话不能进行其他操作 */
  inAction: boolean = false;

  onLoad() {
    this.CreatePool(this.TilePrefab, this.TileNodePool, 25);
    this.GenerateCells(Level.Level1);
    this.node.parent.setContentSize(this.node.width + 20, this.node.height + 20);
    this.GenerateTiles(Level.Level1);
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  onTouchStart(event: cc.Event.EventTouch) {
    const TileNode = flat<cc.Node>(this.TileNodes).find(TileNode => {
      return this.TouchTileNodeArea(event, TileNode);
    });

    if (TileNode) {
      const canEliminate = this.InspectEliminate(TileNode);
      if (canEliminate) this.Eliminate();
    }
  }

  /** 检查所触摸的TileNode是否满足消除条件 */
  InspectEliminate(TileNode: cc.Node) {
    const Tile = TileNode.getComponent(TileControl);
    this.DFSTileNode(TileNode, Tile.type);
    if (this.TraversalQueue.length === 1) this.TraversalQueue.shift();
    return this.TraversalQueue.length !== 0;
  }

  Eliminate() {
    while (this.TraversalQueue.length) {
      const TileNode = this.TraversalQueue.shift();
      const Tile = TileNode.getComponent(TileControl);
      Tile.Remove();
    }
  }

  /** 深度优先遍历从起点开始所有连接在一起的TileNode */
  DFSTileNode(StartTileNode: cc.Node, TraversalType: number) {
    const StartTile = StartTileNode.getComponent(TileControl);
    // 不是目标type的TileNode
    if (StartTile.type !== TraversalType) return;
    // 被遍历过的就不再遍历
    if (StartTile.isTraversal) return;
    const { row, col } = StartTile;
    StartTile.isTraversal = true;
    this.TraversalQueue.push(StartTileNode);
    // 按上、右、下、左的顺序深度优先递归遍历
    if (row > 0) {
      this.DFSTileNode(this.TileNodes[row - 1][col], TraversalType);
    }
    if (col < InitiaColCount - 1) {
      this.DFSTileNode(this.TileNodes[row][col + 1], TraversalType);
    }
    if (row < InitiaRowCount - 1) {
      this.DFSTileNode(this.TileNodes[row + 1][col], TraversalType);
    }
    if (col > 0) {
      this.DFSTileNode(this.TileNodes[row][col - 1], TraversalType);
    }
  }

  /** 创建对象池 */
  CreatePool(prefab: cc.Prefab, pool: cc.NodePool, size: number) {
    if (!prefab || !pool || !size) return;
    for (let i = 0; i < size; ++i) {
      let prefabNode = cc.instantiate(prefab); // 创建节点
      pool.put(prefabNode); // 通过 put 接口放入对象池
    }
  }

  /** 生成格子 */
  GenerateCells(Map: number[][]) {
    this.node.width = GameAreaWidth;
    this.node.height = GameAreaHeight;
    Map.forEach((rowCells, row) => {
      rowCells.forEach((rowCell, col) => {
        const CellNode = cc.instantiate(this.CellPrefab);
        const Cell = CellNode.getComponent(CellControl);
        Cell.Init(row, col, this.node);
        if (this.CellNodes[row] === undefined) this.CellNodes[row] = [];
        this.CellNodes[row][col] = CellNode;
      });
    });
  }

  /** 根据传入的二维number类型数组生成Tile */
  GenerateTiles(Map: number[][]): Promise<void[]> {
    const FallToPromises: Promise<void>[] = [];
    Map.forEach((rowTiles, row) => {
      rowTiles.forEach((type, col) => {
        // type为0意味着这个位置不应该生成Tile
        if (type === 0) return;
        let TileNode: cc.Node = null;
        // 对象池创建TileNode
        if (this.TileNodePool.size() > 0) {
          TileNode = this.TileNodePool.get();
        } else {
          TileNode = cc.instantiate(this.TilePrefab);
        }
        const Tile = TileNode.getComponent(TileControl);
        Tile.AttachPool(this.TileNodePool);
        Tile.Init(type, row, col, this.node);
        FallToPromises.push(Tile.FallTo(row, col, true));
        if (this.TileNodes[row] === undefined) this.TileNodes[row] = [];
        this.TileNodes[row][col] = TileNode;
        this.TileNodeMap.set(Tile.id, TileNode);
      });
    });
    return Promise.all(FallToPromises);
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
}
