import { _decorator, Component, error, Node, Prefab, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResourceUtil')
export class ResourceUtil {
  /**
   * 加载资源
   * @param url   资源路径
   * @param type  资源类型
   * @param cb    回调
   * @method loadRes
   */
  public static loadRes(url: string, type: any, cb?: Function) {
    resources.load(url, type, (err: Error, res: any) => {
      if (err) {
        error(err.message || err);
        cb(err, res);
        return;
      }

      cb && cb(null, res);
      return;
    });
  }

  /**
   * 加载资源
   * @param url 资源路径
   * @param type  资源类型
   */
  public static loadResPromise(url: string, type: any) {
    return new Promise((resolve, reject) => {
      resources.load(url, type, (err: Error, res: any) => {
        if (err) {
          error(err.message || err);
          reject && reject(err);
          return;
        }

        resolve && resolve(res);
      });
    });
  }

  /**
   * 获取UI prefab
   * @param prefabPath prefab路径
   * @param cb 回调函数
   */
  public static getUIPrefabRes(prefabPath: string, cb?: Function) {
    this.loadRes('prefab/ui/' + prefabPath, Prefab, cb);
  }

  public static createUI(path: string, cb?: Function, isTip?: boolean) {
    this.getUIPrefabRes(path, (err: Error, prefab: Prefab) => {
      if (err) return error(err.message || err);
    });
  }
}
