import Utils from './utils/utils';
import Guide from './guide/guide';
import Event from './event/event';
import QuadTree from './quadtree/quadtree';
import Pool from './pool/pool';
import Swipe from './swipe/swipe';

class GI {
  /** 当前关卡 */
  private _level = 0;
  /** 当前使用的游戏模式 */
  private _mode: string = '';
  /** 游戏是否结束了 */
  private _isEnd: boolean = false;

  /** 此时页面是否可以操作 */
  _isClick: boolean = true;
  _BlockLayer: cc.Node = null;

  get isClick() {
    return this._isClick;
  }
  set isClick(value: boolean) {
    if (value === false && this._isClick !== false) {
      if (!this._BlockLayer) {
        this._BlockLayer = new cc.Node('BlockLayer');
        const widget = this._BlockLayer.addComponent(cc.Widget);
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.left = 0;
        widget.right = 0;
        widget.top = 0;
        widget.bottom = 0;
        this._BlockLayer.addComponent(cc.BlockInputEvents);
        this._BlockLayer.setParent(cc.Canvas.instance.node);
        this._BlockLayer.setSiblingIndex(-1);
      }
      this._BlockLayer.active = true;
    } else if (value === true && this._isClick !== true) {
      this._BlockLayer.active = false;
    }
    this._isClick = value;
  }

  /** 得分 */
  score = 0;
  /** 扣分 */
  deductScore = 0;
  /** 全局缩放 */
  scale = 1;
  /** 当前语言缩写 */
  language = '';
  /** 当前关卡已经完成了的动作的key */
  finishedActionKeys: Set<string> = new Set([]);
  initSubcribed: boolean = false;

  /** 记录指定动作已完成 */
  completedAction(key: string) {
    this.finishedActionKeys.add(key);
    gi.Event.emit('completedAction');
  }

  /** 设置游戏结束 */
  end() {
    this._isEnd = true;
  }

  /** 获取游戏是否结束了 */
  isEnd() {
    return this._isEnd;
  }

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
_global['gi']['Swipe'] = Swipe;
