const { ccclass, property } = cc._decorator;

@ccclass
export default class FixedCellControl extends cc.Component {
  /** 六边形固定格子的唯一id */
  id = null;

  /** 该格子是否已经放置了方块 */
  isFill = false;
  start() {}
}
