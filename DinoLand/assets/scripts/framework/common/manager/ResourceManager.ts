import { Asset, assetManager, AssetManager, Node, SpriteAtlas, SpriteFrame } from 'cc';
import { AsyncQueue } from '../queue/AsyncQueue';
import { NextFunction } from '../../types';
import { DECLARE_TASK, PRELOAD_TASK } from '../../App';

/** 全局资源管理器 */
export class ResourceManager {
  /** 管理的所有资源包 */
  public bundles: Map<string, AssetManager.Bundle> = new Map([]);

  constructor() {
    // 如果项目存在资源包resources则将其统一管理起来
    const bundle: AssetManager.Bundle = assetManager.bundles.get('resources');
    if (bundle) this.bundles.set('resources', bundle);
  }

  /**
   * 预加载接口
   * @param declareResPaths 资源包名称数组
   * @param preLoadResPath （可选）需要加载的资源包
   * @param callback 回调函数
   * @param thisObj 回调对象
   */
  preLoad(declareResPaths: string[], preLoadResPath?: string, callback?: Function, thisObj?: any) {
    /** 需要加载的资源包 */
    let declarePaths = [];

    /** 除了默认资源包resources之外 */
    for (let i = 0; i < declareResPaths.length; i++) {
      let path = declareResPaths[i];
      if (path != 'resources') {
        declarePaths.push(path);
      }
    }

    let queue: AsyncQueue = new AsyncQueue();

    // 通过异步队列控制器执行所有加载资源包的任务，并反映到加载进度条
    for (let i = 0; i < declarePaths.length; i++) {
      queue.push((next: NextFunction, params: any, args: any) => {
        DECLARE_TASK(next, params, args);
      }, declarePaths[i]);
    }

    // 通过异步队列控制器执行资源预加载的任务，并反映到加载进度条
    if (preLoadResPath && preLoadResPath.length > 0) {
      queue.push((next: NextFunction, params: any, args: any) => {
        PRELOAD_TASK(next, params, args);
      }, preLoadResPath);
    }

    queue.complete = () => {
      if (callback) callback.call(thisObj);
    };

    queue.start();
  }

  /**
   * 加载资源包
   * @param name 资源包名称
   * @param callback 加载完成的回调函数
   * @param thisObj 回调函数的this值
   */
  loadBundle(name: string, callback?: Function, thisObj?: any) {
    assetManager.loadBundle(name, (err: Error, bundle: AssetManager.Bundle) => {
      if (!err && bundle) {
        this.bundles.set(bundle.name, bundle);
      }
      if (callback) callback.call(thisObj);
    });
  }

  /**
   * 加载单个资源
   * @param resPath 资源全路径  eg:loadRes("resources/xxxxx")
   * @param callback 加载完成的回调函数
   * @param thisObj 回调函数this值
   */
  loadRes(resPath: string, callback?: (asset: Asset) => void, thisObj?: any) {
    this.getRes(resPath, true, callback, thisObj);
  }

  /**
   * 获取指定资源Asset
   * @param resPath 资源全路径  eg:loadRes("resources/xxxxx")
   * @param loadIfNotFind 如果资源不存在，是否加载
   * @param callback 加载完成的回调函数
   * @param thisObj 回调函数this值
   * @returns Asset
   */
  getRes(resPath: string, loadIfNotFind?: boolean, callback?: (asset: Asset) => void, thisObj?: any): Asset {
    const pos = resPath.indexOf('/');
    if (pos < 0) {
      console.error('资源路径错误，请指定完整的资源路径', resPath);
      if (callback) callback.call(thisObj, null);
      return null;
    }
    /** 资源包名 */
    const name = resPath.substring(0, pos);
    /** 指定资源相对于包的路径 */
    const path = resPath.substring(pos + 1);

    /** 指定资源所在的资源包 */
    const bundle = this.bundles.get(name);
    if (null == bundle) {
      console.error('找不到' + name + '资源包, 请检查资源路径', resPath);

      if (callback) callback.call(thisObj, null);
      return null;
    }

    /** 指定资源 */
    const asset = bundle.get(path);

    if (null == asset && loadIfNotFind) {
      bundle.load(path, (err: Error, res: Asset) => {
        if (err) console.log(err.message);
        if (null == res) console.warn('资源' + resPath + '加载失败');
        else if (!res.isValid) console.warn('资源' + resPath + '不可用, 请检查');
        if (callback) callback.call(thisObj, res);
      });
    } else {
      if (null == asset) console.warn('资源' + resPath + '未加载');
      else if (!asset.isValid) console.warn('资源' + resPath + '不可用, 此资源可能被外部使用不当导致删除');
      if (callback) callback.call(thisObj, asset);
    }

    return asset;
  }

  /**
   * 从指定bundle图集中取得 SpriteFrame
   */
  getSpriteFrameFromAtlas(resPath: string, spriteName: string): SpriteFrame {
    const pos = resPath.indexOf('/');
    if (pos < 0) {
      console.error('资源路径错误，请指定完整的资源路径', resPath);
      return null;
    }

    const name = resPath.substring(0, pos);
    const path = resPath.substring(pos + 1);

    const bundle = assetManager.getBundle(name);
    const spriteAtlas = bundle.get(path, SpriteAtlas);

    if (null == spriteAtlas) return null;

    return spriteAtlas.getSpriteFrame(spriteName);
  }

  /**
   * 释放指定的资源
   * @param resPath 资源全路径  eg:loadRes("resources/xxxxx")
   */
  releaseRes(resPath: string) {
    const pos = resPath.indexOf('/');
    if (pos < 0) return;
    const name = resPath.substring(0, pos);
    const path = resPath.substring(pos + 1);
    const bundle = this.bundles.get(name);
    if (bundle) bundle.release(path);
  }
}
