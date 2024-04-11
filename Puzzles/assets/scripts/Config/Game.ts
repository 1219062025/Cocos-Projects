/** Tile的宽度 */
export const TileWidth = 116;
/** Tile的高度 */
export const TileHeight = 116;
/** 初始化有多少行 */
export const InitiaRowCount = 16;
/** 初始化有多少列 */
export const InitiaColCount = 8;
/** 初始化有多少个Tile */
export const InitiaTileCount = InitiaRowCount * InitiaColCount;
/** 游戏区域节点宽度 */
export const GameAreaWidth = InitiaColCount * TileWidth;
/** 游戏区域节点高度 */
export const GameAreaHeight = InitiaRowCount * TileHeight;
/** Tile类型Sprite映射 */
export const TileType = new Map([
  [1, { label: 'BaseTile', value: 'tile_1' }],
  [2, { label: 'BaseTile', value: 'tile_2' }],
  [3, { label: 'BaseTile', value: 'tile_3' }]
]);

/** 存储交换节点类 */
export class SwapSite {
  /** 触摸的TileNode */
  apply: cc.Node = null;
  /** 要交换的目标TileNode */
  target: cc.Node = null;
  /** 从apply指向target的单位向量 */
  tagetVector: cc.Vec2 = null;

  clear() {
    this.apply = null;
    this.target = null;
  }
}

/** 存储触摸相关信息类 */
export class TouchPos {
  begin: cc.Vec2 = null;
  move: cc.Vec2 = null;

  /** 触摸开始，保存触摸开始的位置 */
  BeginTouch(pos: cc.Vec2) {
    this.begin = pos;
  }

  /** 检查触摸移动中的点与触摸开始的点是否满足交换条件，是的话返回从apply指向target的单位向量，否则为undefined */
  TouchMove(pos: cc.Vec2) {
    this.move = pos;
    const directionVD = this.move.sub(this.begin);
    if (directionVD.len() < 30) return;
    if (Math.abs(directionVD.x) > Math.abs(directionVD.y)) {
      return directionVD.x > 0 ? cc.v2(1, 0) : cc.v2(-1, 0);
    } else if (Math.abs(directionVD.x) < Math.abs(directionVD.y)) {
      return directionVD.y > 0 ? cc.v2(0, 1) : cc.v2(0, -1);
    }
    return;
  }

  clear() {
    this.begin = null;
    this.move = null;
  }
}
