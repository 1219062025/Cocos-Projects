import Guide from './guide/guide';
import Utils from './utils/utils';
import Event from './event/event';
import QuadTree from './quadtree/quadtree';
import Pool from './pool/pool';

class GI {
  /** 当前关卡 */
  private _level = 0;
  /** 当前使用的游戏模式 */
  private _mode: string = '';

  /** ___DEBUG START___ */
  /** 得分 */
  score = 0;
  /** 全局缩放 */
  scale = 1;
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
    this._level = value;
  }

  /** 获取当前关卡 */
  getLevel() {
    return this._level;
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
