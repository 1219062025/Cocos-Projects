import Table from './tableControl';
import TileControl from './tileControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  @property({ tooltip: '当前关卡', step: 1 })
  currentLevel: number = 0;

  /** 牌桌控制脚本 */
  @property({ type: Table, tooltip: '牌桌控制脚本' })
  table: Table = null;

  /** 场上剩余匹配次数的label组件 */
  @property({ type: cc.Label, tooltip: '场上剩余匹配次数的label组件' })
  timesLabel: cc.Label = null;

  /** 得分laebl组件 */
  @property({ type: cc.Label, tooltip: '得分laebl组件' })
  scoreLabel: cc.Label = null;

  /** 当前选中的Tile */
  curTile: TileControl = null;

  onLoad() {
    gi.loadGameRes().then(() => {
      this.initGame();
    });
  }

  /** 初始化游戏 */
  initGame() {
    gi.setLevel(this.currentLevel);

    this.table.init();
    this.computeMatchTimes();

    gi.Event.on('touchStart', this.onTouchStart, this);
  }

  computeMatchTimes() {
    let _times = 0;
    this.table.tileMap.forEach(set => {
      const tile = Array.from(set)[0];
      set.forEach(item => {
        if (tile !== item && this.table.canSelected(tile) && this.table.canSelected(item)) {
          _times++;
        }
      });
    });
    this.timesLabel.string = String(_times);
  }

  /** 监听触摸开始事件 */
  async onTouchStart(e: TileControl) {
    if (!this.table.canSelected(e)) {
      e.cannoSelected();
      return;
    }

    if (this.curTile === null) {
      this.curTile = e;
      this.curTile.selected();
      this.curTile.scaleSelected();
      return;
    }

    if (this.curTile === e) {
      this.curTile.unSelected();
      this.curTile.scaleSelected();
      this.curTile = null;
      return;
    }

    // 判断是否匹配
    if (this.curTile.id === e.id) {
      this.curTile.unSelected();
      this.table.pair(this.curTile, e);
      this.computeMatchTimes();
      this.curTile = null;
    } else {
      this.curTile.unSelected();
      this.curTile = e;
      this.curTile.selected();
      this.curTile.scaleSelected();
    }
  }
}
