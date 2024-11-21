// 全局管理的类
import _AudioManager from "./AudioManager";
import _DataManager from "./DataManager";
import _EventManager from "./EventManager";
import _I18nManager from "./I18nManager";
import _LayerManager from "./LayerManager";
import _PoolManager from "./PoolManager";
import _ResourceManager from "./ResourceManager";
import _ScreenManager from "./ScreenManager";
import _StorageManager from "./StorageManager";
import _UIManager from "./UIManager";

import * as _Layer from "./types/Layer";

export namespace gi {
  /** 全局音频管理 */
  export const AudioManager = _AudioManager;
  /** 全局数据管理 */
  export const DataManager = _DataManager;
  /** 全局事件管理 */
  export const EventManager = _EventManager;
  /** 多语言适配管理 */
  export const I18nManager = _I18nManager;
  /** UI层级管理器 */
  export const LayerManager = _LayerManager;
  /** 对象池管理 */
  export const PoolManager = _PoolManager;
  /** 全局资源加载管理 */
  export const ResourceManager = _ResourceManager;
  /** 屏幕适配管理 */
  export const ScreenManager = _ScreenManager;
  /** 本地存储管理 */
  export const StorageManager = _StorageManager;
  /** 全局UI管理 */
  export const UIManager = _UIManager;

  /** Layer类型声明 */
  export const Layer = _Layer;

  /** 以自定义配置启动框架 */
  export function starup(options?: StartupOptions) {
    const root =
      (options && options.UIManager && options.UIManager.root) ||
      cc.Canvas.instance.node;
    UIManager.init(root); // UI管理器初始化

    const version =
      (options && options.StorageManager && options.StorageManager.version) ||
      "1.0";
    const encryptionKey =
      (options &&
        options.StorageManager &&
        options.StorageManager.encryptionKey) ||
      "defaultEncryptionKey";
    StorageManager.init(version, encryptionKey); // 本地存储管理器初始化

    const basePath =
      options && options.I18nManager && options.I18nManager.basePath;
    I18nManager.init(basePath); // 多语言适配管理初始化

    AudioManager.init(); // 音频管理器初始化

    ScreenManager.init(); // 屏幕适配管理初始化
  }

  interface StartupOptions {
    UIManager?: { root: cc.Node };
    StorageManager?: { version?: string; encryptionKey?: string };
    I18nManager?: { basePath?: string };
  }
}
