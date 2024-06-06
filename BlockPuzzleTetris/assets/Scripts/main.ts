import { Logic } from './Type/Enum';
import ChunkAreaControl from './chunkAreaControl';
import BoardControl from './boardControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  @property({ type: ChunkAreaControl })
  chunkArea: ChunkAreaControl = null;

  @property({ type: BoardControl })
  board: BoardControl = null;

  async onLoad() {
    await this.loadGameRes();
    this.loadGameConfig();
    this.chunkArea.generate();
    this.board.initBoard(0);
    this.getChunk();
  }

  getChunk() {
    if (this.chunkArea.hasChunkArea()) {
      const chunk = this.chunkArea.shiftChunk();
      (cc.tween(chunk.node) as cc.Tween)
        .to(0.2, { scale: 1.1 })
        .to(0.2, { scale: 0 })
        .call(() => {
          this.board.putChunk(chunk);
        })
        .start();
    }
  }

  /** 载入游戏资源 */
  loadGameRes() {
    /** 提前载入SpriteFrame资源，需要时使用cc.loader.getRes获取 */
    const loadSpritePromise = new Promise(resolve => {
      cc.loader.loadResDir('./', cc.SpriteFrame, (err, assets) => {
        if (err) throw new Error(err.message);
        resolve(true);
      });
    });

    /** 提前载入Json资源，需要时使用cc.loader.getRes获取 */
    const loadJsonPromise = new Promise(resolve => {
      cc.loader.loadResDir('./', cc.JsonAsset, (err, assets) => {
        if (err) throw new Error(err.message);
        resolve(true);
      });
    });

    return Promise.all([loadSpritePromise, loadJsonPromise]);
  }

  /** 载入、设置游戏配置 */
  loadGameConfig() {
    gi.setLogic(Logic.EASY);
  }
}
