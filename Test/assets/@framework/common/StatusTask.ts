class StatusTask<CT = void> {
  /**
   * @param isFinish 完成状态
   * @param timeoutConfig 任务超时配置
   */
  constructor(isFinish: boolean, timeoutConfig?: StatusTask_.timeoutConfig<CT>) {
    this._isFinish = isFinish;
    this._timeoutConfig = timeoutConfig;

    if (this._isFinish) {
      this.task = new Promise<void>(resolve => {
        resolve();
      }) as any;
    } else {
      this._reset();
    }
  }

  /** ----------------------------------------------- */

  /** 异步任务，当该promise状态为resolve时意味着任务结束（不论成功还是失败） */
  public task: Promise<CT>;
  /**
   * 完成状态
   * - true：任务结束
   * - false：任务进行中
   */
  public get isFinish(): boolean {
    return this._isFinish;
  }

  /** 完成状态 */
  private _isFinish = false;
  /** 任务完成并且成功时的回调，调用该回调时会用data去resolve异步任务task */
  private _callback: ((data: CT) => void) | null = null;
  /** 任务超时配置 */
  private _timeoutConfig?: StatusTask_.timeoutConfig<CT>;
  /** 超时定时器 */
  private _timer: any;

  /** ----------------------------------------------- */

  /** 完成任务
   * @param isFinish 完成状态
   * @param data isFinish为true时传入的数据，为false时可不传
   */
  finish<T extends false>(isFinish: T): void;
  finish<T extends true>(isFinish: T, data: CT): void;
  finish<T extends true | false>(isFinish: T, data?: CT): void {
    if (this._isFinish === isFinish) return;

    if (isFinish === true) {
      // 任务完成，基于数据data调用回调函数
      this._callback && this._callback(data);
    }
  }

  /** 重置 */
  private _reset(): void {
    this._isFinish = false;
    this.task = new Promise<CT>(resolve => {
      this._callback = (data: CT) => {
        resolve(data);
        this._isFinish = true;
        this._timeoutConfig = null;
      };

      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }
    });

    if (this._timeoutConfig && this._timeoutConfig.timeout !== null) {
      this._timer = setTimeout(() => {
        this._timer = null;
        this.finish(true, this._timeoutConfig.data);
      }, this._timeoutConfig.timeout);
    }
  }
}

export namespace StatusTask_ {
  /** 超时配置 */
  export interface timeoutConfig<T> {
    /** 超时时间 */
    timeout?: number;
    /** 任务完成但是超时（即失败）时的数据，超时后会用data去resolve异步任务task */
    data?: T;
  }
}

export default StatusTask;
