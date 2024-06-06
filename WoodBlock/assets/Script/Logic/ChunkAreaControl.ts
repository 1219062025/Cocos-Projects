import EventManager from '../Common/EventManager';
import { Libray, Logic } from '../Type/Enum';
import BoardControl from './BoardControl';
import CellControl from './CellControl';
import ChunkControl from './ChunkControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChunkAreaControl extends cc.Component {
  @property({ type: [cc.Node], tooltip: '区域' })
  areaList: cc.Node[] = [];

  @property({ type: cc.Prefab, tooltip: '方块集合预制体' })
  chunkPrefab: cc.Prefab = null;

  @property({ type: BoardControl, tooltip: '放置区域的控制脚本' })
  board: BoardControl = null;

  onLoad() {
    this.areaList.forEach(area => {
      area.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
      area.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
      area.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    });
  }

  onTouchStart(event: cc.Event.EventTouch) {
    const area = event.currentTarget as cc.Node;
    const chunkNode = area.getChildByName('Chunk');
    area.setSiblingIndex(10);
    if (chunkNode) {
      const TouchPos = event.getLocation();
      const TouchInParent = area.convertToNodeSpaceAR(TouchPos);
      const position = cc.v2(TouchInParent.x, TouchInParent.y + 100);
      (cc.tween(chunkNode) as cc.Tween).to(0.03, { scale: 1, position }).start();
      const chunk = chunkNode.getComponent(ChunkControl);

      EventManager.emit('TouchStart', chunk);
    }
    event.stopPropagation();
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    const Area = event.currentTarget as cc.Node;
    Area.setSiblingIndex(0);
  }

  /** 当前是否存在空区域 */
  hasEmptyArea() {
    return this.areaList.find(areaNode => areaNode.childrenCount === 0) !== undefined;
  }

  /** 当前是否存在不为空区域 */
  hasChunkArea() {
    return this.areaList.find(areaNode => areaNode.childrenCount !== 0) !== undefined;
  }

  /** 随机获取一个空区域 */
  chooseEmptyArea() {
    const emptyAreaList = this.areaList.filter(areaNode => areaNode.childrenCount === 0);
    if (emptyAreaList.length !== 0) {
      const index = Math.floor(Math.random() * emptyAreaList.length);
      return emptyAreaList[index];
    }
  }

  /** 获取所有块 */
  getChunks() {
    return this.areaList.filter(areaNode => areaNode.childrenCount !== 0).map(areaNode => areaNode.children[0].getComponent(ChunkControl));
  }

  /** 生成块 */
  generate() {
    /** 获取当前出块逻辑 */
    const logic = gi.getLogic();

    switch (logic) {
      case Logic.EASY:
        this.easyGenerate(Libray.GLOBAL);
        break;
      case Logic.ASSISTANCE:
        this.assistanceGenerate(Libray.GLOBAL);
        break;
    }
  }

  /** 生成简易方块 */
  easyGenerate(librayType: Libray) {
    while (this.hasEmptyArea()) {
      const area = this.chooseEmptyArea();
      /** 方块库 */
      const libray = gi.getLibrary(librayType);
      const index = Math.floor(Math.random() * libray.length);
      const chunk = this.chunkBuilder(libray[index]);
      chunk.node.setParent(area);
      chunk.node.setPosition(0, 0);
    }
  }

  assistanceGenerate(librayType: Libray) {
    const libray = gi.getLibrary(librayType);
    /** （1） 方块库中可放入的方块 */
    const _placeList = this.getCanPlaceChunks(libray, this.board.map);
    /** （2） 可放入的方块中可触发消除的方块 */
    const _removeList = this.getCanRemoveChunks(_placeList, this.board.map);

    type chunkInfo = { value: gi.ChunkData; startRow: number; startCol: number };
    const chunkAInfo: chunkInfo = { value: null, startRow: -1, startCol: -1 };
    const chunkBInfo: chunkInfo = { value: null, startRow: -1, startCol: -1 };
    const chunkCInfo: chunkInfo = { value: null, startRow: -1, startCol: -1 };

    if (_removeList.length) {
      //（3） 存在可消除的方块

      // a. 记录可消除的方块中可触发消除的行列数，当检测到≥3行列时，停止检测并记录消除行列数为3，遍历棋盘后不足3次则记录实际消除的最大行列数

      /** 消除的行列数为最大的所有块 */
      let maxRemoveChunks = this.getMaxRemoveChunks(_removeList, this.board.map);

      // b. 在步骤a记录的消除行列数最多的方块种类中，选择面积最大的（面积相同则随机选择）一种方块，确认为方块A

      /** 消除的最大行列数中所有面积最大的块 */
      const maxAreaChunks = this.getMaxAreaChunks(maxRemoveChunks);
      const indexA = Math.floor(Math.random() * maxAreaChunks.length);
      chunkAInfo.value = maxAreaChunks.splice(indexA, 1)[0];

      // c. 去掉方块A，剩下的消除行列数最大的方块种类中，随机选择一种方块，要求在放入方块A后触发消除后能放入，确认为方块B	（去掉方块A无其他可消除方块，则在步骤（1）筛选出的方块种类中，随机一种可放入方块）
      this.removeChunk(chunkAInfo.value, _removeList);
      this.removeChunk(chunkAInfo.value, _placeList);
      this.removeChunk(chunkAInfo.value, maxRemoveChunks);
      const removeInfo = this.getMaxRemoveInfo(chunkAInfo.value, this.board.map);
      chunkAInfo.startRow = removeInfo.startRow;
      chunkAInfo.startCol = removeInfo.startCol;

      if (maxRemoveChunks.length === 0 && _removeList.length !== 0) {
        maxRemoveChunks = this.getMaxRemoveChunks(_removeList, this.board.map);
      }

      if (maxRemoveChunks.length) {
        const indexB = Math.floor(Math.random() * maxRemoveChunks.length);
        chunkBInfo.value = maxRemoveChunks[indexB];
      } else {
        const indexB = Math.floor(Math.random() * _placeList.length);
        chunkBInfo.value = _placeList[indexB];
      }
    } else {
      //（4） 不存在可消除的方块

      // a.选择面积最大的方块，确定为方块A（存在面积相同则随机选择1个）
      const maxAreaChunks = this.getMaxAreaChunks(_placeList);
      const index = Math.floor(Math.random() * maxAreaChunks.length);
      chunkAInfo.value = maxAreaChunks.splice(index, 1)[0];

      // b.按照遍历顺序，方块A能放入的第一个位置，将方块A放入后，用步骤（1）筛选出的方块种类（无需再筛选、去重）放入判断是否可触发消除
      const cell = Array.from(this.board.emptyCells).find(cell => this.board.canPlaceChunk(chunkAInfo.value, cell.row, cell.col, this.board.map));
      const { map: afterPlaceChunkAMap } = this.board.getAfterPlaceChunkInfo(chunkAInfo.value, cell.row, cell.col, this.board.map);
      this.removeChunk(chunkAInfo.value, _placeList);
      chunkAInfo.startRow = cell.row;
      chunkAInfo.startCol = cell.col;
      /** 放入方块A后可触发消除的方块 */
      const _removeListTem = this.getCanRemoveChunks(_placeList, afterPlaceChunkAMap);

      if (_removeListTem.length) {
        // 1）若存在可消除的方块

        // <1> 记录可消除的方块中可触发消除的行列数，当检测到≥3行列时，停止检测并记录消除行列数为3，遍历棋盘后不足3次则记录实际消除的最大行列数
        /** 消除的行列数为最大的所有块 */
        let maxRemoveChunks = this.getMaxRemoveChunks(_removeListTem, this.board.map);

        // <2> 在步骤<1>记录的消除行列数最多的方块种类中，选择面积最大的（面积相同则随机选择）一种方块，确认为方块B
        /** 消除的最大行列数中所有面积最大的块 */
        const maxAreaChunks = this.getMaxAreaChunks(maxRemoveChunks);
        const indexB = Math.floor(Math.random() * maxAreaChunks.length);
        chunkBInfo.value = maxAreaChunks.splice(indexB, 1)[0];

        const removeInfo = this.getMaxRemoveInfo(chunkBInfo.value, this.board.map);
        chunkBInfo.startRow = removeInfo.startRow;
        chunkBInfo.startCol = removeInfo.startCol;
      } else {
        // 2）若没有可消除的方块，在方块A放入后，选择步骤（1）筛选出的面积最大的能放入的方块，确定为方块B（存在面积相同则随机选择1个）
        /** 消除的最大行列数中所有面积最大的块 */
        const maxAreaChunks = this.getMaxAreaChunks(_placeList);
        const indexB = Math.floor(Math.random() * maxAreaChunks.length);
        chunkBInfo.value = maxAreaChunks.splice(indexB, 1)[0];
      }
      this.removeChunk(chunkBInfo.value, _placeList);
    }
    // （5）确认方块C
    // a.要求在放入方块A和方块B后（可以是触发消除后），一定能放入

    // b.在能放入的方块中随机出（权重配置）

    // c.判断是否满足面积和S≥6
    // 1）若所有可放入的方块面积和S，均小于6，则确认方块C为编号7（2*2的正方型）
    // 2）方块面积和S≥6，则确认该随机的方块为方块C

    // const removeInfo = this.getMaxRemoveInfo(chunkAInfo.value);
    // const { map: afterPlaceChunkAMap } = this.board.getAfterPlaceChunkInfo(chunkAInfo.value, removeInfo.startRow, removeInfo.startCol, this.board.map);
    // const { map: afterRemoveChunkAMap } = this.board.getAfterRemoveBlockInfo(afterPlaceChunkAMap);
  }

  removeChunk(chunkData: gi.ChunkData, chunkDataList: gi.ChunkData[]) {
    const _chunkData = chunkData;
    const _list = chunkDataList;
    const index = chunkDataList.findIndex(chunkData => {
      return _chunkData.id === chunkData.id;
    });
    if (index !== -1) return _list.splice(index, 1)[0];
  }

  /** 获取所有能够放入的块 */
  getCanPlaceChunks(chunkDataList: gi.ChunkData[], map: number[][]) {
    if (!chunkDataList.length) return [];
    const _list = chunkDataList.slice();
    const _map = map;

    return _list.filter(chunkData => {
      return Array.from(this.board.emptyCells).some(cell => {
        return this.board.canPlaceChunk(chunkData, cell.row, cell.col, _map);
      });
    });
  }

  /** 获取所有能够产生消除的块 */
  getCanRemoveChunks(chunkDataList: gi.ChunkData[], map: number[][]) {
    if (!chunkDataList.length) return [];
    const _list = chunkDataList.slice();
    const _map = map;

    return _list.filter(chunkData => {
      return Array.from(this.board.emptyCells).some(cell => {
        return this.board.canPlaceAndRemove(chunkData, cell.row, cell.col, _map);
      });
    });
  }

  /** 获取所有最大面积的块 */
  getMaxAreaChunks(chunkDataList: gi.ChunkData[]) {
    if (!chunkDataList.length) return [];
    // 面积从大到小排列
    const _list = chunkDataList.slice().sort((a, b) => b.area - a.area);

    // 过滤出所有面积最大且相等的块
    const maxAreaChunklist = _list.filter(chunk => chunk.area === _list[0].area);

    return maxAreaChunklist;
  }

  /** 获取所有最大消除行列数的块 */
  getMaxRemoveChunks(chunkDataList: gi.ChunkData[], map: number[][]) {
    if (!chunkDataList.length) return [];
    const _map = map;
    const _list = chunkDataList.slice();

    const maxRemoveInfos = _list.map(chunkData => {
      return this.getMaxRemoveInfo(chunkData, _map);
    });

    return maxRemoveInfos
      .sort((a, b) => b.count - a.count)
      .filter(item => item.count === maxRemoveInfos[0].count)
      .map(item => item.chunkData);
  }

  /** 获取块的最大消除行列数信息 */
  getMaxRemoveInfo(chunkData: gi.ChunkData, map: number[][]) {
    const _map = map;
    const result = { count: 0, startRow: -1, startCol: -1, rows: [] as number[], cols: [] as number[], chunkData };
    for (const cell of Array.from(this.board.emptyCells)) {
      if (this.board.canPlaceAndRemove(chunkData, cell.row, cell.col, _map)) {
        const { map: afterPlaceChunkMap } = this.board.getAfterPlaceChunkInfo(chunkData, cell.row, cell.col, _map);
        const removeInfo = this.board.getAfterRemoveBlockInfo(afterPlaceChunkMap);
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

  /** 块生成器 */
  chunkBuilder(chunkData: gi.ChunkData) {
    const chunkNode = cc.instantiate(this.chunkPrefab);
    const chunk = chunkNode.getComponent(ChunkControl);
    chunk.init(chunkData);
    return chunk;
  }
}
