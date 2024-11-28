import InstanceBase from "./common/InstanceBase";
import LayerManager from "./LayerManager";
import { LayerType } from "./types/Layer";
import EventManager from "./EventManager";
import ResourceManager from "./ResourceManager";

/** 全局UI管理 */
class UIManager extends InstanceBase {
  /** 已经注册了的UI */
  private _uiMap = new Map<string, cc.Node>();
  /** 已经注册了的UI信息 */
  private _uiRegistryMap = new Map<string, RegisterInfo>();
  /** 挂载节点 */
  private _root: cc.Node;

  constructor() {
    super();
  }

  /** 设置UI挂载节点，默认为Canvas */
  public init(root: cc.Node) {
    this._root = root;
    LayerManager.init(root);
  }

  /** 注册UI，未经注册的UI无法使用 */
  public register(key: string, path: string, options?: RegisterOptions) {
    this._uiRegistryMap.set(key, {
      path,
      layer: options && options.layer ? options.layer : LayerType.Main,
    });
  }

  /** 显示指定UI */
  public async show(key: string, options?: ShowOptions) {
    let element = this._uiMap.get(key);
    /** 要显示的UI的注册信息 */
    let registryInfo: RegisterInfo;

    if (!element) {
      // 判断该UI是否预先进行了注册
      registryInfo = this._uiRegistryMap.get(key);
      if (!registryInfo) {
        console.warn(`UI ${key} 未注册路径`);
        return;
      }

      // 加载UI预制体
      const uiPreFab = await this.loadUIPrefab(registryInfo.path);
      element = cc.instantiate(uiPreFab);
      this._uiMap.set(key, element);

      // 将UI添加到注册的Layer层
      LayerManager.getLayer(registryInfo.layer).addChild(element);
    }

    element.active = true;

    options && options.callback && options.callback(element, registryInfo);

    EventManager.emit(`showUI_${key}`, registryInfo);
  }

  /** 隐藏指定UI */
  public hide(key: string, options?: HideOptions) {
    let element = this._uiMap.get(key);

    if (element) {
      element.active = false;

      options && options.callback && options.callback();

      const registryInfo = this._uiRegistryMap.get(key);
      EventManager.emit(`hideUI_${key}`, registryInfo);
    }
  }

  /** 根据路径加载UI预制体 */
  private loadUIPrefab(url: string): Promise<cc.Prefab> {
    return ResourceManager.loadRes<cc.Prefab>(url, cc.Prefab);
  }
}

/** UI注册信息 */
type RegisterInfo = {
  /** UI预制体路径 */
  path: string;
  /** UI显示在哪个层 */
  layer: LayerType;
};

/** 显示UI时的配置 */
type ShowOptions = {
  /** 回调函数 */
  callback?: Function;
};

/** 隐藏UI时的配置 */
type HideOptions = {
  /** 回调函数 */
  callback?: Function;
};

/** 注册UI时的配置 */
type RegisterOptions = {
  /** UI显示在哪个层 */
  layer: LayerType;
};

export default UIManager.instance();
