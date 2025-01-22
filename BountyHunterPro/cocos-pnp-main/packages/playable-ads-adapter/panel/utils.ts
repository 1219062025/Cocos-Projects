import { readdirSync } from 'fs-extra';
import { extname } from 'path';

class Utils {
  private static _instance: Utils;

  public static get instance() {
    if (this._instance == null) {
      this._instance = new Utils();
    }

    return this._instance;
  }

  /**
   * 得到文件夹下指定格式文件名称列表(去掉后缀名).
   * @param {string} root 路径
   * @param {string} ext 扩展名
   */
  public getFileNameList(root: string, ext: string) {
    let files = readdirSync(root);
    return files.filter(file => extname(file) === ext).map(file => file.substring(0, file.indexOf('.')));
  }

  /** 根据键值对存储数据 */
  public setStorage(key: string, value: any) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  /** 根据键值对获取数据 */
  public getStorage(key: string) {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : '';
  }

  /** 清空缓存 */
  public clearStorage(key: string) {
    window.localStorage.removeItem(key);
  }
}

export default Utils.instance;
