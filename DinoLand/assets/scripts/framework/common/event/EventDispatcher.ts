import { Message, EventData } from './MessageManager';

/** 事件对象基类，继承该类将拥有发送和接送事件的能力 */
export class EventDispatcher {
  private _events: Map<string, EventData[]> = new Map([]);

  /**
   * 注册事件
   * @param event(string)      事件名
   * @param listener(function) 处理事件的侦听器函数
   * @param thisObj(object)    侦听函数绑定的this对象
   */
  public on(event: string, listener: (event: string, args: any) => void, thisObj?: any) {
    if (!this._events.has(event)) {
      this._events.set(event, []);
    }

    const list: EventData[] = this._events.get(event);

    list.push(new EventData(event, listener, thisObj));

    Message.on(event, listener, thisObj);
  }

  /**
   * 移除事件
   * @param event(string)      事件名
   * @param listener(function) 处理事件的侦听器函数
   * @param thisObj(object)    侦听函数绑定的this对象
   */
  public off(event: string) {
    if (!this._events.has(event)) return;

    const list: EventData[] = this._events.get(event);

    for (let bin of list) {
      Message.off(event, bin.listener, bin.obj);
    }
    this._events.delete(event);
  }

  /**
   * 触发事件
   * @param event(string)      事件名
   * @param arg(Array)         事件参数
   */
  public dispatchEvent(event: string, arg: any = null) {
    Message.dispatchEvent(event, arg);
  }

  /** 销毁事件对象 */
  public removes() {
    for (let event in this._events.keys()) {
      this.off(event);
    }
  }

  public getEvents() {
    return this._events;
  }
}
