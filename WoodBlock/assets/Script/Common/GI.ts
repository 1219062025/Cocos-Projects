import { BlockCategory, BaseBlock, GoalBlock, Libray, Logic, Mode } from '../Type/Enum';

class GI {
  /** 当前使用的游戏模式 */
  private _mode = 0;
  /** 当前使用的出块逻辑 */
  private _logic = 0;
  /** 该局游戏得分 */
  score = 0;
  /** 玩家历史最高分 */
  bestScore = 0;

  /** Block的宽度 */
  blockWidth = 124;
  /** Block的高度 */
  blockHeight = 124;
  /** Cell的宽度 */
  cellWidth = 124;
  /** Cell的高度 */
  cellHeight = 124;
  /** 初始化有多少行 */
  initiaRowCount = 8;
  /** 初始化有多少列 */
  initiaColCount = 8;
  /** 游戏区域节点宽度 */
  gameAreaWidth = this.initiaColCount * this.cellWidth;
  /** 游戏区域节点高度 */
  gameAreaHeight = this.initiaRowCount * this.cellHeight;
  /** 基础方块有多少种 */
  baseBlockCount = 7;

  /** 设置出块逻辑 */
  setMode(mode: Mode) {
    this._mode = mode;
  }

  /** 设置出块逻辑 */
  getMode() {
    return this._mode;
  }

  /** 获取当前使用的方块库 */
  getLibrary(librayType: Libray) {
    const library = (cc.loader.getRes(`ChunkLibrary/${Libray[librayType]}`, cc.JsonAsset) as cc.JsonAsset).json;
    /** 深拷贝 */
    return JSON.parse(JSON.stringify(library));
  }

  /** 设置出块逻辑 */
  setLogic(logic: Logic) {
    this._logic = logic;
  }

  /** 获取当前使用的出块逻辑 */
  getLogic() {
    return this._logic;
  }

  /** 获取方块spriteFrame */
  getBlockSprite(type: number, category: number) {
    const categoryName = BlockCategory[category];
    const path = `${categoryName}/${type}`;
    return cc.loader.getRes(path, cc.SpriteFrame) as cc.SpriteFrame;
  }
}

const _global = typeof window === 'undefined' ? globalThis : window;
// @ts-ignore
_global['gi'] = _global.gi || new GI() || {};
