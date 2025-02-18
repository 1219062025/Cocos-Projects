import Utils from './utils/utils';
import Guide from './guide/guide';
import Event from './event/event';
import QuadTree from './quadtree/quadtree';
import Pool from './pool/pool';

class GI {
  /** Tile之间的间隔 */
  TILE_SPACE = 12;
  /** Tile的宽度 */
  TILE_WIDTH = 196;
  /** Tile的高度 */
  TILE_HEIGHT = 236;
  /** x轴上的偏移 */
  OFFSET_X = 90;
  /** y轴上的偏移 */
  OFFSET_Y = 108;
  /** 层级在x轴上的偏移 */
  TIER_OFFSET_X = -16;
  /** 层级在y轴上的偏移 */
  TIER_OFFSET_Y = 16;
  /** 游戏区域宽度 */
  GAME_WIDTH = 880;
  /** 游戏区域高度 */
  GAME_HEIGHT = 1416;

  /** 当前关卡 */
  private _level = 0;
  /** 当前使用的游戏模式 */
  private _mode: string = '';

  /** ___DEBUG START___ */
  /** 得分 */
  score = 0;
  /** 全局缩放 */
  scale = 1;
  /** 当前语言缩写 */
  language = '';
  tileScale = 1;
  /** ___DEBUG END___ */

  /** 设置游戏模式 */
  setMode(mode: string) {
    this._mode = mode;
  }

  /** 获取游戏模式 */
  getMode() {
    return this._mode;
  }

  /** 设置当前关卡 */
  setLevel(value: number) {
    if (value < 0) throw new Error('关卡数不能小于0');
    this._level = value;
  }

  /** 获取当前关卡 */
  getLevel() {
    return this._level;
  }

  /** 获取当前关卡信息 */
  getLevelInfo() {
    const levle = this.getLevel();
    const infos = (cc.loader.getRes('levelinfos', cc.JsonAsset) as cc.JsonAsset).json;
    return infos[levle] as gi.LevelInfo;
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
  loadGameConfig() {}

  /** 设置当前语言 */
  setLanguage(l: string) {
    this.language = l;
    gi.Event.emit('setLanguage', this.language);
  }

  /** 获取当前语言 */
  getLanguage() {
    return this.language;
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
