import { _decorator, Asset, assetManager, AssetManager, Component, Node } from 'cc';
import { Root } from './Root';
import { AppConfig } from './AppConfig';
import { Message } from './common/event/MessageManager';
import { EventDispatcher } from './common/event/EventDispatcher';
import { TimerManager } from './common/manager/TimerManager';
import { NextFunction } from './types';
import { ResourceManager } from './common/manager/ResourceManager';
import { AudioManager } from './common/audio/AudioManager';

const { ccclass, property } = _decorator;

/** 框架类，控制整个游戏框架的启动初始化。核心 */
@ccclass('App')
export class App extends Component {
  /** 全局时间管理器实例 */
  static timer: TimerManager;
  /** 全局资源管理器实例 */
  static resMgr: ResourceManager;
  /** 全局音频管理器实例 */
  static audio: AudioManager;

  /** 框架配置信息 */
  static config: AppConfig;

  /**
   * 框架启动
   *
   * @param {Root} root 根组件
   * @param {AppConfig} config 项目配置信息
   * @param {?Function} [callback] 框架启动后回调
   * @param {?*} [thisObj] 调用对象
   */
  static startup(root: Root, config: AppConfig, callback?: Function, thisObj?: any) {
    App.config = config;
    App.timer = new TimerManager(root);
    App.resMgr = new ResourceManager();
    App.audio = AudioManager.instance;
  }
}

/** 加载资源包任务 */
export function DECLARE_TASK(next: NextFunction, params: any, args: any) {
  // App.showProcessBar(App.resMgr.bundles.size, 100, '正在下载资源包,请稍候...');
  assetManager.loadBundle(params, (err: Error, bundle: AssetManager.Bundle) => {
    if (!err && bundle) {
      App.resMgr.bundles.set(bundle.name, bundle);
    }
    next(args);
  });
}

/** 预加载某个资源包的所有资源任务 */
export function PRELOAD_TASK(next: NextFunction, params: any, args: any) {
  let bundle: AssetManager.Bundle = App.resMgr.bundles.get(params);
  bundle.loadDir(
    '/',
    (finished: number, total: number, item: AssetManager.RequestItem) => {
      // App.showProcessBar(finished, total);
    },
    (err: Error, assets: Asset[]) => {
      if (err) {
        console.error('PRELOAD_TASK', err.message);
      }
      next(args);
    }
  );
}
