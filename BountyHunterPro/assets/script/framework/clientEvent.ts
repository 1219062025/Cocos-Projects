import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

interface Handler {
  /** 处理函数 */
  handler: Function;
  /** 监听目标 */
  target: any;
}

/** 全局事件管理类 */
@ccclass('ClientEvent')
export class ClientEvent {
  /** 所有已经注册的事件，每个key值对应一个(处理函数, 监听目标)数组 */
  private static _handlers: { [key: string]: Handler[] } = {};

  /**
   * 监听事件
   * @param {string} eventName 事件名称
   * @param {function} handler 监听函数
   * @param {object} target 监听目标
   */
  public static on(eventName: string, handler: Function, target: any) {
    // 没有注册过的事件进行初始化
    if (!ClientEvent._handlers[eventName]) {
      ClientEvent._handlers[eventName] = [];
    }

    const objHandler: Handler = { handler, target };
    const objHandlerList: Handler[] = ClientEvent._handlers[eventName];

    for (var i = 0; i < objHandlerList.length; i++) {
      if (!objHandlerList[i]) {
        objHandlerList[i] = objHandler;
        return i;
      }
    }

    objHandlerList.push(objHandler);
    return objHandlerList.length;
  }

  /**
   * 取消监听
   * @param {string} eventName 监听事件
   * @param {function} handler 监听函数
   * @param {object} target 监听目标
   */
  public static off(eventName: string, handler: Function, target: any) {
    const objHandlerList: Handler[] = ClientEvent._handlers[eventName];
    if (!objHandlerList) {
      return;
    }

    for (let i = 0; i < objHandlerList.length; i++) {
      const objHandler = objHandlerList[i];
      if (objHandler.handler === handler && (!target || target === objHandler.target)) {
        objHandlerList.splice(i, 1);
        break;
      }
    }
  }

  /**
   * 分发事件
   * @param {string} eventName 分发事件名
   * @param  {...any} params 分发事件参数
   */
  public static dispatchEvent(eventName: string, ...args: any) {
    const objHandlerList = ClientEvent._handlers[eventName];

    if (!objHandlerList) {
      return;
    }

    const params = [...args];

    for (let i = 0; i < objHandlerList.length; i++) {
      const objHandler = objHandlerList[i];
      if (objHandler) {
        objHandler.handler.apply(objHandler.target, params);
      }
    }
  }
}
