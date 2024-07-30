import { Component, macro } from 'cc';
import { EventDispatcher } from '../event/EventDispatcher';
import { StringUtil } from '../../utils/StringUtil';

/** 倒计时对象 */
export class TimedObject {
  /** id */
  public id: string;
  /** 该倒计时对象的管理对象 */
  public object?: any;
  /** 时间字段，秒、毫秒之类的 */
  public field?: any;
  /** 倒计时经过每次时间字段时需要触发的事件回调函数 */
  public onSecond?: Function;
  /** 倒计时完成需要触发的回调函数 */
  public onComplete?: Function;
  /** 倒计时完成需要通知触发的事件名称 */
  public event?: string;

  constructor(id: string) {
    this.id = id;
  }
}

/** 全局时间管理器 */
export class TimerManager extends EventDispatcher {
  /** 所有倒计时对象的映射 */
  private _times: Map<string, TimedObject> = new Map([]);

  /** 当前管理的所有定时器 */
  private _schedules: Map<string, Function> = new Map([]);
  // private _scheduleCount: number = 1;

  /** 当前游戏进入的时间毫秒值 */
  private _initTime: number = new Date().getTime();

  /** 时间管理器绑定的组件 */
  private _component: Component;

  /** 服务器时间与本地时间间隔 */
  private _$serverTimeElasped: number = 0;

  /**
   * 初始化全局时间管理器，传入管理器需要挂载的组件，一般为根组件
   *
   * @param {Component} _component 管理器绑定的组件
   */
  constructor(component: Component) {
    // 继承事件对象基类，现在时间管理器具有了派发事件的能力
    super();
    // 绑定组件
    this._component = component;
  }

  /**
   * 封装cc内部的schedule方法
   * 使用定时器系统调度一个自定义的回调任务。 如果回调任务已调度，那么将不会重复调度它，只会更新时间间隔参数。
   *
   * @param callback 任务的回调函数
   * @param interval 每次调用之间的时间间隔
   * @param repeat 此任务的重复计数，任务将被调用（repeat+1）次，默认无限重复
   * @param delay 第一次调用的延迟时间，单位：s
   */
  public schedule(callback: Function, interval: number = 0, repeat: number = macro.REPEAT_FOREVER, delay: number = 0): string {
    let UUID = `schedule_${StringUtil.guid()}`;
    this._schedules.set(UUID, callback);
    this._component.schedule(callback, interval, repeat, delay);
    return UUID;
  }

  /** 封装cc内部的scheduleOnce方法 */
  public scheduleOnce(callback: Function, delay: number = 0): string {
    let UUID = `scheduleOnce_${StringUtil.guid()}`;
    this._schedules.set(UUID, callback);
    this._component.scheduleOnce(() => {
      let cb = this._schedules.get(UUID);
      if (cb) {
        cb();
      }
      this.unschedule(UUID);
    }, Math.max(delay, 0));
    return UUID;
  }

  /** 封装cc内部的unschedule方法 */
  public unschedule(uuid: string) {
    let cb = this._schedules.get(uuid);
    if (cb) {
      this._component.unschedule(cb);
      this._schedules.delete(uuid);
    }
  }

  /** 获取游戏开始到现在逝去的时间 */
  public getTime(): number {
    return this.getLocalTime() - this._initTime;
  }

  /** 获取本地时间刻度 */
  public getLocalTime(): number {
    return Date.now();
  }
}
