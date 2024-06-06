/** 全局命名空间 */
declare namespace gi {
  /** 游戏得分 */
  var score: number;
  /** Block的宽度 */
  var blockWidth: number;
  /** Block的高度 */
  var blockHeight: number;
  /** Block的宽度 */
  var areablockWidth: number;
  /** Block的高度 */
  var areablockHeight: number;
  var initiaColCount: number;
  /** 游戏区域节点宽度 */
  var gameAreaWidth: number;
  /** 游戏区域节点高度 */
  var gameAreaHeight: number;
  /** 基础方块有多少种 */
  var baseBlockCount;

  /** 设置游戏模式 */
  function setMode(mode: Mode): void;

  /** 获取游戏模式 */
  function getMode(): Mode;

  /** 获取当前使用的方块库 */
  function getLibrary(librayType: Libray): ChunkData[];

  /** 设置出块逻辑 */
  function setLogic(logicType: Logic): void;

  /** 获取当前使用的出块逻辑 */
  function getLogic(): Logic;

  /** 获取方块spriteFrame */
  function getBlockSprite(type: number, category: number): cc.SpriteFrame;

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
