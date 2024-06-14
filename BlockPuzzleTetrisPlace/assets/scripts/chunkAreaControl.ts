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
  easyGenerate(librayType: string) {
    /** 生成的块 */
    const chunks: ChunkControl[] = [];

    while (this.hasEmptyArea()) {
      const area = this.chooseEmptyArea();
      /** 方块库 */
      const libray = gi.getLibrary(librayType);
      const index = Math.floor(Math.random() * libray.length);
      const chunk = this.chunkBuilder(libray[index]).ctrl;

      chunk.node.setParent(area);
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

  /** 按顺序取出一个块 */
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
