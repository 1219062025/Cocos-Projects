import Guide from './guide/guide';
import Utils from './utils/utils';
import Event from './event/event';
import QuadTree from './quadtree/quadtree';
import Pool from './pool/pool';
import Map from './map/map';
import Board from './board/board';

class GI {
  /** 当前关卡 */
  private _level = 0;
  /** 当前使用的游戏模式 */
  private _mode: string = '';
  /** 当前使用的出块逻辑 */
  private _logic: string = '';

  /** ___DEBUG START___ */
  /** 得分 */
  score = 0;
  /** 全局缩放 */
  scale = 1;
  /** ___DEBUG END___ */

  /** Block的宽度 */
  BLOCKWIDTH = 124;
  /** Block的高度 */
  BLOCKHEIGHT = 124;
  /** Cell的宽度 */
  CELLWIDTH = 124;
  /** Cell的高度 */
  CELLHEIGHT = 124;
  /** 网格行数 */
  MAPROWS = 8;
  /** 网格列数 */
  MAPCOLS = 8;
  /** 游戏区域节点宽度 */
  MAPWIDTH = this.BLOCKWIDTH * this.MAPCOLS;
  /** 游戏区域节点高度 */
  MAPHEIGHT = this.BLOCKHEIGHT * this.MAPROWS;
  /** 基础方块有多少种 */
  BASEBLOCKCOUNT = 7;
  /** 块初始化时的缩放 */
  CHUNKSCALE = 0.4;

  /** 设置出块逻辑 */
  setMode(mode: string) {
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
  getLibrary() {
    const logic = this.getLogic();
    let librayType;

    switch (logic) {
      case gi.Logic.EASY:
        librayType = gi.Libray.GLOBAL;
        break;
      case gi.Logic.ASSISTANCE:
        librayType = gi.Libray.GLOBAL;
        break;
      default:
        break;
    }
    const library = (cc.loader.getRes(`chunklibrary/${librayType}`, cc.JsonAsset) as cc.JsonAsset).json;
    /** 深拷贝 */
    return JSON.parse(JSON.stringify(library));
  }

  /** 根据id获取方块库中的块，如果不传入哪个方块库默认使用当前方块库 */
  getChunk(id: number, librayType?: string) {
    if (librayType) {
      const library = (cc.loader.getRes(`chunklibrary/${librayType}`, cc.JsonAsset) as cc.JsonAsset).json;
      const chunk = library.find(chunkData => chunkData.id === id);
      return JSON.parse(JSON.stringify(chunk));
    } else {
      const library = this.getLibrary();
      const chunk = library.find(chunkData => chunkData.id === id);
      return JSON.parse(JSON.stringify(chunk));
    }
  }

  /** 设置出块逻辑 */
  setLogic(logic: string) {
    this._logic = logic;
  }

  /** 获取当前使用的出块逻辑 */
  getLogic() {
    return this._logic;
  }

  /** 获取方块spriteFrame */
  getBlockSprite(type: number, category: string) {
    const path = `${category}/${type}`;
    return cc.loader.getRes(path, cc.SpriteFrame) as cc.SpriteFrame;
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
    gi.setLogic(gi.Logic.ASSISTANCE);
    // gi.setLogic(gi.Logic.EASY);
  }

  /** 预制体生成器 */
  prefabBuilder<T extends cc.Component>(
    prefab: cc.Prefab,
    control: {
      prototype: T;
    }
  ) {
    const node = cc.instantiate(prefab);
    const ctrl = node.getComponent(control);
    return { node, ctrl };
  }
}

const _global = typeof window === 'undefined' ? globalThis : window;
// @ts-ignore
_global['gi'] = _global.gi || new GI() || {};

// 挂载全局类型
import('./types/types').then(value => {
  for (const key in value.default) {
    if (Object.prototype.hasOwnProperty.call(value.default, key)) {
      _global['gi'][key] = value.default[key];
    }
  }
});

_global['gi']['Utils'] = Utils;
_global['gi']['Guide'] = Guide;
_global['gi']['Event'] = Event;
_global['gi']['QuadTree'] = QuadTree;
_global['gi']['Pool'] = Pool;
_global['gi']['Map'] = Map;
_global['gi']['Board'] = Board;
