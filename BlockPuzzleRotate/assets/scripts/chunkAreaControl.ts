import AreaControl from './areaControl';
import ChunkControl from './chunkControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChunkAreaControl extends cc.Component {
  /** 区域列表 */
  @property({ type: [AreaControl], tooltip: '区域' })
  areaList: AreaControl[] = [];

  @property({ type: cc.Prefab, tooltip: '方块集合预制体' })
  chunkPrefab: cc.Prefab = null;

  indexs = [30, 28, 9, 13, 18, 21, 14, 0];

  onLoad() {}

  /** 生成简易方块 */
  easyGenerate() {
    /** 生成的块 */
    const chunks: ChunkControl[] = [];
    while (this.hasEmptyArea()) {
      const area = this.shiftEmptyArea();
      /** 方块库 */
      const libray = gi.getLibrary();
      const index = this.indexs.shift();
      const id = index !== undefined ? index : Math.floor(Math.random() * libray.length);
      const chunk = this.chunkBuilder(gi.getChunk(id)).ctrl;

      area.setChunk(chunk);
      chunk.setArea(area);
      2;
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
        .to(0.1, { scale: 0.6 })
        .start();
    }
  }

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

  /** 块生成器 */
  chunkBuilder(chunkData: gi.ChunkData) {
    const res = gi.prefabBuilder(this.chunkPrefab, ChunkControl);
    res.ctrl.init(chunkData);
    return res;
  }
}
