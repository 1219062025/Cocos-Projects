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
    // （1） 方块库中可放入的方块
    const _placeList = this.getCanPlaceChunks(libray);
    // （2） 可放入的方块中可触发消除的方块
    const _removeList = this.getCanRemoveChunks(_placeList);

    if (_removeList.length) {
      //（3） 存在可消除的方块

      // a. 记录可消除的方块中可触发消除的行列数，当检测到≥3行列时，停止检测并记录消除行列数为3，遍历棋盘后不足3次则记录实际消除的最大行列数
      const maxRemovechunks = this.getMaxRemoveChunks(_removeList);

      // b. 在步骤a记录的消除行列数最多的方块种类中，选择面积最大的（面积相同则随机选择）一种方块，确认为方块A
      const maxAreaChunks = this.getMaxAreaChunks(maxRemovechunks);
      const index = Math.floor(Math.random() * maxAreaChunks.length);
      const chunkA = maxAreaChunks.splice(index, 1)[0];

      // c. 去掉方块A，剩下的消除行列数最大的方块种类中，随机选择一种方块，要求在放入方块A后触发消除后能放入，确认为方块B	（去掉方块A无其他可消除方块，则在步骤（1）筛选出的方块种类中，随机一种可放入方块）
      this.removeChunk(chunkA, _removeList);
      this.removeChunk(chunkA, _placeList);
      if (_removeList.length) {
      } else {
      }
    } else {
      //（4） 不存在可消除的方块
      const maxAreaChunks = this.getMaxAreaChunks(_placeList);
      const index = Math.floor(Math.random() * maxAreaChunks.length);
      const chunkA = maxAreaChunks.splice(index, 1)[0];
    }
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
  getCanPlaceChunks(chunkDataList: gi.ChunkData[]) {
    if (!chunkDataList.length) return [];
    const _list = chunkDataList.slice();

    return _list.filter(chunkData => {
      return Array.from(this.board.emptyCells).some(cell => this.board.canPlaceChunk(chunkData, cell.row, cell.col, this.board.map));
    });
  }

  /** 获取所有能够产生消除的块 */
  getCanRemoveChunks(chunkDataList: gi.ChunkData[]) {
    if (!chunkDataList.length) return [];
    const _list = chunkDataList.slice();
    return _list.filter(chunkData => {
      return Array.from(this.board.emptyCells).some(cell => {
        const canPlace = this.board.canPlaceChunk(chunkData, cell.row, cell.col, this.board.map);
        if (canPlace) {
          const afterPlaceChunkMap = this.board.getAfterPlaceChunkInfo(chunkData, cell.row, cell.col, this.board.map);
          return this.board.canRemoveBlock(afterPlaceChunkMap);
        } else {
          return false;
        }
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
  getMaxRemoveChunks(chunkDataList: gi.ChunkData[]) {
    if (!chunkDataList.length) return [];
    const _list = chunkDataList.slice();

    const temp = _list.map(chunkData => {
      let res = { count: 0, row: -1, col: -1, chunkData };
      for (const cell of Array.from(this.board.emptyCells)) {
        const canPlace = this.board.canPlaceChunk(chunkData, cell.row, cell.col, this.board.map);
        if (canPlace) {
          const afterPlaceChunkMap = this.board.getAfterPlaceChunkInfo(chunkData, cell.row, cell.col, this.board.map);
          if (this.board.canRemoveBlock(afterPlaceChunkMap)) {
            const removeInfo = this.board.getRemoveBlockInfo(this.board.map);
            res.count = Math.max(removeInfo.count, res.count);
            res.row = cell.row;
            res.col = cell.col;
            if (res.count >= 3) return { count: 3, row: cell.row, col: cell.col, chunkData };
          }
        }
      }
      return res;
    });

    const temp1 = temp.slice().sort((a, b) => b.count - a.count);
    const temp2 = temp1.filter(item => item.count === temp1[0].count);
    const maxRemoveChunks = temp2.map(item => item.chunkData);
    return maxRemoveChunks;
  }

  /** 获取块的最大消除行列数信息 */
  getMaxRemoveInfo(chunkData: gi.ChunkData) {
    let res = { count: 0, row: -1, col: -1, chunkData };
    for (const cell of Array.from(this.board.emptyCells)) {
      const canPlace = this.board.canPlaceChunk(chunkData, cell.row, cell.col, this.board.map);
      if (canPlace) {
        const afterPlaceChunkMap = this.board.getAfterPlaceChunkInfo(chunkData, cell.row, cell.col, this.board.map);
        if (this.board.canRemoveBlock(afterPlaceChunkMap)) {
          const removeInfo = this.board.getRemoveBlockInfo(this.board.map);
          res.count = Math.max(removeInfo.count, res.count);
          res.row = cell.row;
          res.col = cell.col;
          if (res.count >= 3) {
            res = { count: 3, row: cell.row, col: cell.col, chunkData };
            break;
          }
        }
      }
    }
    return res;
  }

  /** 块生成器 */
  chunkBuilder(chunkData: gi.ChunkData) {
    const chunkNode = cc.instantiate(this.chunkPrefab);
    const chunk = chunkNode.getComponent(ChunkControl);
    chunk.init(chunkData);
    return chunk;
  }
}
