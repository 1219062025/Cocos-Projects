import { _decorator, Component, director, Node } from 'cc';
import { LayerPopup } from './LayerPopup';
import { UICallbacks, UIConfig, ViewParam } from '../../types';
const { ccclass, property } = _decorator;

/** 对话框层，同时只能有一个对话框存在。上一个对话框结束后自动从队列中取出下一个，直到清空队列 */
@ccclass('LayerDialog')
export class LayerDialog extends LayerPopup {
  private queue: ViewParam[] = [];
  private current: ViewParam = null;

  add(config: UIConfig, params: any, callbacks: UICallbacks) {
    this.black.enabled = true;

    const prefabPath = config.prefab;
    const uuid = this.getUuid(prefabPath);

    let viewParam = this._viewParamMap.get(uuid);
    if (viewParam == null) {
      viewParam = new ViewParam(uuid, prefabPath, {
        params,
        callbacks
      });

      const originFunc = viewParam.callbacks.onRemoved;
      viewParam.callbacks.onRemoved = (node: Node | null, params: any) => {
        if (originFunc) originFunc(node, params);
        director.getScheduler().schedule(this.next, this, 0, 0);
        this._viewParamMap.set(uuid, viewParam);
      };
    }

    if (this.current && this.current.valid) {
      this.queue.push(viewParam);
    } else {
      this.current = viewParam;
      this.load(viewParam);
    }
    return uuid;
  }

  private next() {
    if (this.queue.length > 0) {
      this.current = this.queue.shift()!;
      if (this.current.node) {
        this.current.node.setParent(this);
      } else {
        this.load(this.current);
      }
    }
  }
}
