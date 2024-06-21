const { ccclass, property } = cc._decorator;

interface RemoveInfo {
  /** 消除后的映射 */
  map: number[][];
  /** 消除了哪些行 */
  rows: number[];
  /** 消除了哪些列 */
  cols: number[];
  /** 消除的行数+列数 */
  count: number;
}

@ccclass
export default class Map {
  /** 是否可以放置块 */
  static canPlace(map: number[][], chunkData: gi.ChunkData, startRow: number, startCol: number) {
    if (!chunkData) throw new Error('canPlaceChunk：data is empty');
    const _map = map;
    for (const blockInfo of chunkData.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;
      if (!gi.Utils.inRange(targetRow, 0, gi.MAPROWS - 1) || !gi.Utils.inRange(targetCol, 0, gi.MAPCOLS - 1)) {
        return false;
      }

      if (_map[targetRow][targetCol]) {
        return false;
      }
    }
    return true;
  }

  /** 是否能产生消除 */
  static canRemove(map: number[][]) {
    const _map = map;
    for (let row = 0; row < gi.MAPROWS; row++) {
      if (this.isRowAllTarget(_map, row, 1)) return true;
    }
    for (let col = 0; col < gi.MAPCOLS; col++) {
      if (this.isColumnAllTarget(_map, col, 1)) return true;
    }

    return false;
  }

  /** 放置chunk并返回映射 */
  static place(map: number[][], chunkData: gi.ChunkData, startRow: number, startCol: number) {
    const _map = JSON.parse(JSON.stringify(map)) as number[][];

    for (const blockInfo of chunkData.blocks) {
      const targetRow = startRow + blockInfo.difRows;
      const targetCol = startCol + blockInfo.difCols;
      _map[targetRow][targetCol] = 1;
    }

    return _map;
  }

  /** 消除方块并返回信息 */
  static remove(map: number[][]) {
    const _map = JSON.parse(JSON.stringify(map)) as number[][];
    const rows: number[] = [];
    const cols: number[] = [];

    for (let row = 0; row < gi.MAPROWS; row++) {
      if (this.isRowAllTarget(_map, row, 1)) {
        this.setRowAllValue(_map, row, 0);
        rows.push(row);
      }
    }

    for (let col = 0; col < gi.MAPCOLS; col++) {
      if (this.isColumnAllTarget(_map, col, 1)) {
        this.setColumnAllValue(_map, col, 0);
        cols.push(col);
      }
    }

    const count = rows.length + cols.length;
    return { map: _map, rows, cols, count } as RemoveInfo;
  }

  /** 块是否可以放入并且产生消除 */
  static canPlaceAndRemove(map: number[][], chunkData: gi.ChunkData, startRow: number, startCol: number) {
    const _map = map;

    const canPlace = this.canPlace(_map, chunkData, startRow, startCol);
    if (!canPlace) return false;

    const afterPlaceMap = this.place(_map, chunkData, startRow, startCol);

    const canRemove = this.canRemove(afterPlaceMap);
    if (!canRemove) return false;
  }

  /** 获取假设chunk放下并产生消除后的信息 */
  static placeAndRemove(map: number[][], chunkData: gi.ChunkData, startRow: number, startCol: number) {
    let _map = map;

    const afterPlaceMap = this.place(_map, chunkData, startRow, startCol);
    const afterRemoveInfo = this.remove(afterPlaceMap);

    return afterRemoveInfo;
  }

  /** 创建映射 */
  static createMap<T>(rows: number, cols: number, value: T) {
    const _map: T[][] = [];
    for (let i = 0; i < rows; i++) {
      _map.push(new Array(cols).fill(value));
    }
    return _map;
  }

  /** 某行是否全是target值 */
  static isRowAllTarget<T>(map: T[][], row: number, target: T) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] !== target) {
        return false;
      }
    }
    return true;
  }

  /** 某列是否全是target值 */
  static isColumnAllTarget<T>(map: T[][], col: number, target: T) {
    for (let row = 0; row < map.length; row++) {
      if (map[row][col] !== target) {
        return false;
      }
    }
    return true;
  }

  /** 设置某行为target值 */
  static setRowAllValue<T>(map: T[][], row: number, target: T) {
    for (let col = 0; col < map[row].length; col++) {
      map[row][col] = target;
    }
  }

  /** 设置某列为target值 */
  static setColumnAllValue<T>(map: T[][], col: number, target: T) {
    for (let row = 0; row < map.length; row++) {
      map[row][col] = target;
    }
  }

  /** 设置映射中所有值 */
  static setAllValue<T>(map: T[][], target: T) {
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        map[row][col] = target;
      }
    }
  }

  /** 对某行执行操作 */
  static handleRowAll<T>(map: T[][], row: number, func: (item: T) => void) {
    for (let col = 0; col < map[row].length; col++) {
      func.call(this, map[row][col]);
    }
  }

  /** 对某列执行操作 */
  static handleColumnAll<T>(map: T[][], col: number, func: (item: T) => void) {
    for (let row = 0; row < map.length; row++) {
      func.call(this, map[row][col]);
    }
  }
}
