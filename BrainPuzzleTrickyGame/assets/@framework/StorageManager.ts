import InstanceBase from "./common/InstanceBase";

/** 存储数据配置项 */
type SetDataOptions = {
  /** 是否加密 */
  encrypt?: boolean;
  /** 过期时间（单位：毫秒） */
  expirationTime?: number;
};

/** 获取数据配置项 */
type GetDataOptions = {
  /** 是否解密 */
  decrypt?: boolean;
};

/** 数据 */
type StorageData = {
  value: any;
  version: string;
  timestamp: number;
  expirationTime: number | null;
};

/** 本地存储管理 */
class StorageManager extends InstanceBase {
  /** localStorage对象 */
  private _storage: Storage;
  /** 数据版本 */
  private _version: string;
  /** 密钥 */
  private _encryptionKey: string;

  constructor() {
    super();
  }

  public init(version: string, encryptionKey: string) {
    this._storage = localStorage;
    this._version = version;
    this._encryptionKey = encryptionKey;
  }

  /**
   * 存储数据
   * @param key 存储的键
   * @param value 存储的值
   * @param options 可选配置项
   */
  public setData(key: string, value: any, options?: SetDataOptions) {
    const data: StorageData = {
      value,
      version: this._version,
      timestamp: Date.now(), // 存储时间
      expirationTime: (options && options.expirationTime) || null, // 如果没有设置过期时间，则不设定
    };

    // 如果需要加密
    if (options && options.encrypt) {
      // data.value = this.encryptData(value);
    }

    // 存储数据
    this._storage.setItem(key, JSON.stringify(data));
  }

  /**
   * 获取数据
   * @param key 存储的键
   * @param options 可选配置项
   * @returns 返回存储的数据或null
   */
  public getData(key?: string, options?: GetDataOptions) {
    const dataStr = this._storage.getItem(key);
    if (!dataStr) return null;

    const data = JSON.parse(dataStr) as StorageData;

    // 检查是否过期
    if (
      data.expirationTime &&
      Date.now() > data.timestamp + data.expirationTime
    ) {
      this.removeData(key); // 删除过期数据
      return null;
    }

    // 如果需要解密
    if (options && options.decrypt && data.value) {
      // data.value = this.decryptData(data.value);
    }

    return data.value;
  }

  public removeData(key: string) {
    this._storage.removeItem(key);
  }

  public hasData(key: string): boolean {
    return this._storage.getItem(key) !== null;
  }
}

export default StorageManager.instance();
