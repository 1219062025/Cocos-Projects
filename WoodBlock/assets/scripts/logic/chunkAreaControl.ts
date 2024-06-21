import BoardControl from './boardControl';
import CellControl from './cellControl';
import ChunkControl from './chunkControl';
import AreaControl from './areaControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChunkAreaControl extends cc.Component {
  /** 区域列表 */
  @property({ type: [AreaControl], tooltip: '区域' })
  areaList: AreaControl[] = [];

  @property({ type: cc.Prefab, tooltip: '方块集合预制体' })
  chunkPrefab: cc.Prefab = null;

  @property({ type: BoardControl, tooltip: '放置区域的控制脚本' })
  board: BoardControl = null;

  onLoad() {}

  /** 当前是否存在空区域 */
  hasEmptyArea() {
    return this.areaList.find(area => !area.chunk) !== undefined;
  }

  /** 当前是否存在不为空区域 */
  hasChunkArea() {
    return this.areaList.find(area => area.chunk) !== undefined;
  }

  /** 随机获取一个空区域 */
  chooseEmptyArea() {
    const emptyAreaList = this.areaList.filter(area => !area.chunk);
    if (emptyAreaList.length !== 0) {
      const index = Math.floor(Math.random() * emptyAreaList.length);
      return emptyAreaList[index];
    }
  }

  /** 顺序获取一个空区域 */
  shiftEmptyArea() {
    const emptyArea = this.areaList.find(area => !area.chunk);
    return emptyArea;
  }

  /** 获取所有块 */
  getChunks() {
    return this.areaList.filter(area => area.chunk).map(area => area.chunk);
  }

  /** 按顺序取出一个块 */
  shiftChunk() {
    const area = this.areaList.find(area => area.chunk);
    const chunkNode = area.chunk.node;
    const chunk = chunkNode.getComponent(ChunkControl);
    return chunk;
  }

  /** 生成块 */
  generate() {
    /** 获取当前出块逻辑 */
    const logic = gi.getLogic();

    switch (logic) {
      case gi.Logic.EASY:
        this.easyGenerate();
        break;
      case gi.Logic.ASSISTANCE:
        this.assistanceGenerate();
        break;
    }
  }

  /** 生成简易方块 */
  easyGenerate() {
    /** 生成的块 */
    const chunks: ChunkControl[] = [];
    while (this.hasEmptyArea()) {
      const area = this.chooseEmptyArea();
      /** 方块库 */
      const libray = gi.getLibrary();
      const id = Math.floor(Math.random() * libray.length);
      const chunk = this.chunkBuilder(gi.getChunk(id)).ctrl;

      area.setChunk(chunk);
      chunk.setArea(area);

      chunk.node.setParent(area.node);
      chunk.node.setPosition(0, 0);

      chunks.push(chunk);
    }

    // 对所有块进行缩放缓动动画生成
    for (const chunk of chunks) {
      (cc.tween(chunk.node) as cc.Tween)
        .call(() => {
          chunk.node.setScale(0);
        })
        .to(0.1, { scale: gi.CHUNKSCALE })
        .start();
    }
  }

  assistanceGenerate() {
    const libray = gi.getLibrary();
    /** （1） 方块库中可放入的方块 */
    const _placeList = gi.Board.getCanPlaceChunks(libray, this.board.map);
    /** （2） 可放入的方块中可触发消除的方块 */
    const _removeList = gi.Board.getCanRemoveChunks(_placeList, this.board.map);

    type chunkInfo = { value: gi.ChunkData; startRow: number; startCol: number };
    const chunkAInfo: chunkInfo = { value: null, startRow: -1, startCol: -1 };
    const chunkBInfo: chunkInfo = { value: null, startRow: -1, startCol: -1 };
    const chunkCInfo: chunkInfo = { value: null, startRow: -1, startCol: -1 };

    if (_removeList.length) {
      //（3） 存在可消除的方块

      // a. 记录可消除的方块中可触发消除的行列数，当检测到≥3行列时，停止检测并记录消除行列数为3，遍历棋盘后不足3次则记录实际消除的最大行列数

      /** 消除的行列数为最大的所有块 */
      let maxRemoveChunks = gi.Board.getMaxRemoveChunks(_removeList, this.board.map);

      // b. 在步骤a记录的消除行列数最多的方块种类中，选择面积最大的（面积相同则随机选择）一种方块，确认为方块A

      /** 消除的最大行列数中所有面积最大的块 */
      const maxAreaChunks = gi.Board.getMaxAreaChunks(maxRemoveChunks);
      const indexA = Math.floor(Math.random() * maxAreaChunks.length);
      chunkAInfo.value = maxAreaChunks.splice(indexA, 1)[0];

      // c. 去掉方块A，剩下的消除行列数最大的方块种类中，随机选择一种方块，要求在放入方块A后触发消除后能放入，确认为方块B	（去掉方块A无其他可消除方块，则在步骤（1）筛选出的方块种类中，随机一种可放入方块）
      this.removeChunk(chunkAInfo.value, _removeList);
      this.removeChunk(chunkAInfo.value, _placeList);
      this.removeChunk(chunkAInfo.value, maxRemoveChunks);
      const removeInfo = gi.Board.getMaxRemoveInfo(chunkAInfo.value, this.board.map);
      chunkAInfo.startRow = removeInfo.startRow;
      chunkAInfo.startCol = removeInfo.startCol;

      if (maxRemoveChunks.length === 0 && _removeList.length !== 0) {
        maxRemoveChunks = gi.Board.getMaxRemoveChunks(_removeList, this.board.map);
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
      const maxAreaChunks = gi.Board.getMaxAreaChunks(_placeList);
      const index = Math.floor(Math.random() * maxAreaChunks.length);
      chunkAInfo.value = maxAreaChunks.splice(index, 1)[0];

      // b.按照遍历顺序，方块A能放入的第一个位置，将方块A放入后，用步骤（1）筛选出的方块种类（无需再筛选、去重）放入判断是否可触发消除
      const cell = Array.from(this.board.emptyCells).find(cell => gi.Map.canPlace(this.board.map, chunkAInfo.value, cell.row, cell.col));
      const afterPlaceAMap = gi.Map.place(this.board.map, chunkAInfo.value, cell.row, cell.col);
      this.removeChunk(chunkAInfo.value, _placeList);
      chunkAInfo.startRow = cell.row;
      chunkAInfo.startCol = cell.col;
      /** 放入方块A后可触发消除的方块 */
      const _removeListTem = gi.Board.getCanRemoveChunks(_placeList, afterPlaceAMap);

      if (_removeListTem.length) {
        // 1）若存在可消除的方块

        // <1> 记录可消除的方块中可触发消除的行列数，当检测到≥3行列时，停止检测并记录消除行列数为3，遍历棋盘后不足3次则记录实际消除的最大行列数
        /** 消除的行列数为最大的所有块 */
        let maxRemoveChunks = gi.Board.getMaxRemoveChunks(_removeListTem, this.board.map);

        // <2> 在步骤<1>记录的消除行列数最多的方块种类中，选择面积最大的（面积相同则随机选择）一种方块，确认为方块B
        /** 消除的最大行列数中所有面积最大的块 */
        const maxAreaChunks = gi.Board.getMaxAreaChunks(maxRemoveChunks);
        const indexB = Math.floor(Math.random() * maxAreaChunks.length);
        chunkBInfo.value = maxAreaChunks.splice(indexB, 1)[0];

        const removeInfo = gi.Board.getMaxRemoveInfo(chunkBInfo.value, this.board.map);
        chunkBInfo.startRow = removeInfo.startRow;
        chunkBInfo.startCol = removeInfo.startCol;
      } else {
        // 2）若没有可消除的方块，在方块A放入后，选择步骤（1）筛选出的面积最大的能放入的方块，确定为方块B（存在面积相同则随机选择1个）
        /** 消除的最大行列数中所有面积最大的块 */
        const maxAreaChunks = gi.Board.getMaxAreaChunks(_placeList);
        const indexB = Math.floor(Math.random() * maxAreaChunks.length);
        chunkBInfo.value = maxAreaChunks.splice(indexB, 1)[0];
      }
      this.removeChunk(chunkBInfo.value, _placeList);
    }

    console.log(chunkAInfo.value, chunkBInfo.value);
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

  removeChunk(chunkData: gi.ChunkData, dataList: gi.ChunkData[]) {
    const _chunkData = chunkData;
    const _list = dataList;
    const index = dataList.findIndex(chunkData => {
      return _chunkData.id === chunkData.id;
    });
    if (index !== -1) return _list.splice(index, 1)[0];
  }

  /** 块生成器 */
  chunkBuilder(chunkData: gi.ChunkData) {
    const res = gi.prefabBuilder(this.chunkPrefab, ChunkControl);
    res.ctrl.init(chunkData);
    return res;
  }
}
