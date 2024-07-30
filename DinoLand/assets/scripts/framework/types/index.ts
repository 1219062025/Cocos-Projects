import { Node } from 'cc';

/*
 * -------------异步队列控制器常用类型定义---------------
 */
export interface AsyncTask {
  /** 任务uuid */
  uuid: number;
  /** 任务开始执行的回调 */
  callbacks: Array<AsyncCallback>;
  /** 任务参数 */
  params: any;
}

/**
 * 任务开始执行的回调
 * @params push时传入的参数
 * @args 上个任务传来的参数
 */
export type AsyncCallback = (next: NextFunction, params: any, args: any) => void;

export type NextFunction = (nextArgs?: any) => void;

/*
 * -------------Gui模块常用类型定义---------------
 */

/** 弹出层类型 */
export enum LayerType {
  Game = 'LayerGame',
  UI = 'LayerUI',
  PopUp = 'LayerPopUp',
  Dialog = 'LayerDialog',
  Alert = 'LayerAlert',
  Notify = 'LayerNotify',
  Loading = 'Loading'
}

/** UI配置 */
export interface UIConfig {
  bundle?: string;
  /** 弹出层 */
  layer: LayerType;
  /** 弹出层的预制体的文件路径 */
  prefab: string;
  /** 弹出动画 */
  animation?: number;
}

/*** 回调参数对象定义 */
export interface UICallbacks {
  /** 节点添加到层级以后的回调 */
  onAdded?: (node: Node, params: any) => void;

  /**
   * destroy之后回调
   */
  onRemoved?: (node: Node | null, params: any) => void;

  /**
   * 注意：调用`delete`或`$delete`才会触发此回调，如果`this.node.destroy()`，该回调将直接忽略。
   *
   * 如果指定onBeforeRemoved，则next必须调用，否则节点不会被正常删除。
   *
   * 比如希望节点做一个FadeOut然后删除，则可以在`onBeforeRemoved`当中播放action动画，动画结束后调用next
   *
   * */
  onBeforeRemove?: (node: Node, next: Function) => void;
}

/** gui.popup.add 弹框层回调对象定义 */
export interface PopViewParams extends UICallbacks {
  /** 是否显示暗色背景 */
  modal?: boolean;

  /** 是否触摸背景关闭弹窗 */
  touchClose?: boolean;

  /** 控制暗色背景的透明度 默认为190*/
  opacity?: number;
}

interface ViewParamsOptions {
  /** 传递给打开界面的参数 */
  params?: any | null;
  /** 窗口事件 */
  callbacks?: UICallbacks | null;
  /** 是否在使用状态 */
  valid?: boolean;
  /** 界面根节点 */
  node?: Node | null;
}

export class ViewParams {
  /** 界面唯一标识 */
  public uuid!: string;
  /** 预制路径 */
  public prefabPath!: string;
  /** 传递给打开界面的参数 */
  public params: any;
  /** 窗口事件 */
  public callbacks!: UICallbacks | null;
  /** 是否在使用状态 */
  public valid: boolean = true;
  /** 界面根节点 */
  public node: Node = null;

  /**
   * ViewParams类型仅供gui模块内部使用，请勿在功能逻辑中使用
   * @param uuid 界面唯一标识
   * @param prefabPath 预制路径
   * @param options.params [?传递给打开界面的参数]
   * @param options.callbacks [?窗口事件]
   * @param options.valid [?是否在使用状态，默认为true]
   * @param options.node [?界面根节点]
   */
  constructor(uuid: string, prefabPath: string, options: ViewParamsOptions) {
    this.uuid = uuid;
    this.prefabPath = prefabPath;
    this.params = options.params || {};
    this.callbacks = options.callbacks || {};
    this.valid = options.valid || true;
    this.node = options.node || null;
  }
}
