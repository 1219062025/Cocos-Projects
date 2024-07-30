import { AsyncTask, AsyncCallback, NextFunction } from '../../types';

/** 异步队列控制器 */
export class AsyncQueue {
  /** 任务task的唯一标识，每次创建一个任务都会进行递增 */
  private static _$uuid_count: number = 1;

  /** 正在运行的任务 */
  private _runningAsyncTask: AsyncTask | null = null;

  private _queues: Array<AsyncTask> = [];
  /** 当前所有异步任务 */
  public get queues(): Array<AsyncTask> {
    return this._queues;
  }

  /** 任务队列完成回调 */
  public complete: Function | null = null;

  private _enable: boolean = true;
  /** 是否开启可用 */
  public get enable() {
    return this._enable;
  }
  public set enable(val: boolean) {
    if (this._enable === val) {
      return;
    }
    this._enable = val;
    if (val && this.size > 0) {
      this.start();
    }
  }

  /** 队列长度 */
  public get size(): number {
    return this._queues.length;
  }

  /** 是否有正在处理的任务 */
  public get isProcessing(): boolean {
    return this._runningAsyncTask !== null;
  }

  /** 队列是否已停止 */
  public get isStop(): boolean {
    if (this._queues.length > 0) {
      return false;
    }
    if (this.isProcessing) {
      return false;
    }
    return true;
  }

  /** 正在执行的任务参数 */
  public get runningParams(): any {
    if (this._runningAsyncTask) {
      return this._runningAsyncTask.params;
    }
    return null;
  }

  /** 开始运行队列 */
  public start(args: any = null) {
    if (this.isProcessing) return;
    if (!this._enable) return;

    /** 当前执行的任务 */
    let task: AsyncTask = this._queues.shift()!;

    if (task) {
      this._runningAsyncTask = task;

      if (task.callbacks.length == 1) {
        // 只有一个任务回调单独执行

        const callbacks = task.callbacks[0];
        // 运行下一个任务
        const nextFunc: NextFunction = (nextArgs: any = null) => {
          this.next(task.uuid, nextArgs);
        };
        callbacks(nextFunc, task.params, args);
      } else {
        // 多个任务回调同时执行

        const nextArgsArr: any[] = [];
        let count = task.callbacks.length;

        // 直到该任务的所有回调都执行完后运行下一个任务
        const nextFunc: NextFunction = (nextArgs: any = null) => {
          nextArgsArr.push(nextArgs);

          if (--count === 0) {
            this.next(task.uuid, nextArgs);
          }
        };

        // 执行
        for (let i = 0; i < task.callbacks.length; i++) {
          const callbacks = task.callbacks[i];
          callbacks(nextFunc, task.params, args);
        }
      }
    } else {
      this._runningAsyncTask = null;
      if (this.complete) {
        this.complete(args);
      }
    }
  }

  /** push一个异步任务到队列中，返回任务uuid */
  public push(callback: AsyncCallback, params: any = null): number {
    let uuid = AsyncQueue._$uuid_count++;
    this._queues.push({
      uuid: uuid,
      callbacks: [callback],
      params: params
    });
    return uuid;
  }

  /** push多个任务，多个任务函数会同时执行，返回任务uuid */
  public pushMulti(params: any, ...callbacks: AsyncCallback[]): number {
    let uuid = AsyncQueue._$uuid_count++;
    this._queues.push({
      uuid: uuid,
      callbacks: callbacks,
      params: params
    });
    return uuid;
  }

  /** 移除一个还未执行的异步任务 */
  public remove(uuid: number) {
    if (this._runningAsyncTask && this._runningAsyncTask.uuid === uuid) {
      console.warn('正在执行的任务不可以移除');
      return;
    }
    for (let i = 0; i < this._queues.length; i++) {
      if (this._queues[i].uuid === uuid) {
        this._queues.splice(i, 1);
        break;
      }
    }
  }

  /** 清空队列 */
  public clear() {
    this._queues = [];
    this._runningAsyncTask = null;
  }

  /** 执行队列中下一个异步任务 */
  protected next(taskUUID: number, args: any = null) {
    if (this._runningAsyncTask.uuid === taskUUID) {
      this._runningAsyncTask = null;
      this.start(args);
    }
  }

  /** 跳过当前正在执行的任务 */
  public step() {
    if (this.isProcessing) {
      this.next(this._runningAsyncTask.uuid);
    }
  }

  /**
   * 【比较常用，所以单独提出来封装】往队列中push一个延时任务
   * @param time 毫秒时间
   * @param callback （可选参数）时间到了之后回调
   */
  public yieldTime(time: number, callback: Function | null = null) {
    let task = function (next: Function, params: any, args: any) {
      let _t = setTimeout(() => {
        clearTimeout(_t);
        if (callback) {
          callback();
        }
        next(args);
      }, time);
    };
    this.push(task, { des: 'AsyncQueue.yieldTime' });
  }

  /**
   * 返回一个执行函数，执行函数调用count次后，next将触发
   * @param count
   * @param next
   * @return 返回一个匿名函数
   */
  public static excuteTimes(count: number, next: Function | null = null): Function {
    let fnum: number = count;
    let tempCall = () => {
      --fnum;
      if (fnum === 0) {
        next && next();
      }
    };
    return tempCall;
  }
}
