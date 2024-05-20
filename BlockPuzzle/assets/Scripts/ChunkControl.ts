import EventManager from './Common/EventManager';
import { BlockType } from './Config/GameConfig';
import { ChunkBlockInfo, ChunkTemplate } from './Game';

const { ccclass, property } = cc._decorator;

@ccclass
export class ChunkControl extends cc.Component {
  ChunkType: BlockType;
  /** 当前Chunk的起始块 */
  StartBlockNode: cc.Node = null;
  /** 当前Chunk使用的预设 */
  Template: ChunkTemplate = null;
  /** 当前Chunk包含的方块 */
  ChunkBlockNodes: ChunkBlockInfo[] = [];

  Init(ChunkType: BlockType, StartBlockNode: cc.Node, Template: ChunkTemplate) {
    this.ChunkType = ChunkType;
    this.StartBlockNode = StartBlockNode;
    this.Template = Template;
  }
}
