import BoardControl from '../../logic/boardControl';

interface MaxRemoveInfo {
  /** 消除的行数+列数 */
  count: number;
  /** 起始行 */
  startRow: number;
  /** 起始列 */
  startCol: number;
  /** 消除了哪些行 */
  rows: number[];
  /** 消除了哪些列 */
  cols: number[];
  /** 块数据 */
  chunkData: gi.ChunkData;
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class Board {
  static _board: BoardControl = null;

  /** 初始化 */
  static init(board: BoardControl) {
    this._board = board;
  }

  /** 获取Board中指定行、列格子的位置。坐标系为Board，起始点为左上角 */
  static getRanksPos({ row, col }: gi.Ranks): cc.Vec2 {
    const beginX = -gi.MAPWIDTH / 2 + gi.BLOCKWIDTH / 2;
    const beginY = gi.MAPHEIGHT / 2 - gi.BLOCKHEIGHT / 2;
    const targetX = beginX + col * gi.BLOCKWIDTH;
    const targetY = beginY - row * gi.BLOCKHEIGHT;
    return cc.v2(targetX, targetY);
  }

  /** 获取所有能够放入的块 */
  static getCanPlaceChunks(dataList: gi.ChunkData[], map: number[][]) {
    if (!dataList.length) return [];
    const _list = dataList.slice();
    const _map = map;

    return _list.filter(chunkData => {
      return Array.from(this._board.emptyCells).some(cell => {
        return gi.Map.canPlace(_map, chunkData, cell.row, cell.col);
      });
    });
  }

  /** 获取所有能够产生消除的块 */
  static getCanRemoveChunks(dataList: gi.ChunkData[], map: number[][]) {
    if (!dataList.length) return [];
    const _list = dataList.slice();
    const _map = map;

    return _list.filter(chunkData => {
      return Array.from(this._board.emptyCells).some(cell => {
        return gi.Map.canPlaceAndRemove(_map, chunkData, cell.row, cell.col);
      });
    });
  }

  /** 获取所有最大面积的块 */
  static getMaxAreaChunks(dataList: gi.ChunkData[]) {
    if (!dataList.length) return [];
    // 面积从大到小排列
    const _list = dataList.slice().sort((a, b) => b.area - a.area);

    // 过滤出所有面积最大且相等的块
    const result = _list.filter(chunkData => chunkData.area === _list[0].area);

    return result;
  }

  /** 获取所有最大消除行列数的块 */
  static getMaxRemoveChunks(dataList: gi.ChunkData[], map: number[][]) {
    if (!dataList.length) return [];
    const _map = JSON.parse(JSON.stringify(map)) as number[][];
    const _list = dataList.slice();

    const maxRemoveInfos = _list.map(chunkData => {
      return this.getMaxRemoveInfo(chunkData, _map);
    });

    return maxRemoveInfos
      .sort((a, b) => b.count - a.count)
      .filter(item => item.count === maxRemoveInfos[0].count)
      .map(item => item.chunkData);
  }

  /** 获取块的最大消除行列数信息 */
  static getMaxRemoveInfo(chunkData: gi.ChunkData, map: number[][]): MaxRemoveInfo {
    const _map = map;
    const result = { count: 0, startRow: -1, startCol: -1, rows: [] as number[], cols: [] as number[], chunkData };

    for (const cell of Array.from(this._board.emptyCells)) {
      if (gi.Map.canPlaceAndRemove(_map, chunkData, cell.row, cell.col)) {
        const afterPlaceMap = gi.Map.place(_map, chunkData, cell.row, cell.col);
        const removeInfo = gi.Map.remove(afterPlaceMap);

        if (result.count < removeInfo.count) {
          result.count = removeInfo.count;
          result.rows = removeInfo.rows;
          result.cols = removeInfo.cols;
          result.startRow = cell.row;
          result.startCol = cell.col;
        }
        if (result.count >= 3) {
          result.count = 3;
          break;
        }
      }
    }
    return result;
  }
}
