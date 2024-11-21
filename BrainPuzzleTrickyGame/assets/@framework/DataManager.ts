import InstanceBase from "./common/InstanceBase";
import EventManager from "./EventManager";

/** 数据模块 */
interface DataModule {
  /** 保存数据 */
  save(): any;
  /** 加载数据 */
  load(data: any): void;
}

/** 本地存储key值 */
const DataSecretkey = "_Data_";

/** 全局数据管理 */
class DataManager extends InstanceBase {
  /** 已注册的数据模块 */
  private _moduleMap = new Map<string, DataModule>();

  constructor() {
    super();
  }

  public register(key: string, module: DataModule) {
    if (this._moduleMap.has(key)) {
      console.warn(`DataModule ${key} is already registered.`);
      return;
    }

    this._moduleMap.set(key, module);

    EventManager.on(`${key}:updated`, () => {
      // 任何模块数据更新后，都保存所有数据
      this.saveAllData();
    });
  }

  /** 获取数据模块 */
  public getModule<T extends DataModule>(key: string): T | null {
    if (!this._moduleMap.has(key)) {
      console.warn(`DataModule ${key} does not exist`);
    }
    return (this._moduleMap.get(key) as T) || null;
  }

  /** 保存所有数据 */
  public saveAllData() {
    const data: { [key: string]: any } = {};
    this._moduleMap.forEach((module, key) => {
      data[key] = module.save();
    });
    cc.sys.localStorage.setItem(DataSecretkey, JSON.stringify(data));
  }

  /** 加载所有模块数据 */
  public loadAllData() {
    const dataStr = cc.sys.localStorage.getItem(DataSecretkey);
    if (dataStr) {
      const data = JSON.parse(dataStr);
      this._moduleMap.forEach((module, key) => {
        if (data[key]) {
          module.load(data[key]);
        }
      });
    }
  }
}

export default DataManager.instance();
