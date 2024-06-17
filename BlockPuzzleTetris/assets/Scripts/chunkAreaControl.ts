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

  /** 生成简易方块 */
  easyGenerate(librayType: Libray) {
    const indexs = [31, 1, 4, 1, 9];
    while (this.hasEmptyArea()) {
      const area = this.sequenceEmptyArea();
      /** 方块库 */
      const libray = gi.getLibrary(librayType);
      // const index = 1;
      const index = indexs.shift();
      const chunk = this.chunkBuilder(libray.find(chunkData => chunkData.id === index)).ctrl;
      chunk.node.setScale(0.6);
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

  /** 按顺序获取第一个空区域 */
  sequenceEmptyArea() {
    const emptyArea = this.areaList.find(areaNode => areaNode.childrenCount === 0);
    return emptyArea;
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
    const res = gi.prefabBuilder(this.chunkPrefab, ChunkControl);
    res.ctrl.init(chunkData);
    return res;
  }
}
