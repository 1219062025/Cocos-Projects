import InstanceBase from "./common/InstanceBase";
import { LayerType } from "./types/Layer";

/** UI层级管理器 */
class LayerManager extends InstanceBase {
  private _uiLayers = new Map<LayerType, cc.Node>();
  /** 挂载节点 */
  private _root: cc.Node;

  constructor() {
    super();
  }

  public init(root: cc.Node) {
    this._root = root;
    this.createLayer(LayerType.Main, root);
    this.createLayer(LayerType.Loading, root);
    this.createLayer(LayerType.Popup, root);
    this.createLayer(LayerType.Modal, root);
    this.createLayer(LayerType.Tip, root);
  }

  /** 创建指定层级的 Node */
  public createLayer(layerType: LayerType, parent: cc.Node) {
    const layer = new cc.Node(layerType);
    layer.setParent(parent);
    this.setLayer(layerType, layer);
  }

  /** 获取指定层级的 Layer Node */
  public getLayer(layerType: LayerType): cc.Node {
    return this._uiLayers.get(layerType);
  }

  /** 设置指定层级的 Layer Node */
  public setLayer(layerType: LayerType, layer: cc.Node) {
    this._uiLayers.set(layerType, layer);
  }
}

export default LayerManager.instance();
