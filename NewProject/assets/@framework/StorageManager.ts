import InstanceBase from "./common/InstanceBase";

/** 本地存储管理 */
class StorageManager extends InstanceBase {
  /** localStorage对象 */
  private _storage: Storage;
  /** 默认数据版本 */
  private _defaultVersion: string = "1.0";
  /** 默认密钥 */
  private _defaultEncryptionKey: string = "defaultEncryptionKey";

  constructor() {
    super();

    this._storage = localStorage;
  }

  public init() {}

  /**
   * 存储数据
   * @param key 存储的键
   * @param value 存储的值
   * @param options 可选配置项（过期时间、加密、版本等）
   */
  public setData(key: string, value: any, options?: StorageOptions) {
    const data: any = {
      value,
      version: (options && options.version) || this._defaultVersion,
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
}

/** 存储配置项 */
type StorageOptions = {
  /** 是否加密 */
  encrypt?: boolean;
  /** 加密密钥 */
  encryptionKey?: string;
  /** 数据版本 */
  version?: string;
  /** 过期时间（单位：毫秒） */
  expirationTime?: number;
};

export default StorageManager.instance();
