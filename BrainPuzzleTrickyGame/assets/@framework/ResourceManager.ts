import InstanceBase from "./common/InstanceBase";

/** 全局资源加载管理 */
class ResourceManager extends InstanceBase {
  private _assetMap = new Map<string, cc.Asset>();

  constructor() {
    super();
  }

  /** 加载资源，支持不同类型的资源（如Prefab、Texture、AudioClip等） */
  public async loadRes<T extends cc.Asset>(
    path: string,
    type: any,
    callback: Function = () => {}
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // 检查缓存中是否有已加载的资源
      if (this._assetMap.has(path)) {
        resolve(this._assetMap.get(path) as T);
      }

      cc.loader.loadRes(path, type, (err, res: T) => {
        if (err) {
          callback && callback(err, res);
          reject(err);
        } else {
          callback && callback(null, res);
          this._assetMap.set(path, res);
          resolve(res);
        }
      });
    });
  }
}

export default ResourceManager.instance();
