/** 全局命名空间 */
declare namespace gi {
  /** Tile之间的间隔 */
  var TILE_SPACE: number;
  /** Tile的宽度 */
  var TILE_WIDTH: number;
  /** Tile的高度 */
  var TILE_HEIGHT: number;
  /** x轴上的偏移 */
  var OFFSET_X: number;
  /** y轴上的偏移 */
  var OFFSET_Y: number;
  /** 层级在x轴上的偏移 */
  var TIER_OFFSET_X: number;
  /** 层级在y轴上的偏移 */
  var TIER_OFFSET_Y: number;
  /** 游戏区域宽度 */
  var GAME_WIDTH: number;
  /** 游戏区域高度 */
  var GAME_HEIGHT: number;

  /** ___DEBUG START___ */
  /** 得分 */
  var score: number;
  /** 全局缩放 */
  var scale: number;
  var tileScale: number;
  /** ___DEBUG END___ */

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

  interface LevelInfo {
    /** 当前关卡映射 */
    map: (number | string)[][];
    /** 当前关卡有多少层 */
    tiers: number;
  }

  /** 游戏模式 */
  class Mode {
    /** 经典模式 */
    static CLASSICS: string;
  }

  class Action {
    static ADD: string;
    static REMOVE: string;
    static UPDATE: string;
  }

  interface ShakeOptions {
    /** 振动的节点，如果不填则是屏幕振动 */
    node?: cc.Node;
    /** 振动幅度，默认20偏移 */
    amplitude?: number;
    /** 振动频率，默认0.05 */
    frequency?: number;
    /** 振动用时，默认2 */
    duration?: number;
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
     * 节点振动
     * @param node 振动节点
     * @param amplitude 振动幅度
     * @param frequency 振动频率
     * @param duration 振动总时间
     */
    static shake(options?: ShakeOptions): Promise<unknown>;
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
    /** 当前是否处于引导中 */
    static inGuide: boolean;

    /** 设置当前引导步骤 */
    static setStep(step: number): void;

    /** 获取当前引导步骤 */
    static getStep(): number;

    /** 下一步引导 */
    static nextStep(): void;

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
    /** x、y坐标需要传入中点坐标而不是左下角坐标。maxLen代表一个子树所能容纳的最大数据量，之后的树操作都根据创建树时使用的坐标系 */
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
}
