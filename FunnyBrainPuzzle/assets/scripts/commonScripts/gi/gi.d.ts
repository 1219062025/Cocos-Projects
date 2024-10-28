/** 全局命名空间 */
declare namespace gi {
  /** 得分 */
  var score: number;
  /** 扣分 */
  var deductScore: number;
  /** 全局缩放 */
  var scale: number;
  /** 当前关卡已经完成了的动作的key */
  var finishedActionKeys: Set<string>;
  /** 此时页面是否可以操作 */
  var isClick: boolean;
  var initSubcribed: boolean;

  /** 记录指定动作已完成 */
  function completedAction(key: string): void;

  /** 设置游戏结束 */
  function end(): void;

  /** 获取游戏是否结束了 */
  function isEnd(): boolean;

  /** 设置游戏模式 */
  function setMode(mode: string): void;

  /** 获取游戏模式 */
  function getMode(): string;

  /** 设置当前关卡 */
  function setLevel(value: number): void;

  /** 获取当前关卡 */
  function getLevel(): number;

  /** 获取当前关卡信息 */
  function getLevelInfo(): LevelInfo;

  /** 载入游戏资源 */
  function loadGameRes(): Promise<[unknown, unknown]>;

  /** 载入游戏配置 */
  function loadGameConfig(): void;

  /** 设置当前语言 */
  function setLanguage(l: string): void;

  /** 获取当前语言 */
  function getLanguage(): string;

  /** 预制体生成器 */
  function prefabBuilder<T extends cc.Component>(
    prefab: cc.Prefab,
    control: {
      prototype: T;
    }
  ): { node: cc.Node; ctrl: T };

  interface GuideActionOptions {
    resArea: ResAreaControl;
  }

  /** 订阅信息 */
  interface SubscriptionOptions {
    /** 动作名 */
    key: string;
    /** 目标 */
    target: cc.Node;
    /** 附带的节点数组 */
    nodes: cc.Node[];
    /** 附带的位置数组 */
    positions: string[];
  }

  interface TriggerOffCbOptions {
    /** 动作名 */
    key: string;
    /** 挂载回调脚本的节点 */
    target: cc.Node;
    /** 触发了触发器的资源节点上挂载的资源控制脚本 */
    res: ResControl;
    /** 该触发器的控制脚本 */
    trigger: TriggerControl;
    /** 附带的节点数组 */
    nodes: cc.Node[];
    /** 附带的位置数组 */
    positions: string[];
  }

  interface TipsInfo {
    /** 关键词 */
    key: string;
    /** 默认中文 */
    default: string;
    /** 英语 */
    en: string;
    /** 泰语 */
    th: string;
    /** 印尼语 */
    id: string;
    /** 繁体中文 */
    tw: string;
    /** 马来西亚语 */
    ms: string;
    /** 越南语 */
    vi: string;
    /** 日语 */
    ja: string;
    /** 韩语 */
    ko: string;
  }

  type GuideInfo = TipsInfo & {
    /** 引导类型 */
    type: number;
  };

  interface LevelInfo {
    /** 关卡标题 */
    title: string;
    /** 关卡文本映射 */
    tipsMap: TipsInfo[];
    /** 关卡引导文本映射 */
    guideMap: GuideInfo[];
  }

  /** 工具类 */
  class Utils {
    /** 扁平化数组 */
    static flat<T>(array): T[];

    /** 判断传入的值是否在某个数字闭区间内 */
    static inRange(value: number, min: number, max: number): boolean;

    /** 防抖 */
    static debounce(func: Function, delay: number): (...args: any[]) => void;

    /** 节流 */
    static throttle(func: Function, wait: number): (...args: any[]) => void;

    /** 将节点所有的子节点按照原本的布局居中于该节点 */
    static centerChildren(node: cc.Node): void;

    /** 获取节点能够包容所有子节点的最小矩形的宽、高 */
    static calculateBoundingBox(node: cc.Node): cc.Rect;

    /**
     * 屏幕振动
     * @param node 振动节点
     * @param amplitude 振动幅度
     * @param frequency 振动频率
     * @param durtion 振动总时间
     */
    static shake(options?: { node?: cc.Node; amplitude?: number; frequency?: number; durtion?: number });

    /**
     * 判断两个数组是否有交集
     */
    static hasIntersection<T>(array1: T[], array2: T[]): boolean;
  }

  interface MoveOptions {
    /** 单次移动时间 */
    time: number;
    /** 引导节点 */
    guide: cc.Node;
    /** 移动时附带的节点 */
    node?: cc.Node;
  }

  /** 引导 */
  class Guide {
    static Type: {
      /** 拖动引导 */
      Drag: number;
      /** 点击 */
      Click: number;
      /** 文本引导 */
      Text: number;
      /** 上滑引导 */
      UP: number;
      /** 左滑引导 */
      Left: number;
      /** 右滑引导 */
      Right: number;
      /** 下滑引导 */
      Down: number;
    };

    /** 设置当前引导步骤 */
    static setStep(step: number): void;

    /** 获取当前引导步骤 */
    static getStep(step: number): number;

    /**
     * 得到一个从位置from移动到位置to的缓动
     * @param {cc.Vec2} from 起始位置
     * @param {cc.Vec2} to 终点位置
     */
    static fromToPos(from: cc.Vec2, to: cc.Vec2, options: MoveOptions): cc.Tween;

    /**
     * 得到一个从节点from的位置移动到节点to的位置的缓动
     * @param {cc.Node} from 起始节点
     * @param {cc.Node} to 终点节点
     */
    static fromToNode(fromNode: cc.Node, toNode: cc.Node, options: MoveOptions): cc.Tween;

    /** 销毁附带的节点 */
    static destroyCopyNode(): void;
  }

  /** 全局事件订阅 */
  interface Subscription {
    /** 回调 */
    callback: Function;
    /** 目标 */
    target: any;
  }

  /** 全局事件管理 */
  class Event {
    /**
     * 注册事件
     * @param name 事件名
     * @param callback 回调
     * @param target 目标
     */
    static on(name: string, callback: Function, target?: any): void;

    /**
     * 注册事件（一次性）
     * @param name 事件名
     * @param callback 回调
     * @param target 目标
     */
    static once(name: string, callback: Function, target?: any): void;

    /**
     * 取消注册事件
     * @param name 事件名
     * @param callback 回调
     * @param target 目标
     */
    static off(name: string, callback: Function, target?: any): void;

    /**
     * 通过事件名发送事件
     * @param name 事件名
     * @param args 参数
     */
    static emit(name: string, ...args: any[]): void;

    /**
     * 移除指定事件
     * @param name 事件名
     */
    static remove(name: string): void;

    /** 移除所有事件 */
    static removeAll(): void;
  }

  /** 四叉树 */
  class QuadTree {
    /** x、y坐标需要传入中点坐标而不是左下角坐标。maxLen代表一个子树所能容纳的最大数据量 */
    static createQuadTree<T>(name: string, options: { x: number; y: number; width: number; height: number; maxLen: number; ctx?: cc.Graphics }): void;

    /** 获取四叉树 */
    static getQuadTree<T>(name: string): QuadTree<T>;

    /** 四叉树插入节点，x、y坐标传入节点坐标，data传入该节点保存的数据 */
    static treeInsert<T>(name: string, options: { x: number; y: number; width: number; height: number; data: T }): void;

    /** 四叉树搜索节点，x、y坐标传入节点坐标，返回数据数组 */
    static treeSearch<T>(name: string, x: number, y: number): T[];
  }

  /** 对象池 */
  class Pool {
    /** 创建对象池 */
    static createPool(
      name: string,
      size: number,
      obj: cc.Node | cc.Prefab,
      poolHandlerComp?:
        | string
        | {
            prototype: cc.Component;
          }
    ): void;

    /** 获取对象池 */
    static getPool(name: string): cc.NodePool;

    /** 获取对象池大小 */
    static getPoolSize(name: string): number;

    /** 清空对象池 */
    static clearPool(name: string): boolean;

    /** 对象池Put */
    static poolPut(name: string, obj: cc.Node): void;

    /** 对象池Get */
    static poolGet(name: string): cc.Node;
  }

  interface SwipeOptions {
    /** 滑动方向 */
    direction: number | number[];
    /** 滑动阈值 */
    threshold?: number;
  }

  /** 滑动类 */
  class Swipe {
    static Direction = {
      /** 上滑 */
      UP: 1,
      /** 右滑 */
      RIGHT: 2,
      /** 下滑 */
      BOTTOM: 3,
      /** 左滑 */
      LEFT: 4
    };

    /**
     * 监听节点上的滑动操作，会覆盖节点上的TOUCH_START、TOUCH_END、TOUCH_CANCEL事件
     * @param node 需要监听的节点
     * @param options.direction 滑动方向，传入number或者number[]，值参考gi.Swipe.Direction
     * @param options.threshold 滑动阈值，传入number
     * @param callback 回调函数，接收参数：滑动起始点位置，结束点位置，此次滑动的方向（参考gi.Swipe.Direction）
     * @param target 调用回调函数this值
     */
    static on(node: cc.Node, options: SwipeOptions, callback: Function, target?: any): void;

    /** 监听一次节点上的滑动操作，详情参考gi.Swipe.on */
    static once(node: cc.Node, options: SwipeOptions, callback: Function, target?: any): void;

    /** 取消监听节点滑动 */
    static off(node: cc.Node);
  }
}
