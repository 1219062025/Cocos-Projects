import InstanceBase from "./common/InstanceBase";

/** 全局资源加载管理 */
class ResourceManager extends InstanceBase {
  /** 资源缓存映射，refCount为引用计数，每次加载该资源都会加一 */
  private _assetMap = new Map<string, { asset: cc.Asset; refCount: number }>();
  /** 加载队列 */
  private _loadQueue: Promise<any>[] = [];
  /** 最大同时加载数 */
  private _maxConcurrentLoads = 5;

  constructor() {
    super();
  }

  /**
   * 加载单个资源
   * @param path 资源路径
   * @param type 资源类型
   * @param onProgress 进度回调
   */
  public async loadRes<T extends cc.Asset>(
    path: string,
    type: typeof cc.Asset,
    onProgress?: (completedCount: number, totalCount: number) => void
  ): Promise<T> {
    return this._enqueue(() => this._loadRes(path, type, onProgress));
  }

  /**
   * 批量加载资源
   * @param resources 资源路径和类型的数组
   * @param onProgress 可选的总进度回调
   * @returns Promise<Map<string, cc.Asset>>
   */
  public async loadMultipleRes(
    resources: { path: string; type: typeof cc.Asset }[],
    onProgress?: (completedCount: number, totalCount: number) => void
  ): Promise<Map<string, cc.Asset>> {
    const total = resources.length;
    let completed = 0;

    const promises = resources.map((res) =>
      this.loadRes(res.path, res.type, () => {
        // 资源完成时更新总进度
        completed++;
        onProgress && onProgress(completed, total);
      }).then((asset) => [res.path, asset])
    );

    const results = await Promise.all(promises);
    return new Map(results as [string, cc.Asset][]);
  }

  /**
   * 释放资源，只有在资源引用计数为0时释放
   * @param path 资源路径
   */
  public releaseRes(path: string): void {
    if (this._assetMap.has(path)) {
      const resource = this._assetMap.get(path)!;
      resource.refCount--;
      if (resource.refCount <= 0) {
        cc.loader.release(resource.asset);
        this._assetMap.delete(path);
      }
    }
  }

  /** 清空所有资源缓存 */
  public clearAllRes(): void {
    this._assetMap.forEach((resource, path) => {
      cc.loader.release(resource.asset);
    });
    this._assetMap.clear();
  }

  /** 判断资源是否已加载 */
  public isLoaded(path: string) {
    return this._assetMap.has(path);
  }

  /** 异步队列加载 */
  private async _enqueue<T>(promiseFn: () => Promise<T>): Promise<T> {
    while (this._loadQueue.length >= this._maxConcurrentLoads) {
      await Promise.race(this._loadQueue); // 等待队列中任意一个加载完成
    }

    const promise = promiseFn();
    this._loadQueue.push(promise);

    promise
      .then(() => {
        this._loadQueue = this._loadQueue.filter((p) => p !== promise);
      })
      .catch(() => {
        this._loadQueue = this._loadQueue.filter((p) => p !== promise);
      });

    return promise;
  }

  /** 核心，加载逻辑 */
  private async _loadRes<T extends cc.Asset>(
    path: string,
    type: typeof cc.Asset,
    onProgress?: (completedCount: number, totalCount: number) => void
  ): Promise<T> {
    // 检查缓存中是否有已加载的资源
    if (this._assetMap.has(path)) {
      const resource = this._assetMap.get(path)!;
      resource.refCount++;
      return resource.asset as T;
    }

    return new Promise<T>((resolve, reject) => {
      cc.loader.loadRes(
        path,
        type,
        (completedCount, totalCount) => {
          // 调用外部传入的进度回调
          onProgress && onProgress(completedCount, totalCount);
        },
        (err, res: T) => {
          if (err) {
            reject(err);
          } else {
            this._assetMap.set(path, { asset: res, refCount: 1 });
            resolve(res);
          }
        }
      );
    });
  }
}

export default ResourceManager.instance();
