/** 游戏模式 */
export enum Mode {
  /** 经典模式 */
  CLASSICS
}
/** 方块库 */
export enum Libray {
  /** 全局方块库 */
  GLOBAL
}

/** 出块逻辑 */
export enum Logic {
  /** 简易方块逻辑 */
  EASY,
  /** 助力方块逻辑 */
  ASSISTANCE
}

/** 方块类型 */
export enum BlockCategory {
  BASEBLOCK,
  GOALBLOCK
}
/** 基础方块 */
export enum BaseBlock {
  RED,
  ORANGE,
  YELLOW,
  GREEN,
  BLUE,
  PURPLE,
  SKYBLUE
}
/** 得分方块 */
export enum GoalBlock {
  BLUE,
  RED,
  ORANGE
}
/** 块形状 */
export enum Shape {
  LINE,
  RECT,
  TRIANGLE,
  L,
  Z,
  T
}

export enum Action {
  ADD,
  UPDATE,
  REMOVE
}
