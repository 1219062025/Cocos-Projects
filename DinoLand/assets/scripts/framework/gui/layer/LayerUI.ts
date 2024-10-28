import { _decorator, Component, instantiate, Layers, Node, Prefab, Vec2, warn, Widget } from 'cc';
import { UICallbacks, UIConfig, ViewParam } from '../../types';
import { App } from '../../App';
import { ViewUtil } from '../../utils/ViewUtil';
const { ccclass, property } = _decorator;

/** UI界面节点基类 */
@ccclass('LayerUI')
export class LayerUI extends Node {
  /** UI信息映射 */
  protected _viewParamMap: Map<string, ViewParam> = new Map([]);

  /**
   * UI基础层，允许添加多个预制件节点
   * @param name 该层名
   * @param container 容器Node
   */
  constructor(name: string) {
    // 继承自Node需要调用super
    super(name);
    // 设置节点到UI_2D层
    this.layer = Layers.Enum.UI_2D;
    // LayerUI继承自Node，是一个节点。设置节点对齐策略
    ViewUtil.nodeFullAlign(this);
  }

  /**
   * 添加一个UI信息到映射中，该方法将返回一个唯一`uuid`来标识该UI信息
   * @param config  UI信息
   * @param params  自定义参数
   * @param callbacks 回调函数对象，可选
   */
  add(config: UIConfig, params?: any, callbacks?: UICallbacks) {
    const prefabPath = config.prefab;
    const uuid = this.getUuid(prefabPath);
    let viewParam = this._viewParamMap.get(uuid);

    if (viewParam && viewParam.valid) {
      warn(`路径为【${prefabPath}】的预制重复加载`);
      return '';
    }

    if (viewParam == null) {
      viewParam = new ViewParam(uuid, prefabPath, {
        params,
        callbacks,
        valid: true
      });
      this._viewParamMap.set(viewParam.uuid, viewParam);
    }

    this.load(viewParam);

    return uuid;
  }

  /** 从已保存的UI信息中，加载一个UI界面节点。该方法也被子UI层继承 */
  protected load(viewParam: ViewParam) {
    const _viewParam = this._viewParamMap.get(viewParam.uuid);
    if (_viewParam && _viewParam.node) {
      // 已存在对应的UI信息，直接将UI节点挂载当前层显示出来。
      _viewParam.node.setParent(this);
    } else {
      App.resMgr.loadRes(viewParam.prefabPath, (res: Prefab) => {
        // 不存在对应的UI信息，需要先实例化UI预制体
        const prefab = res;
        const node = instantiate(prefab);
        viewParam.node = node;

        // 将UI节点挂载当前层显示出来。
        viewParam.node.setParent(this);
      });
    }

    this.onAdded(viewParam);
  }

  /** 根据uuid删除节点，如果节点还在队列中也会被删除 */
  removeByUuid(uuid: string, isDestroy: boolean) {
    const viewParam = this._viewParamMap.get(uuid);

    if (this._viewParamMap.has(uuid)) {
      this._viewParamMap.delete(uuid);

      this.onRemove(viewParam, isDestroy);
      viewParam.valid = false;
    }
  }

  /** 根据预制体路径删除节点，如果节点还在队列中也会被删除 */
  removeByPath(prefabPath: string, isDestroy: boolean) {
    for (const viewParam of this._viewParamMap.values()) {
      if (viewParam.prefabPath === prefabPath) {
        this._viewParamMap.delete(viewParam.uuid);

        this.onRemove(viewParam, isDestroy);
        viewParam.valid = false;
      }
    }
  }

  /** 如果有的话触发添加UI节点事件 */
  protected onAdded(viewParam: ViewParam) {
    if (viewParam.callbacks && viewParam.callbacks.onAdded) {
      viewParam.callbacks.onAdded(viewParam.node, viewParam.params);
    }
  }

  /** 触发移除UI节点事件 */
  protected onRemove(viewParam: ViewParam, isDestroy: boolean) {
    // 如果UI界面不在使用状态的话返回
    if (viewParam.valid === false) return;

    this.onBeforeRemove(viewParam, isDestroy);
  }

  /** 如果有的话触发移除UI节点前事件，否则直接触发移除UI节点后事件 */
  protected onBeforeRemove(viewParam: ViewParam, isDestroy: boolean) {
    if (viewParam.callbacks && viewParam.callbacks.onBeforeRemove) {
      viewParam.callbacks.onBeforeRemove(viewParam.node, () => {
        this.onAfterRemove(viewParam, isDestroy);
      });
    } else {
      this.onAfterRemove(viewParam, isDestroy);
    }
  }

  /** 如果有的话触发移除UI节点后事件 */
  protected onAfterRemove(viewParam: ViewParam, isDestroy: boolean) {
    if (viewParam.callbacks && viewParam.callbacks.onRemoved) {
      // 调用onRemoved时为方便操作，此时节点还未从节点树移除
      viewParam.callbacks.onRemoved(viewParam.node, viewParam.params);
    }

    // 直接销毁或者只是从节点树移除。后者可以复用该UI界面而不用重新实例化预制体
    if (isDestroy) {
      viewParam.node.destroy();
    } else {
      viewParam.node.removeFromParent();
    }
  }

  /** 清除所有节点，队列当中的也删除 */
  clear(isDestroy: boolean): void {
    this._viewParamMap.forEach((value: ViewParam, key: string) => {
      this.removeByUuid(key, isDestroy);
    });
    this._viewParamMap.clear();
  }

  /** 传入UI预制体文件路径，构造一个唯一标识UUID。该方法也被子UI层继承 */
  protected getUuid(prefabPath: string): string {
    let uuid = `${this.name}_${prefabPath}`;
    return uuid.replace(/\//g, '_');
  }
}
