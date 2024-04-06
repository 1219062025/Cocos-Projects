import EventManager from '../EventManager';
import MediaQueries from './MediaQueries';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScreenManager {
  private static _ins: ScreenManager;
  public static get ins() {
    if (this._ins == null) {
      this._ins = new ScreenManager();
    }
    return this._ins;
  }

  /** 已注册的组件列表 */
  private _componentMap: Map<number, MediaQueries> = new Map([]);

  constructor() {
    EventManager.on('view-resize', this.Notification, this);
  }

  /** 通知所有注册组件进行Inquire动作 */
  Notification() {
    this._componentMap.forEach(media => {
      media.Inquire();
    });
  }

  // 注册组件
  add(component: MediaQueries) {
    this._componentMap.set(component.mid, component);
  }

  // 移除组件
  remove(mid: number) {
    let isExist = this._componentMap.has(mid);
    if (isExist) {
      this._componentMap.delete(mid);
    }
  }
}
