// // 全局管理的类
// import _AudioManager from "./AudioManager";
// import _DataManager from "./DataManager";
// import _EventManager from "./EventManager";
// import _LayerManager from "./LayerManager";
// import _ResourceManager from "./ResourceManager";
// import _ScreenManager from "./ScreenManager";
// import _StorageManager from "./StorageManager";
// import _UIManager from "./UIManager";

// import * as _Layer from "./types/Layer";

// export namespace gi {
//   /** 全局音频管理 */
//   export const AudioManager = _AudioManager;
//   /** 全局数据管理 */
//   export const DataManager = _DataManager;
//   /** 全局事件管理 */
//   export const EventManager = _EventManager;
//   /** UI层级管理器 */
//   export const LayerManager = _LayerManager;
//   /** 全局资源加载管理 */
//   export const ResourceManager = _ResourceManager;
//   /** 屏幕适配管理 */
//   export const ScreenManager = _ScreenManager;
//   /** 本地存储管理 */
//   export const StorageManager = _StorageManager;
//   /** 全局UI管理 */
//   export const UIManager = _UIManager;

//   /** Layer类型声明 */
//   export const Layer = _Layer;

//   export function starup(options: StartupOptions) {
//     UIManager.init(options.UIManager.root);
//   }

//   interface StartupOptions {
//     UIManager: { root: cc.Node };
//   }
// }
