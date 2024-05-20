import { BlockControl } from './BlockControl';
import { ChunkControl } from './ChunkControl';
import EventManager from './Common/EventManager';
import { CenterChildren } from './Common/Utils';
import { BlockHeight, BlockWidth } from './Config/GameConfig';
import { ChunkTemplate } from './Game';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  @property({ type: [cc.Node], tooltip: '区域' })
  AreaList: cc.Node[] = [];

  @property({ type: cc.Prefab, tooltip: '方块预制体' })
  BlockPrefab: cc.Prefab = null;

  @property({ type: cc.Prefab, tooltip: '方块集合预制体' })
  ChunkPrefab: cc.Prefab = null;

  /** Chunk模板映射 */
  ChunkTemplateMap = new Map<number, ChunkTemplate>([]);

  get EmptyArea() {
    return this.AreaList.find(AreaNode => AreaNode.childrenCount === 0);
  }

  get isAllAreaEmpty() {
    return this.AreaList.every(AreaNode => AreaNode.childrenCount === 0);
  }

  onLoad() {
    this.AreaList.forEach(Area => {
      Area.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    });
  }

  onTouchStart(event: cc.Event.EventTouch) {
    const Area = event.currentTarget as cc.Node;
    const ChunkNode = Area.getChildByName('Chunk');
    const TouchPos = event.getLocation();
    const TouchInParent = Area.convertToNodeSpaceAR(TouchPos);
    const position = cc.v2(TouchInParent.x, TouchInParent.y + 100);
    (cc.tween(ChunkNode) as cc.Tween).to(0.03, { scale: 1, position }).start();
    EventManager.emit('TouchStart', ChunkNode);
  }

  Init(ChunkTemplateMap: Map<number, ChunkTemplate>) {
    this.ChunkTemplateMap = ChunkTemplateMap;
  }

  GenerateChunk(key: number) {
    if (this.EmptyArea) {
      const ChunkNode = this.ChunkBuilder(key);
      ChunkNode.setParent(this.EmptyArea);
      ChunkNode.setPosition(0, 0);
    }
  }

  /** 方块集合生成器 */
  ChunkBuilder(key: number) {
    if (this.ChunkTemplateMap.has(key) === false) throw new Error(`There is no set of blocks with preset value '${key}'`);

    const ChunkTemplate = this.ChunkTemplateMap.get(key);
    const { rows, cols, blockInfoList } = ChunkTemplate;
    const ChunkNode = cc.instantiate(this.ChunkPrefab);
    const Chunk = ChunkNode.getComponent(ChunkControl);
    const ChunkType = Math.floor(Math.random() * 7);

    // 根据Chunk模板生成方块
    blockInfoList.forEach(ChunkBlockInfo => {
      const type = ChunkBlockInfo.goalType || ChunkType;
      const BlockNode = this.BlockNodeBuilder(type);
      const { difRows, difCols } = ChunkBlockInfo;
      const X = difCols * BlockWidth;
      const Y = -difRows * BlockHeight;
      BlockNode.setParent(ChunkNode);
      BlockNode.setPosition(X, Y);

      /** 当遍历到起始块的时候初始化Chunk */
      if (difRows === 0 && difCols === 0) {
        Chunk.Init(ChunkType, BlockNode, ChunkTemplate);
      }
      Chunk.ChunkBlockNodes.push({ difRows, difCols, blockNode: BlockNode });
      ChunkNode.setContentSize(cols * BlockWidth, rows * BlockHeight);
    });
    // 所有方块居中
    CenterChildren(ChunkNode);
    return ChunkNode;
  }

  /** 方块生成器 */
  BlockNodeBuilder(type: number) {
    const BlockNode = cc.instantiate(this.BlockPrefab);
    const Block = BlockNode.getComponent(BlockControl);
    Block.Init(type);
    return BlockNode;
  }
}
