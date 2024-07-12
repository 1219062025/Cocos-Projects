import TileControl from './tileControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TableControl extends cc.Component {
  @property({ type: cc.Prefab, tooltip: 'Tile预制体' })
  tilePrefab: cc.Prefab = null;

  /** 层数 */
  tiers: number;
  /** 行数 */
  rows: number;
  /** 列数 */
  cols: number;

  /** table的三维数组映射，0代表空位，1代表存在tile。数组第一个元素是第1层的映射，依此类推 */
  map: number[][][] = [];

  /** table中的所有tile，以三维数组形式表示 */
  tiles: TileControl[][][] = [];
  /** table中的所有tile，以一维Set形式表示 */
  flatTiles: Set<TileControl> = new Set([]);

  /** 根据场上tile的id映射 */
  tileMap: Map<number, Set<TileControl>> = new Map([]);

  init() {
    const levelInfo = cc.loader.getRes('json/levelConfig', cc.JsonAsset).json[gi.getLevel()] as gi.LevelInfo;

    this.node.setContentSize(gi.GAME_WIDTH, gi.GAME_HEIGHT);

    this.tiers = levelInfo.tiers;
    this.rows = levelInfo.map.length;
    this.cols = levelInfo.map[0].length;

    gi.tileScale = this.getAutoScale(levelInfo);

    for (let i = 0; i < this.tiers; i++) {
      this.map[i] = this.createMap(this.rows, this.cols, 0);
      this.tiles[i] = this.createMap(this.rows, this.cols, null);
    }

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const str = levelInfo.map[row][col];
        if (typeof str === 'string') {
          const tierMap = str.split('_');
          for (let tier = 0; tier < tierMap.length; tier++) {
            const id = Number(tierMap[tier]);
            if (id) {
              const tile = this.tileBuilder(id).ctrl;
              tile.setRanks(row, col);
              tile.setTier(tier);
              tile.node.setParent(this.node);
              tile.node.setPosition(this.getRanksPos(tier, row, col));
              this.updateMap(gi.Action.ADD, tier, row, col, tile);
            }
          }
        }
      }
    }

    this.sortAndSetNodeHierarchy();

    gi.Utils.centerChildren(this.node);

    this.createLabel();
  }

  removeTile(tile: TileControl) {
    this.updateMap(gi.Action.REMOVE, tile.tier, tile.row, tile.col);
  }

  async pair(tile1: TileControl, tile2: TileControl) {
    let left: TileControl, right: TileControl;

    // 基于世界坐标系，根据两向量叉乘断两个Tile谁在左谁在右
    const tile1WorldPos = tile1.node.convertToWorldSpaceAR(cc.v2(0, 0));
    const tile2WorldPos = tile2.node.convertToWorldSpaceAR(cc.v2(0, 0));
    const c = tile1WorldPos.cross(tile2WorldPos);
    if (c > 0) {
      /** 左边 */
      left = tile2;
      right = tile1;
    } else if (c < 0) {
      /** 右边 */
      left = tile1;
      right = tile2;
    } else {
      left = tile1;
      right = tile2;
    }

    left.node.off(cc.Node.EventType.TOUCH_START);
    right.node.off(cc.Node.EventType.TOUCH_START);

    /** 左边Tile的世界坐标 */
    const leftWorldPos = left.node.convertToWorldSpaceAR(cc.v2(0, 0));
    /** 右边Tile的世界坐标 */
    const rightWorldPos = right.node.convertToWorldSpaceAR(cc.v2(0, 0));
    /** 两Tile的世界坐标y轴中位数 */
    const middleWorldX = (leftWorldPos.x + rightWorldPos.x) / 2;
    /** 两Tile的世界坐标x轴中位数 */
    const middleWorldY = (leftWorldPos.y + rightWorldPos.y) / 2;
    /** 两Tile的平面中点位置，table坐标系 */
    const middlePos = this.node.convertToNodeSpaceAR(cc.v2(middleWorldX, middleWorldY));

    const duration1 = 0.3;
    const duration2 = 0.1;
    const duration3 = 0.2;

    const scale = 0.5;

    const leftPos1 = cc.v2(left.node.x - 200, middlePos.y);
    const leftPos2 = cc.v2(middlePos.x - left.node.width / 2 + gi.TILE_SPACE / 2, middlePos.y);
    const leftPos3 = cc.v2(leftPos2.x + left.node.width / 4, middlePos.y);

    const rightPos1 = cc.v2(right.node.x + 200, middlePos.y);
    const rightPos2 = cc.v2(middlePos.x + right.node.width / 2 - gi.TILE_SPACE / 2, middlePos.y);
    const rightPos3 = cc.v2(rightPos2.x - right.node.width / 4, middlePos.y);

    const leftPromise = new Promise(resolve => {
      (cc.tween(left.node) as cc.Tween)
        .call(() => {
          left.node.setSiblingIndex(-1);
        })
        .to(duration1, { position: leftPos1 }, { easing: 'smooth' })
        .to(duration2, { position: leftPos2 }, { easing: 'sineInOut' })
        .call(() => {
          gi.Event.emit('score', cc.v2(middleWorldX, middleWorldY));
        })
        .to(duration3, { position: leftPos3, opacity: 0, scale })
        .call(() => {
          left.node.destroy();
          resolve(true);
        })
        .start();
    });
    const rightPromise = new Promise(resolve => {
      (cc.tween(right.node) as cc.Tween)
        .call(() => {
          right.node.setSiblingIndex(-1);
        })
        .to(duration1, { position: rightPos1 }, { easing: 'smooth' })
        .to(duration2, { position: rightPos2 }, { easing: 'sineInOut' })
        .to(duration3, { position: rightPos3, opacity: 0, scale })
        .call(() => {
          right.node.destroy();
          resolve(true);
        })
        .start();
    });

    this.removeTile(left);
    this.removeTile(right);

    await Promise.all([leftPromise, rightPromise]);
  }

  /** 更新映射 */
  updateMap(action: gi.Action, tier: number, row: number, col: number, tile?: TileControl) {
    const _tile = this.tiles[tier][row][col];
    switch (action) {
      case gi.Action.REMOVE:
        this.map[tier][row][col] = 0;
        this.tiles[tier][row][col] = null;
        this.flatTiles.delete(_tile);
        const removeSet = this.tileMap.get(_tile.id);
        removeSet.delete(_tile);
        if (removeSet.size === 0) this.tileMap.delete(_tile.id);
        break;
      case gi.Action.ADD:
        this.map[tier][row][col] = 1;
        this.tiles[tier][row][col] = tile;
        this.flatTiles.add(tile);
        const set = this.tileMap.get(tile.id) || new Set<TileControl>([]);
        set.add(tile);
        this.tileMap.set(tile.id, set);
        break;

      default:
        break;
    }
  }

  /**
   * 传入的Tile是否可以选中
   * 同层左右两边不能同时有Tile
   * 上层不能有Tile压住
   */
  canSelected(tile: TileControl) {
    const curRow = tile.row;
    const curCol = tile.col;
    const curTier = tile.tier;

    /** 如果左右两边同时存在Tile则不能选中 */
    const leftTile = this.isExistTile(curTier, curRow, curCol - 2) || this.isExistTile(curTier, curRow - 1, curCol - 2) || this.isExistTile(curTier, curRow + 1, curCol - 2);
    const rightTile = this.isExistTile(curTier, curRow, curCol + 2) || this.isExistTile(curTier, curRow - 1, curCol + 2) || this.isExistTile(curTier, curRow + 1, curCol + 2);

    if (leftTile && rightTile) {
      return false;
    }

    if (curTier + 1 <= this.tiers) {
      const aboveTile = [
        { rows: curRow, cols: curCol },
        { rows: curRow + 1, cols: curCol },
        { rows: curRow - 1, cols: curCol },
        { rows: curRow, cols: curCol - 1 },
        { rows: curRow + 1, cols: curCol - 1 },
        { rows: curRow - 1, cols: curCol - 1 },
        { rows: curRow, cols: curCol + 1 },
        { rows: curRow + 1, cols: curCol + 1 },
        { rows: curRow - 1, cols: curCol + 1 }
      ].find(item => {
        const res = this.isExistTile(curTier + 1, item.rows, item.cols);
        return res;
      });

      if (aboveTile) return false;
    }

    return true;
  }

  isExistTile(tier: number, rows: number, cols: number) {
    const res = this.tiles[tier] && this.tiles[tier][rows] && this.tiles[tier][rows][cols];
    return Boolean(res);
  }

  /** 创建映射 */
  createMap<T>(rows: number, cols: number, value: T) {
    const _map: T[][] = [];
    for (let i = 0; i < rows; i++) {
      _map.push(new Array(cols).fill(value));
    }
    return _map;
  }

  /** 获取table中指定行、列的位置。坐标系为table，起始点为左上角 */
  getRanksPos(tier: number, row: number, col: number) {
    const beginX = -gi.GAME_WIDTH / 2 + tier * gi.TIER_OFFSET_X;
    const beginY = gi.GAME_HEIGHT / 2 + tier * gi.TIER_OFFSET_Y;

    const targetX = beginX + col * gi.OFFSET_X;
    const targetY = beginY - row * gi.OFFSET_Y;
    return cc.v2(targetX * gi.tileScale, targetY * gi.tileScale);
  }

  /** 获取自动缩放值，自动缩放到可以把整个牌桌放入table节点 */
  getAutoScale(levelInfo: gi.LevelInfo) {
    const x_number = this.cols;
    const y_number = this.rows;

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

  /** Tile生成器 */
  tileBuilder(id: number) {
    const res = gi.prefabBuilder(this.tilePrefab, TileControl);
    res.ctrl.init(id);
    return res;
  }

  /** 建立标尺刻度 */
  createLabel() {
    for (let row = 0; row < this.rows; row++) {
      const canvas = cc.Canvas.instance.node;
      const labelNode = new cc.Node('Label');
      const label = labelNode.addComponent(cc.Label);
      label.string = String(row);
      labelNode.setParent(canvas);

      const pos = canvas.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.getRanksPos(0, row, 0)));
      labelNode.setPosition(pos.x - gi.OFFSET_X - 40, pos.y - 85);
    }

    for (let col = 0; col < this.cols; col++) {
      const canvas = cc.Canvas.instance.node;
      const labelNode = new cc.Node('Label');
      const label = labelNode.addComponent(cc.Label);
      label.string = String(col);
      labelNode.color = cc.color(255, 200, 200);
      labelNode.setParent(canvas);

      const pos = canvas.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.getRanksPos(0, 0, col)));
      labelNode.setPosition(pos.x - 75, pos.y - 20);
    }
  }

  /**
   * -排序节点
   * 首先按tier排序，tier大的排在后面。
   * 对于tier相同的节点，按col排序。
   * 如果col相同，再按row排序，row大的排在后面。
   * 如果col差值为1，row小的排在前面。
   * 否则按col排序，col大的排在后面。
   */
  sortAndSetNodeHierarchy() {
    let flatArray: { tile: TileControl; tier: number; row: number; col: number }[] = [];

    // 将三维数组扁平化为一维数组
    for (let t = 0; t < this.tiers; t++) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.tiles[t][r][c]) {
            flatArray.push({ tile: this.tiles[t][r][c], tier: t, row: r, col: c });
          }
        }
      }
    }

    // 根据指定的规则排序
    flatArray.sort((a, b) => {
      if (a.tier !== b.tier) {
        return a.tier - b.tier;
      }
      if (a.col === b.col) {
        return a.row - b.row;
      }
      const colDiff = Math.abs(a.col - b.col);
      if (colDiff === 1) {
        return a.row - b.row;
      }
      return a.col - b.col;
    });

    // 按排序后的顺序设置节点的层级
    for (let i = 0; i < flatArray.length; i++) {
      flatArray[i].tile.node.setSiblingIndex(i);
    }
  }
}
