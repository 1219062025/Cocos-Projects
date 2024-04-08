import DragableBlocControl from './DragableBlockControl';
import FixedCellControl from './FixedCellControl';
import { centerChildren, getNodeWorldPosition, getNodeParentPosition } from './Utils';
const { ccclass, property } = cc._decorator;

@ccclass
export default class FixedCellAreaControl extends cc.Component {
  /** 格子节点集合 */
  fixedCellNodeList: cc.Node[] = [];

  /** 当前成功碰撞的格子的id集合 */
  colliderCellIdList: Set<number> = null;

  /** 格子个数 */
  count = 0;
  onLoad() {
    this.fixedCellNodeList = this.node.getChildByName('wrap').children;
  }

  /** 放置方块 */
  PlaceBlock(cellIdList: Set<number>, colliderBlockList: cc.Node[]) {
    this.colliderCellIdList = cellIdList;
    console.log(
      this.fixedCellNodeList.map((cellNode: cc.Node) => {
        const cell = cellNode.getComponent(FixedCellControl);
        return `id为${cell.id}的格子${cell.isFill ? '不可放置' : '可放置'}`;
      })
    );

    /** 想放的位置是否有格子已经放了方块了 */
    const isBeOccupied = this.fixedCellNodeList.some((cellNode: cc.Node) => {
      const cell = cellNode.getComponent(FixedCellControl);
      if (this.colliderCellIdList.has(cell.id)) {
        if (cell.isFill) return true;
      }
    });
    if (isBeOccupied === true) return false;

    // 位置都还空着，可以放置
    let index = 0;
    this.fixedCellNodeList.forEach((cellNode: cc.Node) => {
      const cell = cellNode.getComponent(FixedCellControl);
      // 找到了要放置方块的格子了
      if (this.colliderCellIdList.has(cell.id)) {
        const block = colliderBlockList[index++];
        block.setPosition(getNodeParentPosition(block, getNodeWorldPosition(cellNode)));
        cell.isFill = true;
      }
    });
    this.CheckAllFill();
    return true;
  }

  /** 检查是否所有格子都已经被填满了 */
  CheckAllFill() {
    const undoneAllFill = this.fixedCellNodeList.some((cellNode: cc.Node) => {
      const cell = cellNode.getComponent(FixedCellControl);
      return !cell.isFill;
    });
    if (undoneAllFill === false) this.RemoveBlock();
  }

  /** 所有格子都被填满后移除方块 */
  RemoveBlock() {
    console.log('完成');
  }

  /** 拿起方块 */
  PickUpBlock(cellIdList: Set<number>) {
    this.colliderCellIdList = cellIdList;
    this.fixedCellNodeList.forEach((cellNode: cc.Node, index: number) => {
      const cell = cellNode.getComponent(FixedCellControl);
      if (this.colliderCellIdList.has(cell.id)) {
        cell.isFill = false;
      }
    });
    this.RemoveGhost();
  }

  /** 生成虚影 */
  GenerateGhost(colliderCellIdList: Set<number>) {
    this.colliderCellIdList = colliderCellIdList;
    this.fixedCellNodeList.forEach((cellNode: cc.Node, index: number) => {
      const cellId = cellNode.getComponent(FixedCellControl).id;
      if (this.colliderCellIdList.has(cellId)) {
        cc.loader.loadRes(`hexagon_1`, cc.SpriteFrame, (err, res) => {
          const HexagonGhost = cellNode.getChildByName('hexagon_ghost');
          HexagonGhost.getComponent(cc.Sprite).spriteFrame = res;
          HexagonGhost.active = true;
        });
      }
    });
  }

  /** 移除虚影 */
  RemoveGhost() {
    if (this.colliderCellIdList === null) return;
    this.fixedCellNodeList.forEach((cellNode: cc.Node, index: number) => {
      const HexagonGhost = cellNode.getChildByName('hexagon_ghost');
      HexagonGhost.active = false;
    });
  }
}
