import Table from './tableControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  @property({ tooltip: '当前关卡', step: 1 })
  currentLevel: number = 0;

  /** 牌桌控制脚本 */
  @property({ type: Table, tooltip: '牌桌控制脚本' })
  table: Table = null;

  onLoad() {
    gi.loadGameRes().then(() => {
      this.initGame();
    });
  }

  initGame() {
    gi.setLevel(this.currentLevel);

    this.table.init();
  }
}
