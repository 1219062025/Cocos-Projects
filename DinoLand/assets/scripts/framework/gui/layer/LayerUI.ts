import { _decorator, Component, instantiate, Layers, Node, Prefab, warn, Widget } from 'cc';
import { UICallbacks, UIConfig, ViewParams } from '../../types';
import { App } from '../../App';
const { ccclass, property } = _decorator;

/** UI界面节点基类 */
@ccclass('LayerUI')
export class LayerUI extends Node {
  /** UI信息映射 */
  protected ui_nodes: Map<string, ViewParams> = new Map([]);

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
    // 设置节点对齐策略
    let widget: Widget = this.addComponent(Widget);
    widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true;
    widget.left = widget.right = widget.top = widget.bottom = 0;
    widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
    widget.enabled = true;
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
    let viewParams = this.ui_nodes.get(uuid);

    if (viewParams && viewParams.valid) {
      warn(`路径为【${prefabPath}】的预制重复加载`);
      return '';
    }

    if (viewParams == null) {
      viewParams = new ViewParams(uuid, prefabPath, {
        params,
        callbacks,
        valid: true
      });
      this.ui_nodes.set(viewParams.uuid, viewParams);
    }

    // this.load();

    return uuid;
  }

  /** 从已保存的UI信息中，加载一个UI界面节点 */
  protected load(viewParams: ViewParams) {
    if (this.ui_nodes.has(viewParams.uuid)) {
      // this.createNode(null, viewParams);
    } else {
      App.resMgr.loadRes(viewParams.prefabPath, (res: Prefab) => {
        // 实例化UI预制体
        const prefab = res;
        const node = instantiate(prefab);
      });
    }
  }

  /** 传入UI预制体文件路径，构造一个唯一标识UUID */
  protected getUuid(prefabPath: string): string {
    let uuid = `${this.name}_${prefabPath}`;
    return uuid.replace(/\//g, '_');
  }
}
