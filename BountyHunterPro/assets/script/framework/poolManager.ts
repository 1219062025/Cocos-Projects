import { _decorator, Component, instantiate, Node, NodePool, Prefab } from 'cc';
const { ccclass, property } = _decorator;

/** 全局对象池管理类 */
@ccclass('PoolManager')
export class PoolManager {
  private static _instance: PoolManager;

  public static get instance() {
    if (this._instance) {
      this._instance = new PoolManager();
    }

    return this._instance;
  }

  private _dictPool: Map<string, NodePool> = new Map([]);

  /**
   * 根据预设从对象池中获取对应节点
   * @param prefab 预制体
   * @param parent 预制体需要挂在的父节点
   */
  public getNode(prefab: Prefab, parent: Node) {
    const name = prefab.name;

    let node: Node = null;
    if (this._dictPool.has(name)) {
      // 已有对应的对象池
      const pool = this._dictPool.get(name);

      if (pool.size() > 0) {
        node = pool.get();
      } else {
        node = instantiate(prefab);
      }
    } else {
      // 没有对应对象池时创建
      const pool = new NodePool();
      this._dictPool.set(name, pool);

      node = instantiate(prefab);
    }

    node.parent = parent;
    node.active = true;
    return node;
  }

  /** 将对应节点放回对象池中 */
  public putNode(node: Node) {
    if (!node) {
      return;
    }

    const name = node.name;
    let pool: NodePool = null;

    if (this._dictPool.has(name)) {
      pool = this._dictPool.get(name);
    } else {
      pool = new NodePool();
      this._dictPool.set(name, pool);
    }

    pool.put(node);
  }

  /** 根据名称，清除对应对象池 */
  public clearPool(name: string) {
    if (this._dictPool.has(name)) {
      const pool = this._dictPool.get(name);
      pool.clear();
    }
  }

  /**
   * 预生成对象池
   * @param prefab 预制体
   * @param nodeNum 生成的对象池大小
   */
  public prePool(prefab: Prefab, nodeNum: number) {
    const name = prefab.name;

    let pool = new NodePool();
    this._dictPool.set(name, pool);

    for (let i = 0; i < nodeNum; i++) {
      const node = instantiate(prefab);
      pool.put(node);
    }
  }
}
