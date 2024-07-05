const { ccclass, property } = cc._decorator;

@ccclass
export default class Table extends cc.Component {
  init() {
    this.node.setContentSize(gi.Config.GAME_WIDTH, gi.Config.GAME_HEIGHT);
  }
}
