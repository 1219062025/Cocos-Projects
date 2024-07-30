import Guide from './guide/guide';
import Utils from './utils/utils';
import EventManager from './event/event';
import QuadTree from './quadtree/quadtree';
import QuadNode from './quadtree/quadNode';

class GI {
  /** 当前关卡 */
  private _level = 0;
  /** 当前使用的游戏模式 */
  private _mode: string = '';
  /** 当前使用的出块逻辑 */
  private _logic: string = '';
  /** 对象池映射 */
  private _poolMap: Map<string, cc.NodePool> = new Map([]);
  /** 四叉树映射 */
  private _quadTreeMap: Map<string, QuadTree<unknown>> = new Map([]);

  /** ___DEBUG START___ */
  /** 得分 */
  score = 0;
  /** 操作次数 */
  handleCount = 0;
  /** 全局缩放 */
  scale = 1;
  /** ___DEBUG END___ */

  /** Block的宽度 */
  BLOCKWIDTH = 124;
  // BLOCKWIDTH = 90;
  /** Block的高度 */
  BLOCKHEIGHT = 124;
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

  /** x、y坐标需要传入中点坐标而不是左下角坐标。maxLen代表一个子树所能容纳的最大数据量 */
  createQuadTree<T>(name: string, options: { x: number; y: number; width: number; height: number; maxLen: number; ctx?: cc.Graphics }) {
    try {
      const tree = new QuadTree<T>(options.x, options.y, options.width, options.height, options.maxLen, options.ctx);
      this._quadTreeMap.set(name, tree);
    } catch (err) {
      console.log('创建四叉树出错，错误信息：', err);
    }
  }

  /** 获取四叉树 */
  getQuadTree<T>(name: string) {
    const tree = this._quadTreeMap.get(name) as QuadTree<T>;
    return tree || null;
  }

  /** 四叉树插入节点，x、y坐标传入节点坐标，data传入该节点保存的数据 */
  treeInsert<T>(name: string, options: { x: number; y: number; width: number; height: number; data: T }) {
    const node = new QuadNode<T>(options.x, options.y, options.width, options.height, options.data);
    const tree = this._quadTreeMap.get(name) as QuadTree<T>;
    tree && tree.insert(node);
  }

  /** 四叉树搜索节点，x、y坐标传入节点坐标，返回数据数组 */
  treeSearch<T>(name: string, x: number, y: number) {
    const tree = this._quadTreeMap.get(name) as QuadTree<T>;
    return tree && tree.search(x, y);
  }

  /** 创建对象池 */
  createPool(
    name: string,
    size: number,
    obj: cc.Node | cc.Prefab,
    poolHandlerComp?:
      | string
      | {
          prototype: cc.Component;
        }
  ) {
    try {
      const pool = new cc.NodePool(poolHandlerComp);
      for (let i = 0; i < size; i++) {
        const node = cc.instantiate(obj) as cc.Node;
        pool.put(node);
      }
      this._poolMap.set(name, pool);
    } catch (err) {
      console.log('创建对象池出错，错误信息：', err);
    }
  }

  /** 获取对象池 */
  getPool(name: string) {
    const pool = this._poolMap.get(name);
    return pool || null;
  }

  /** 获取对象池大小 */
  getPoolSize(name: string) {
    const pool = this._poolMap.get(name);
    return pool ? pool.size : 0;
  }

  /** 清空对象池 */
  clearPool(name: string) {
    const pool = this._poolMap.get(name);
    pool && pool.clear();
    return pool ? true : false;
  }

  /** 对象池Put */
  poolPut(name: string, obj: cc.Node) {
    const pool = this._poolMap.get(name);
    pool && pool.put(obj);
  }

  /** 对象池Get */
  poolGet(name: string) {
    const pool = this._poolMap.get(name);
    return pool ? pool.get() : null;
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
    this.setLogic(gi.Logic.EASY);
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

  /** 获取Board中指定行、列格子的位置。坐标系为Board，起始点为左上角 */
  getRanksPos({ row, col }: gi.Ranks): cc.Vec2 {
    const beginX = -gi.MAPWIDTH / 2 + gi.BLOCKWIDTH / 2;
    const beginY = gi.MAPHEIGHT / 2 - gi.BLOCKHEIGHT / 2;
    const targetX = beginX + col * gi.BLOCKWIDTH;
    const targetY = beginY - row * gi.BLOCKHEIGHT;
    return cc.v2(targetX, targetY);
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
_global['gi']['EventManager'] = EventManager;
