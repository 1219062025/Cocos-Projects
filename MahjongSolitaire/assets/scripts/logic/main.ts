import Table from './tableControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  /** 牌桌控制脚本 */
  @property({ type: Table, tooltip: '牌桌控制脚本' })
  table: Table = null;

  onLoad() {
    gi.loadGameRes().then(() => {
      this.initGame();
    });
  }

  initGame() {
    this.table.init();
  }
}
