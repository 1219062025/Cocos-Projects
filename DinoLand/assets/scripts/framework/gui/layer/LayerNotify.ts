import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { LayerUI } from './LayerUI';
import { ViewParam } from '../../types';
import { App } from '../../App';
import { NotifyComponent } from './NotifyComponent';
const { ccclass, property } = _decorator;

const toastPrefabPath: string = 'resources/common/prefab/notify';

/** 消息提示层，类似Toast */
@ccclass('LayerNotify')
export class LayerNotify extends LayerUI {
  show(content: string) {
    const prefabPath = toastPrefabPath;
    const uuid = this.getUuid(prefabPath);
    const viewParam = new ViewParam(uuid, prefabPath, {
      params: { content }
    });
    this._viewParamMap.set(uuid, viewParam);

    App.resMgr.loadRes(viewParam.prefabPath, (res: Prefab) => {
      // 实例化Toast UI预制体
      const prefab = res;
      const node = instantiate(prefab);
      viewParam.node = node;

      // 将UI节点挂载当前层显示出来
      viewParam.node.setParent(this);

      // 触发消息提示
      const notify = viewParam.node.getComponent(NotifyComponent);
      notify.toast(viewParam.params.content, viewParam.params.useI18n);
    });
  }
}
