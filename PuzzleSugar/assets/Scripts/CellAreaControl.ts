import { TileWidth, TileHeight, CellWidth, CellHeight, InitiaRowCount, InitiaColCount, InitiaTileCount, Tile, TileType, GameAreaWidth, GameAreaHeight } from './Config/Game';
import Level from './Config/Level';
import { flat } from './CommonScripts/Utils';
import TileControl from './TileControl';
import CellControl from './CellControl';
import NodesControl from './NodesControl';
import EventManager from './CommonScripts/EventManager';
import EffectCtrl from './CommonScripts/EffectCtrl';
import EffectCtrlProgressBarTop from './CommonScripts/EffectCtrlProgressBarTop';
import { DotsEnum } from './CommonScripts/DotsEnum';
import FingerControl from './CommonScripts/FingerControl';
const { ccclass, property } = cc._decorator;

@ccclass
export default class CellAreaControl extends cc.Component {
  @property({ type: cc.Prefab, tooltip: 'TileNode预制体' })
  TilePrefab: cc.Prefab = null;

  @property({ type: cc.Prefab, tooltip: 'CellNode预制体' })
  CellPrefab: cc.Prefab = null;

  @property({ type: EffectCtrl, tooltip: '控制完成弹窗、金钱增加的脚本' })
  EffectCtrlPlayable: EffectCtrl = null;

  @property({ type: EffectCtrlProgressBarTop, tooltip: '控制完成弹窗、进度条增加的脚本' })
  EffectCtrlProgress: EffectCtrlProgressBarTop = null;

  @property({ tooltip: '该场景是进度条模式吗?' })
  isProgress: boolean = false;

  @property({ type: FingerControl, tooltip: '手指' })
  Finger: FingerControl = null;

  /** 控制脚本，根据isProgress进行赋值 */
  EffectCtrl: EffectCtrl | EffectCtrlProgressBarTop = null;
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
  /** 是否处于某个操作中，如果是的话不能进行其他操作 */
  inAction: boolean = false;

  /** 控制TileNode、CellNode行为的类 */
  NodesControl: NodesControl = null;

  onLoad() {
    this.onEffectCtrl();
    this.CreatePool(this.TilePrefab, this.TileNodePool, 25);
    this.GenerateCells(Level.Level1);
    this.node.parent.setContentSize(this.node.width + 20, this.node.height + 20);
    this.GenerateTiles(Level.Level1);
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.NodesControl = new NodesControl(this);
    this.RunFinger();
  }

  onTouchStart(event: cc.Event.EventTouch) {
    if (this.inAction) return;
    const TileNode = flat<cc.Node>(this.TileNodes).find(TileNode => {
      return this.TouchTileNodeArea(event, TileNode);
    });

    if (TileNode) {
      this.inAction = true;
      this.NodesControl.MarkersWithEliminate(TileNode);
    }
  }

  /** 手指划动动画 */
  RunFinger() {
    this.Finger.Init(this.GetTilePos(0, 2));
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

  /** 处理 EffectCtrl 相关*/
  onEffectCtrl() {
    this.EffectCtrl = this.isProgress ? this.EffectCtrlProgress : this.EffectCtrlPlayable;
    /** 完成消除的次数 */
    let EliminatedCount = 0;
    EventManager.on('Eliminated', () => {
      EventManager.emit(DotsEnum.DestoryDotsEvent);
      this.EffectCtrl.addMoneyCount();
      if (EliminatedCount++ >= 4) {
        this.EffectCtrl.showEndCard();
      }
    });
  }

  /** 获取指定行、列的TileNode的位置 */
  GetTilePos(row, col): cc.Vec2 {
    const BeginX = this.node.x - this.node.width / 2 + CellWidth / 2;
    const BeginY = this.node.y + this.node.height / 2 - CellHeight / 2;
    const targetX = BeginX + col * CellWidth;
    const targetY = BeginY - row * CellHeight;
    return cc.v2(targetX, targetY);
  }
}
