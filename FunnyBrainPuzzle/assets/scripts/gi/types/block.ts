/** 方块类型 */
export const BlockCategory = {
  /** 基础方块 */
  BASEBLOCK: 'baseblock',
  /** 得分方块 */
  GOALBLOCK: 'goalblock'
};

/** 基础方块 */
export const BaseBlock = {
  RED: 1,
  GREEN: 2,
  YELLOW: 3,
  ORANGE: 4,
  BLUE: 5,
  PURPLE: 6,
  SKYBLUE: 7,
  GREY: 8
};

/** 得分方块 */
export const GoalBlock = {
  BLUE: 0,
  RED: 1,
  ORANGE: 2
};

/** 块形状 */
export const Shape = {
  LINE: 'line',
  RECT: 'rect',
  TRIANGLE: 'triangle',
  L: 'l',
  Z: 'z',
  T: 't'
};

/** 动作 */
export const Action = {
  ADD: 'add',
  UPDATE: 'update',
  REMOVE: 'remove'
};

export default { BaseBlock, GoalBlock, Shape, Action };
