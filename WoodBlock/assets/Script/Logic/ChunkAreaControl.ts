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
    /** 方块库中可放入的方块 */
    const placeInfos = this.getPlaceInfos(librayType);

    if (placeInfos.length) {
      // this.getRemoveInfos(placeInfos);
    }

    // if (placeInfos.length) {
    //   placeInfos.forEach(placeInfo => {
    //     const { cells, chunkData } = placeInfo;
    //     cells.forEach(cell => {
    //       const _map = this.board.getAfterPlaceChunkMap(chunkData, cell.row, cell.col, this.board.map);
    //       const { isCanRemove, removeCount } = this.board.canRemoveBlock(_map);
    //     });
    //   });
    // }
  }

  /** 获取方块库中所有能够放入的块 */
  getPlaceInfos(librayType: Libray) {
    const libray = gi.getLibrary(librayType);
    /** 方块库中可放入的方块 */
    const placeInfos: gi.PlaceInfo[] = [];
    libray.forEach(chunkData => {
      const cells = Array.from(this.board.emptyCells).filter(cell => this.board.canPlaceChunk(chunkData, cell.row, cell.col, this.board.map));
      if (cells.length) placeInfos.push({ cells, chunkData });
    });
    return placeInfos;
  }

  /** 获取所有能够产生消除的块 */
  getRemoveInfos(placeInfos: gi.PlaceInfo[]) {
    const removeInfos = new Set<gi.PlaceInfo>([]);
    placeInfos.forEach(placeInfo => {
      const { cells, chunkData } = placeInfo;
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const _map = this.board.getAfterPlaceChunkMap(chunkData, cell.row, cell.col, this.board.map);
        const { isCanRemove, removeCount } = this.board.canRemoveBlock(_map);
        if (isCanRemove) {
          removeInfos.add(placeInfo);
          if (removeCount >= 3) {
            placeInfo.removeCount = 3;
          } else {
            placeInfo.removeCount = Math.max(placeInfo.removeCount, removeCount);
          }
        }
      }
    });
    return Array.from(removeInfos);
  }

  /** 块生成器 */
  chunkBuilder(chunkData: gi.ChunkData) {
    const chunkNode = cc.instantiate(this.chunkPrefab);
    const chunk = chunkNode.getComponent(ChunkControl);
    chunk.init(chunkData);
    return chunk;
  }
}
