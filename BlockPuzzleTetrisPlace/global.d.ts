/** 全局命名空间 */
declare namespace gi {
  /** Block的宽度 */
  var BLOCKWIDTH: number;
  /** Block的高度 */
  var BLOCKHEIGHT: number;
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

  /** 设置游戏模式 */
  function setMode(mode: string): void;

  /** 获取游戏模式 */
  function getMode(): string;

  /** 设置当前关卡 */
  function setLevel(value: number): void;

  /** 获取当前关卡 */
  function getLevel(): number;

  /** 获取当前使用的方块库 */
  function getLibrary(librayType: string): ChunkData[];

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
}
