import { Camera, Component, instantiate, Layers, Node, Prefab } from 'cc';
import { LayerDialog } from './LayerDialog';
import { LayerNotify } from './LayerNotify';
import { LayerUI } from './LayerUI';
import { LayerPopup } from './LayerPopup';
import { LayerType, UIConfig } from '../../types';
import { ViewUtil } from '../../utils/ViewUtil';
import { App } from '../../App';
import { LoadingComponent } from './LoadingComponent';

const loadingPrefabPath: string = 'resources/loading/prefab/loading';

/** 全局UI管理器类 */
export class LayerManager {
  /** 界面层根节点 */
  public gui: Node;
  /** 界面层摄像机 */
  public camera: Camera;
  /** 游戏界面特效层 */
  public game: Node;

  /** 界面层 */
  public ui: LayerUI;
  /** 弹出框层 */
  public popup: LayerPopup;
  /** 对话框层 */
  public dialog: LayerDialog;
  /** 游戏系统提示弹窗（优先显示） */
  public alert: LayerDialog;
  /** 消息提示层 */
  public notify: LayerNotify;
  /** Loading层 */
  private loading: LoadingComponent;

  /** 所有UI配置信息映射 */
  private configs: Map<number, UIConfig> = new Map([]);

  /** 传入界面层根节点，也就是全局根节点下的gui */
  constructor(gui: Node) {
    this.gui = gui;
    this.camera = this.gui.getComponentInChildren(Camera);

    // 创建UI的各个层
    this.ui = new LayerUI(LayerType.UI);
    this.popup = new LayerPopup(LayerType.PopUp);
    this.dialog = new LayerDialog(LayerType.Dialog);
    this.alert = new LayerDialog(LayerType.Alert);
    this.notify = new LayerNotify(LayerType.Notify);

    // 创建特效层
    this.game = new Node(LayerType.Game);
    this.game.layer = Layers.Enum.UI_2D;
    ViewUtil.nodeFullAlign(this.game);

    // 将所有UI节点层挂载到界面层根节点下
    gui.addChild(this.game);
    gui.addChild(this.ui);
    gui.addChild(this.popup);
    gui.addChild(this.dialog);
    gui.addChild(this.alert);
    gui.addChild(this.notify);
  }

  /**
   * 初始化所有UI的配置对象
   * @param configs 配置对象
   */
  public init(configs: Map<number, UIConfig>) {
    this.configs = configs;
  }

  /**
   * 触发消息提示
   * @param content 提示文本
   */
  public toast(content: string) {
    this.notify.show(content);
  }

  public showLoading(loaded: number = 0, total: number = 100, desc?: string) {
    if (!this.loading) {
      // 创建Loading层
      const loadingUI = new Node(LayerType.Loading);
      ViewUtil.nodeFullAlign(loadingUI);

      const loadingNode = instantiate(App.resMgr.getRes(loadingPrefabPath) as Prefab);
      this.loading = loadingNode.addComponent(LoadingComponent);

      loadingUI.addChild(loadingNode);
      this.gui.addChild(loadingUI);
    }

    this.loading.setProgress(loaded, total, desc);
  }

  public hideLoading() {
    if (!this.loading) return;
    let node: Node = this.loading.node;
    if (this.loading.isValid) this.loading.destroy();
    if (node.isValid) node.removeFromParent();
    this.loading = null;
  }
}
