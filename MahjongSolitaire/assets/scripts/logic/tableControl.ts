import TileControl from './tileControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Table extends cc.Component {
  @property({ type: cc.Prefab, tooltip: 'Tile预制体' })
  tilePrefab: cc.Prefab = null;

  maxLevel: number;

  /** table的三维数组映射，0代表空位，1代表存在tile。数组第一个元素是第1层的映射，依此类推 */
  map: number[][][] = [];

  /** table中的所有tile，以三维数组形式表示 */
  tiles: TileControl[][][] = [];

  init() {
    const levelInfo = cc.loader.getRes('json/levelConfig', cc.JsonAsset).json[gi.getLevel()] as gi.LevelInfo;

    this.node.setContentSize(gi.GAME_WIDTH, gi.GAME_HEIGHT);

    this.maxLevel = levelInfo.maxLevel;

    gi.tileScale = this.getAutoScale(levelInfo);

    for (let i = 0; i < this.maxLevel; i++) {
      this.map[i] = this.createMap(levelInfo.map.length, levelInfo.map[0].length, 0);
      this.tiles[i] = this.createMap(levelInfo.map.length, levelInfo.map[0].length, null);
    }

    for (let row = 0; row < levelInfo.map.length; row++) {
      for (let col = 0; col < levelInfo.map[row].length; col++) {
        const tierMap = levelInfo.map[row][col];
        if (Array.isArray(tierMap)) {
          for (let tier = 0; tier < tierMap.length; tier++) {
            const id = tierMap[tier];
            if (id) {
              const tile = this.tileBuilder(id).ctrl;
              tile.setRanks(row, col);
              tile.setTier(tier);
              tile.node.setParent(this.node);
              tile.node.setPosition(this.getRanksPos(tier, row, col));
              this.map[tier][row][col] = 1;
              this.tiles[tier][row][col] = tile;
            }
          }
        }
      }
    }

    for (let tier = 0; tier < this.tiles.length; tier++) {
      for (let row = 0; row < this.tiles[tier].length; row++) {
        for (let col = 0; col < this.tiles[tier][row].length; col++) {
          const tile = this.tiles[tier][row][col];
          if (tile) {
            const worldX = tile.node.convertToWorldSpaceAR(cc.v2(0, 0)).x;
            const worldY = tile.node.convertToWorldSpaceAR(cc.v2(0, 0)).y;
            tile.node.setSiblingIndex(tier * 50000 + worldY * 10 + worldX);
          }
        }
      }
    }
  }

  /** 创建映射 */
  createMap<T>(rows: number, cols: number, value: T) {
    const _map: T[][] = [];
    for (let i = 0; i < rows; i++) {
      _map.push(new Array(cols).fill(value));
    }
    return _map;
  }

  tileBuilder(id: number) {
    const res = gi.prefabBuilder(this.tilePrefab, TileControl);
    res.ctrl.init(id);
    return res;
  }

  /** 获取table中指定行、列的位置。坐标系为table，起始点为左上角 */
  getRanksPos(tier: number, row: number, col: number) {
    const beginX = -gi.GAME_WIDTH / 2 + tier * gi.TIER_OFFSET_X + gi.OFFSET_X;
    const beginY = gi.GAME_HEIGHT / 2 + tier * gi.TIER_OFFSET_Y - gi.OFFSET_Y;
    const targetX = beginX + col * gi.OFFSET_X;
    const targetY = beginY - row * gi.OFFSET_Y;
    return cc.v2(targetX * gi.tileScale, targetY * gi.tileScale);
  }

  getAutoScale(levelInfo: gi.LevelInfo) {
    const x_number = levelInfo.map[0].length;
    const y_number = levelInfo.map.length;

    // 计算所有点的总宽高
    const totalWidth = ((x_number - 1) / 2) * gi.TILE_WIDTH;
    const totalHeight = ((y_number - 1) / 2) * gi.TILE_HEIGHT;

    // 初始化缩放系数
    let scaleX = 1;
    let scaleY = 1;

    // 检查是否超过容器宽度
    if (totalWidth > gi.GAME_WIDTH) {
      scaleX = gi.GAME_WIDTH / totalWidth;
    }

    // 检查是否超过容器高度
    if (totalHeight > gi.GAME_HEIGHT) {
      scaleY = gi.GAME_HEIGHT / totalHeight;
    }

    // 取最小的缩放系数，确保节点在容器内
    return Math.min(scaleX, scaleY);
  }
}
