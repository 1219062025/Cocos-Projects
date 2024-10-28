import { _decorator, Component, log, native, Node, sys } from 'cc';
import { Util } from './util';
const { ccclass, property } = _decorator;

/** 全局本地存储类 */
@ccclass('StorageManager')
export class StorageManager {
  private static _instance: StorageManager;

  /** 全局本地存储单例 */
  public static get instance() {
    if (!this._instance) {
      this._instance = new StorageManager();
      this._instance.init();
    }

    return this._instance;
  }

  /** 本地存储的JSON数据 */
  private _jsonData: { [key: string]: any } = { 'userId': '' };
  /** 配置文件路径 */
  private _path: string = '';
  /** 本地存储key值 */
  private KEY_CONFIG: string = 'BountyHunterPro';

  init() {
    this._path = this._getConfigPath();

    let content: any;
    if (sys.isNative) {
      var valueObject = native.fileUtils.getValueMapFromFile(this._path);
      content = valueObject[this.KEY_CONFIG];
    } else {
      content = sys.localStorage.getItem(this.KEY_CONFIG);
    }

    if (content && content.length) {
      if (content.startsWith('@')) {
        content = content.substring(1);
        content = Util.decrypt(content);
      }

      try {
        log('本地存储content', JSON.parse(content));
        // !!!!!!!载入本地存储的JSON数据!!!!!!!
        this._jsonData = JSON.parse(content);
      } catch (excepaiton) {}
    }
  }

  /**
   * 根据关键字读取配置文件中对应的数据
   * @param {string} key 关键字
   * @returns
   */
  getConfigData(key: any) {
    const userId = this.getUserId();
    if (this._jsonData[userId]) {
      const value = this._jsonData[userId][key];
      return value || '';
    } else {
      log(`id为“${userId}”的用户不存在`);
      return '';
    }
  }

  /**
   * 存储数据到对应key的数据中
   * @param {string} key  关键字
   * @param {any} value  存储值
   */
  setConfigData(key: any, value: any) {
    const userId = this.getUserId();
    if (this._jsonData[userId]) {
      this._jsonData[userId][key] = value;
    } else {
      log(`id为“${userId}”的用户不存在`);
      return;
    }

    this.save();
  }

  /**
   * 设置用户唯一标示符
   * @param {string}value  存储值
   */
  public setUserId(value: string) {
    this._jsonData.userId = value;
    if (!this._jsonData[value]) {
      this._jsonData[value] = {};
    }

    this.save();
  }

  /** 获取用户唯一标识 */
  public getUserId() {
    return this._jsonData.userId;
  }

  /**
   * 设置全局数据
   * @param {string} key 关键字
   * @param {any} value  存储值
   * @returns
   */
  public setGlobalData(key: string, value: any) {
    this._jsonData[key] = value;
    this.save();
  }

  /**
   * 获取全局数据
   * @param {string} key 关键字
   * @returns
   */
  public getGlobalData(key: string) {
    return this._jsonData[key];
  }

  /** 保存当前配置文件到本地存储 */
  public save() {
    // JSON化
    const str = JSON.stringify(this._jsonData);
    // 数据加密
    const zipStr = '@' + Util.encrypt(str);

    if (!sys.isNative) {
      var ls = sys.localStorage;
      ls.setItem(this.KEY_CONFIG, zipStr);
      return;
    }

    // 原生平台存储
    var valueObj: any = {};
    valueObj[this.KEY_CONFIG] = zipStr;
    native.fileUtils.writeValueMapToFile(valueObj, this._path);
  }

  /**
   * 根据不同平台获取配置文件路径
   * @returns 配置文件路径
   */
  private _getConfigPath() {
    let platform: any = sys.platform;

    let path: string = '';

    if (platform === sys.OS.WINDOWS) {
      path = 'src/conf';
    } else if (platform === sys.OS.LINUX) {
      path = './conf';
    } else {
      if (sys.isNative) {
        path = native.fileUtils.getWritablePath();
        path = path + 'conf';
      } else {
        path = 'src/conf';
      }
    }

    return path;
  }
}
