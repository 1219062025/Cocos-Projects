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
  private _QueriesMap: Map<cc.Node, Map<number, MediaQueries>> = new Map([]);

  constructor() {
    EventManager.on('view-resize', this.Notification, this);
  }

  /** 通知所有注册组件进行Inquire动作 */
  Notification() {
    this._QueriesMap.forEach(mediaMap => {
      mediaMap.forEach(media => {
        media.InquireStart();
      });
    });
  }

  // 注册组件
  add(node: cc.Node, component: MediaQueries) {
    const isExist = this._QueriesMap.has(node);
    if (isExist) {
      this._QueriesMap.get(node).set(component.mid, component);
    } else {
      this._QueriesMap.set(node, new Map([[component.mid, component]]));
    }
  }

  // 移除组件
  remove(node: cc.Node, mid: number) {
    const isExistNode = this._QueriesMap.has(node);
    if (isExistNode) {
      const isExist = this._QueriesMap.get(node).has(mid);
      if (isExist) this._QueriesMap.get(node).delete(mid);
    }
  }
}
