const { ccclass, property } = cc._decorator;

@ccclass
export default class Pool {
  /** 对象池映射 */
  private static _poolMap: Map<string, cc.NodePool> = new Map([]);

  /** 创建对象池 */
  static createPool(
    name: string,
    size: number,
    obj: cc.Node | cc.Prefab,
    poolHandlerComp?:
      | string
      | {
          prototype: cc.Component;
        }
  ) {
    try {
      const pool = new cc.NodePool(poolHandlerComp);
      for (let i = 0; i < size; i++) {
        const node = cc.instantiate(obj) as cc.Node;
        pool.put(node);
      }
      this._poolMap.set(name, pool);
    } catch (err) {
      console.log('创建对象池出错，错误信息：', err);
    }
  }

  /** 获取对象池 */
  static getPool(name: string) {
    const pool = this._poolMap.get(name);
    return pool || null;
  }

  /** 获取对象池大小 */
  static getPoolSize(name: string) {
    const pool = this._poolMap.get(name);
    return pool ? pool.size() : 0;
  }

  /** 清空对象池 */
  static clearPool(name: string) {
    const pool = this._poolMap.get(name);
    pool && pool.clear();
    return pool ? true : false;
  }

  /** 对象池Put */
  static poolPut(name: string, obj: cc.Node) {
    const pool = this._poolMap.get(name);
    pool && pool.put(obj);
  }

  /** 对象池Get */
  static poolGet(name: string) {
    const pool = this._poolMap.get(name);
    return pool ? pool.get() : null;
  }
}
