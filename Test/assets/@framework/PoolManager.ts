import InstanceBase from "./common/InstanceBase";

/** 对象池管理 */
class PoolManager extends InstanceBase {
  private _poolMap = new Map<string, cc.NodePool>();

  constructor() {
    super();
  }

  /**
   * 预创建节点池
   * @param prefab 预制体资源
   * @param poolSize 初始化池大小
   */
  public preCreatePool(prefab: cc.Prefab, poolSize: number = 10): void {
    const poolName = prefab.name;

    if (!this._poolMap.has(poolName)) {
      const pool = new cc.NodePool();

      for (let i = 0; i < poolSize; i++) {
        const node = cc.instantiate(prefab);
        pool.put(node);
      }

      this._poolMap.set(poolName, pool);
    }
  }

  /**
   * 从池中获取节点
   * @param prefab 预制体资源
   * @param parentNode 父节点
   * @returns cc.Node 节点
   */
  public getNode(prefab: cc.Prefab, parentNode: cc.Node): cc.Node {
    const poolName = prefab.name;
    let node: cc.Node;

    if (this._poolMap.has(poolName)) {
      const pool = this._poolMap.get(poolName)!;

      if (pool.size() > 0) {
        node = pool.get();
      } else {
        // 当池为空时新建节点
        node = cc.instantiate(prefab);
      }
    } else {
      const pool = new cc.NodePool();
      this._poolMap.set(poolName, pool);
      node = cc.instantiate(prefab);
    }

    node.parent = parentNode;
    node.active = true;
    return node;
  }

  /**
   * 回收节点到池中
   * @param node 要回收的节点
   */
  public putNode(node: cc.Node): void {
    const poolName = node.name;

    if (this._poolMap.has(poolName)) {
      this._poolMap.get(poolName)!.put(node);
    } else {
      const pool = new cc.NodePool();
      pool.put(node);
      this._poolMap.set(poolName, pool);
    }
  }

  /**
   * 清空特定类型的池
   * @param poolName 节点池名称
   */
  public clearPool(poolName: string): void {
    if (this._poolMap.has(poolName)) {
      this._poolMap.get(poolName)!.clear();
      this._poolMap.delete(poolName);
    }
  }

  /**
   * 清空所有节点池
   */
  public clearAllPools(): void {
    this._poolMap.forEach((pool) => pool.clear());
    this._poolMap.clear();
  }
}

export default PoolManager.instance();
