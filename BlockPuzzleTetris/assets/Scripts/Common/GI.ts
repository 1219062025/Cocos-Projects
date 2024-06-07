import { BlockCategory, BaseBlock, GoalBlock, Libray, Logic, Mode } from '../Type/Enum';

class GI {
  /** 当前关卡 */
  private _level = 0;
  /** 当前使用的游戏模式 */
  private _mode = 0;
  /** 当前使用的出块逻辑 */
  private _logic = 0;

  /** Block的宽度 */
  BLOCKWIDTH = 55;
  /** Block的高度 */
  BLOCKHEIGHT = 55;
  /** 网格行数 */
  MAPROWS = 22;
  /** 网格列数 */
  MAPCOLS = 17;
  /** 游戏区域节点宽度 */
  MAPWIDTH = this.BLOCKWIDTH * this.MAPCOLS;
  /** 游戏区域节点高度 */
  MAPHEIGHT = this.BLOCKHEIGHT * this.MAPROWS;
  /** 基础方块有多少种 */
  BASEBLOCKCOUNT = 7;

  /** 设置出块逻辑 */
  setMode(mode: Mode) {
    this._mode = mode;
  }

  /** 设置出块逻辑 */
  getMode() {
    return this._mode;
  }

  /** 设置当前关卡 */
  setLevel(value: number) {
    this._level = value;
  }

  /** 获取当前关卡 */
  getLevel() {
    return this._level;
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
