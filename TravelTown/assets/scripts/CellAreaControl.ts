import EventManager from './Common/EventManager';
import CellControl from './CellControl';
import Level from './Config/Level';
const { ccclass, property } = cc._decorator;

@ccclass
export default class CellAraaControl extends cc.Component {
  @property({ type: cc.Prefab, tooltip: '格子预制体' })
  CellPrefab: cc.Prefab = null;

  /** 所有格子 */
  CellNodes: cc.Node[] = [];
  /** 所有解锁了的格子 */
  get UnLockCellNodes() {
    return this.CellNodes.filter(CellNode => {
      return !CellNode.getComponent(CellControl).isLock;
    });
  }
  /** 所有未解锁的格子 */
  get LockCellNodes() {
    return this.CellNodes.filter(CellNode => {
      return CellNode.getComponent(CellControl).isLock;
    });
  }

  /** 所有TileNode */
  TileNodes: cc.Node[] = [];

  onLoad() {
    this.InitCellArea(1);
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  onTouchStart(event: cc.Event.EventTouch) {}

  /** 初始化游戏区域 */
  InitCellArea(level: number) {
    const LevelInfo = Level[`Level${level}`];
    LevelInfo.CellArea.forEach(CellType => {
      const CellNode = cc.instantiate(this.CellPrefab);
      const Cell = CellNode.getComponent(CellControl);
      Cell.Init(CellType);
      this.CellNodes.push(CellNode);
      CellNode.setParent(this.node);
    });
    this.InitGeneratingPoint(LevelInfo.GeneratingPoint);
  }

  InitGeneratingPoint(cellIndex: number) {
    this.node.children[cellIndex];
  }
}
