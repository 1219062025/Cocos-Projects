import { Logic, Libray } from './Type/Enum';
import ChunkControl from './chunkControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockAreaControl extends cc.Component {
  /** 区域列表 */
  @property({ type: [cc.Node], tooltip: '区域' })
  areaList: cc.Node[] = [];

  @property({ type: cc.Prefab, tooltip: '方块集合预制体' })
  chunkPrefab: cc.Prefab = null;

  onLoad() {}

  /** 生成块 */
  generate() {
    /** 获取当前出块逻辑 */
    const logic = gi.getLogic();

    switch (logic) {
      case Logic.EASY:
        this.easyGenerate(Libray.GLOBAL);
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

  shiftChunk() {
    const areaNode = this.areaList.find(area => area.childrenCount !== 0);

    const chunkNode = areaNode.getChildByName('chunk');
    const chunk = chunkNode.getComponent(ChunkControl);
    return chunk;
  }

  /** 块生成器 */
  chunkBuilder(chunkData: gi.ChunkData) {
    const chunkNode = cc.instantiate(this.chunkPrefab);
    const chunk = chunkNode.getComponent(ChunkControl);
    chunk.init(chunkData);
    return chunk;
  }
}
