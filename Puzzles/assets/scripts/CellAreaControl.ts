const { ccclass, property } = cc._decorator;
import { GameAreaWidth, GameAreaHeight, TileWidth, TileHeight, InitiaRowCount, InitiaColCount } from './Config/Game';
import TileControl from './TileControl';
import Level from './Config/Level';
import { flat } from './Common/Utils';

@ccclass
export default class CellAreaControl extends cc.Component {
  @property(cc.Prefab)
  TilePrefab: cc.Prefab = null;

  /** 所有TileNode */
  TileNodes: cc.Node[][] = [];
  /** 所有TileNode根据id的映射*/
  TileNodeMap: Map<number, cc.Node> = new Map([]);

  Init() {
    this.GenerateTile(Level.Level1);
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  onTouchStart(event: cc.Event.EventTouch) {
    // 查找触摸位置处有没有节点，有的话拿到它进行后续操作
    const TileNode = flat<cc.Node>(this.TileNodes).find(TileNode => {
      return this.TouchTileNodeArea(event, TileNode);
    });
    if (TileNode) {
      // this.ApplyJoin(PointNode);
    }
    event.stopPropagation();
  }

  /** 根据传入的二维number类型数组生成Tile */
  GenerateTile(Map: number[][]) {
    if (Map.length > InitiaRowCount) return '超出行数，不予生成';
    Map.forEach((rowTiles, row) => {
      rowTiles.forEach((type, col) => {
        if (col + 1 > InitiaColCount) return '超出列数，不予生成';
        // type为0意味着这个位置不应该生成Tile
        if (type === 0) return;
        const TileNode = cc.instantiate(this.TilePrefab);
        const Tile = TileNode.getComponent(TileControl);
        Tile.Init(type, row, col, this.GetTilePos(row, col), this.node);
        if (this.TileNodes[row] === undefined) this.TileNodes[row] = [];
        this.TileNodes[row][col] = TileNode;
        this.TileNodeMap.set(Tile.id, TileNode);
      });
    });
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

  /** 获取指定行、列的TileNode的位置 */
  GetTilePos(row, col): cc.Vec2 {
    const BeginX = this.node.x - this.node.width / 2 + TileWidth / 2;
    const BeginY = this.node.y + this.node.height / 2 - TileHeight / 2;
    const targetX = BeginX + col * TileWidth;
    const targetY = BeginY - row * TileHeight;
    return cc.v2(targetX, targetY);
  }
}
