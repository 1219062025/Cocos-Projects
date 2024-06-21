/** 全局命名空间 */
declare namespace gi {
  /** Block的宽度 */
  var BLOCKWIDTH: number;
  /** Block的高度 */
  var BLOCKHEIGHT: number;
  /** Cell的宽度 */
  var CELLWIDTH: number;
  /** Cell的高度 */
  var CELLHEIGHT: number;
  /** 网格行数 */
  var MAPROWS: number;
  /** 网格列数 */
  var MAPCOLS: number;
  /** 游戏区域节点宽度 */
  var MAPWIDTH: number;
  /** 游戏区域节点高度 */
  var MAPHEIGHT: number;
  /** 基础方块有多少种 */
  var BASEBLOCKCOUNT: number;
  /** 块初始化时的缩放 */
  var CHUNKSCALE: number;

  /** ___DEBUG START___ */
  /** 得分 */
  var score: number;
  /** 全局缩放 */
  var scale: number;
  /** ___DEBUG END___ */

  /** 设置游戏模式 */
  function setMode(mode: string): void;

  /** 获取游戏模式 */
  function getMode(): string;

  /** 设置当前关卡 */
  function setLevel(value: number): void;

  /** 获取当前关卡 */
  function getLevel(): number;

  /** 获取当前使用的方块库 */
  function getLibrary(): ChunkData[];

  /** 根据id获取方块库中的块，如果不传入哪个方块库默认使用当前方块库 */
  function getChunk(id: number, librayType?: string): ChunkData;

  /** 设置出块逻辑 */
  function setLogic(logicType: string): void;

  /** 获取当前使用的出块逻辑 */
  function getLogic(): string;

  /** 获取方块spriteFrame */
  function getBlockSprite(type: number, category: string): cc.SpriteFrame;

  /** 载入游戏资源 */
  function loadGameRes(): Promise<[unknown, unknown]>;

  /** 载入游戏配置 */
  function loadGameConfig(): void;

  /** 预制体生成器 */
  function prefabBuilder<T extends cc.Component>(
    prefab: cc.Prefab,
    control: {
      prototype: T;
    }
  ): { node: cc.Node; ctrl: T };

  /** 行、列数 */
  interface Ranks {
    /** 行 */
    row: number;
    /** 列 */
    col: number;
  }

  /** 块数据 */
  interface ChunkData {
    /** 块的id */
    id: number;
    /** 块的行数 */
    rows: number;
    /** 块的列数 */
    cols: number;
    /** 块的面积，行数*列数 */
    area: number;
    /** 块的形状 */
    shape: string;
    /** 包含的方块数量 */
    blockCount: number;
    /** 包含的方块 */
    blocks: ChunkBlockInfo[];
    /** 起始方块 */
    startBlock?: ChunkBlockInfo;
    /** 旋转度数以及对应的块，旋转后还是自身时就不存在该属性 */
    rotations?: { ['90']: number };
  }

  /** 块内部的方块信息 */
  interface ChunkBlockInfo {
    /** 与起始方块相差了多少行 */
    difRows: number;
    /** 与起始方块相差了多少列 */
    difCols: number;
    /** 方块本身的引用 */
    self?: cc.Node;
    /** 方块类型 */
    type?: BlockCategory;
  }

  /** 订阅 */
  interface Subscription {
    /** 回调 */
    callback: Function;
    /** 目标 */
    target: any;
  }

  /** 游戏模式 */
  class Mode {
    /** 经典模式 */
    static CLASSICS: string;
  }

  /** 方块库 */
  class Libray {
    /** 全局方块库 */
    static GLOBAL: string;
  }

  /** 出块逻辑 */
  class Logic {
    /** 简易方块逻辑 */
    static EASY: string;
    /** 助力方块逻辑 */
    static ASSISTANCE: string;
  }

  /** 方块类型 */
  class BlockCategory {
    static BASEBLOCK: string;
    static GOALBLOCK: string;
  }

  /** 基础方块 */
  class BaseBlock {
    static RED: number;
    static GREEN: number;
    static YELLOW: number;
    static ORANGE: number;
    static BLUE: number;
    static PURPLE: number;
    static SKYBLUE: number;
    static GREY: number;
  }

  /** 得分方块 */
  class GoalBlock {
    static BLUE: number;
    static RED: number;
    static ORANGE: number;
  }

  /** 块形状 */
  class Shape {
    static LINE: string;
    static RECT: string;
    static TRIANGLE: string;
    static L: string;
    static Z: string;
    static T: string;
  }

  class Action {
    static ADD: string;
    static UPDATE: string;
    static REMOVE: string;
  }

  /** 工具类 */
  class Utils {
    /** 扁平化数组 */
    static flat<T>(array): T[];

    /** 判断传入的值是否在某个数字闭区间内 */
    static inRange(value: number, min: number, max: number): boolean;

    /** 防抖 */
    static debounce(func, delay): (...args: any[]) => void;

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
  }

  /** 引导 */
  class Guide {
    /** 当前引导的步骤 */
    static step: number;
    /** 是否还处于引导阶段 */
    static inGuide: boolean;
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

  interface RemoveInfo {
    /** 消除后的映射 */
    map: number[][];
    /** 消除了哪些行 */
    rows: number[];
    /** 消除了哪些列 */
    cols: number[];
    /** 消除的行数+列数 */
    count: number;
  }

  /** 映射操作 */
  class Map {
    /** 是否可以放置块 */
    static canPlace(map: number[][], chunkData: gi.ChunkData, startRow: number, startCol: number): boolean;

    /** 是否能产生消除 */
    static canRemove(map: number[][]): boolean;

    /** 获取假设chunk放下后的map映射 */
    static place(map: number[][], chunkData: gi.ChunkData, startRow: number, startCol: number): number[][];

    /** 获取假设消除方块后的信息 */
    static remove(map: number[][]): RemoveInfo;

    /** 块是否可以放入并且产生消除 */
    static canPlaceAndRemove(map: number[][], chunkData: gi.ChunkData, startRow: number, startCol: number): boolean;

    /** 获取假设chunk放下并产生消除后的信息 */
    static placeAndRemove(map: number[][], chunkData: gi.ChunkData, startRow: number, startCol: number): RemoveInfo;

    /** 创建映射 */
    static createMap<T>(rows: number, cols: number, value: T): T[][];

    /** 某行是否全是target值 */
    static isRowAllTarget<T>(map: T[][], row: number, target: T): boolean;

    /** 某列是否全是target值 */
    static isColumnAllTarget<T>(map: T[][], col: number, target: T): boolean;

    /** 设置某行为target值 */
    static setRowAllValue<T>(map: T[][], row: number, target: T): void;

    /** 设置某列为target值 */
    static setColumnAllValue<T>(map: T[][], col: number, target: T): void;

    /** 设置映射中所有值 */
    static setAllValue<T>(map: T[][], target: T): void;

    /** 对某行执行操作 */
    static handleRowAll<T>(map: T[][], row: number, func: (item: T) => void): void;

    /** 对某列执行操作 */
    static handleColumnAll<T>(map: T[][], col: number, func: (item: T) => void): void;
  }

  interface MaxRemoveInfo {
    /** 消除的行数+列数 */
    count: number;
    /** 起始行 */
    startRow: number;
    /** 起始列 */
    startCol: number;
    /** 消除了哪些行 */
    rows: number[];
    /** 消除了哪些列 */
    cols: number[];
    /** 块数据 */
    chunkData: gi.ChunkData;
  }

  /** 棋盘操作 */
  class Board {
    /** 初始化 */
    static init(board: BoardControl): void;

    /** 获取Board中指定行、列格子的位置。坐标系为Board，起始点为左上角 */
    static getRanksPos({ row, col }: gi.Ranks): cc.Vec2;

    /** 获取所有能够放入的块 */
    static getCanPlaceChunks(dataList: gi.ChunkData[], map: number[][]): gi.ChunkData[];

    /** 获取所有能够产生消除的块 */
    static getCanRemoveChunks(dataList: gi.ChunkData[], map: number[][]): gi.ChunkData[];

    /** 获取所有最大面积的块 */
    static getMaxAreaChunks(dataList: gi.ChunkData[]): gi.ChunkData[];

    /** 获取所有最大消除行列数的块 */
    static getMaxRemoveChunks(dataList: gi.ChunkData[], map: number[][]): gi.ChunkData[];

    /** 获取块的最大消除行列数信息 */
    static getMaxRemoveInfo(chunkData: gi.ChunkData, map: number[][]): MaxRemoveInfo;
  }
}
