import { log, warn } from 'cc';

/** 事件数据类 */
export class EventData {
  /** 事件名 */
  public event!: string;
  /** 处理事件的侦听器函数 */
  public listener!: (event: string, args: any) => void;
  /** 侦听函数绑定的this对象 */
  public obj: any;

  constructor(event: string, listener: (event: string, args: any) => void, thisObj: any) {
    this.event = event;
    this.listener = listener;
    this.obj = thisObj;
  }
}

/** 全局事件管理器类 */
class MessageManager {
  public static readonly Instance: MessageManager = new MessageManager();

  private _events: Map<string, EventData[]> = new Map([]);

  /**
   * 注册全局事件
   * @param event(string)      事件名
   * @param listener(function) 处理事件的侦听器函数
   * @param thisObj(object)    侦听函数绑定的this对象
   */
  public on(event: string, listener: (event: string, args: any) => void, thisObj?: object) {
    if (!event || !listener) {
      warn(`注册【${event}】事件的侦听器函数为空`);
      return;
    }

    if (!this._events.has(event)) {
      this._events.set(event, []);
    }

    const list: EventData[] = this._events.get(event);

    for (let i = 0; i < list.length; i++) {
      let bin: EventData = list[i];
      if (bin.listener === listener && bin.obj === thisObj) {
        warn(`名为【${event}】的事件重复注册侦听器`);
      }
    }

    list.push(new EventData(event, listener, thisObj));
  }

  /**
   * 监听一次事件，事件响应后，该监听自动移除
   * @param event
   * @param listener
   * @param thisObj
   */
  public once(event: string, listener: (event: string, args: any) => void, thisObj?: object) {
    let _listener: any = ($event: string, $args: any) => {
      this.off(event, _listener, thisObj);
      _listener = null;
      listener.call(thisObj, $event, $args);
    };
    this.on(event, _listener, thisObj);
  }

  /**
   * 移除全局事件
   * @param event(string)      事件名
   * @param listener(function) 处理事件的侦听器函数
   * @param thisObj(object)    侦听函数绑定的this对象
   */
  public off(event: string, listener: Function, thisObj: object) {
    if (!this._events.has(event)) {
      log(`名为【${event}】的事件不存在`);
      return;
    }

    const list: EventData[] = this._events.get(event);

    for (let i = 0; i < list.length; i++) {
      let bin: EventData = list[i];
      if (bin.listener === listener && bin.obj === thisObj) {
        list.splice(i, 1);
        break;
      }
    }

    if (list.length === 0) {
      this._events.delete(event);
    }
  }

  /**
   * 触发全局事件
   * @param event(string)      事件名
   * @param arg(any)           事件参数
   */
  public dispatchEvent(event: string, arg?: any) {
    const list: EventData[] = this._events.get(event);

    if (null != list) {
      let temp: EventData[] = list.concat();
      let length = temp.length;
      for (let i = 0; i < length; i++) {
        let eventBin = temp[i];
        eventBin.listener.call(eventBin.obj, event, arg);
      }
    }
  }

  /** 清空所有全局事件 */
  public clear() {
    this._events = new Map([]);
  }
}

/** 全局事件管理器单例 */
export const Message = MessageManager.Instance;
