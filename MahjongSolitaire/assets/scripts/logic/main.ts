import GuideControl from './guideControl';
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

  /** 游戏结束弹窗 */
  @property({ type: cc.Node, tooltip: '游戏结束弹窗' })
  pop: cc.Node = null;

  /** 场上剩余匹配次数的label组件 */
  @property({ type: cc.Label, tooltip: '场上剩余匹配次数的label组件' })
  timesLabel: cc.Label = null;

  /** 得分laebl组件 */
  @property({ type: cc.Label, tooltip: '得分laebl组件' })
  scoreLabel: cc.Label = null;

  @property({ type: GuideControl, tooltip: '引导' })
  guideIcon: GuideControl = null;

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
    // this.runGuide(gi.Guide.getStep());

    gi.Event.on('touchStart', this.onTouchStart, this);
  }

  computeMatchTimes() {
    let _times = 0;
    this.table.tileMap.forEach((set, n) => {
      const arr = Array.from(set);

      while (arr.length) {
        const tile = arr.shift();
        arr.forEach(item => {
          if (tile !== item && this.table.canSelected(tile) && this.table.canSelected(item)) {
            _times++;
          }
        });
      }
    });

    if (_times === 0) {
      this.pop.setSiblingIndex(-1);
      this.pop.active = true;
      (cc.tween(this.pop) as cc.Tween).to(1, { opacity: 255 }).start();
    }

    this.timesLabel.string = String(_times);
  }

  runGuide(step: number) {
    gi.Guide.inGuide = true;
    if (step === 1) {
      gi.Event.emit('showTips', '选中一张牌');
      this.guideIcon.node.stopAllActions();
      const pos = this.table.tiles[2][2][2].node.getPosition();
      this.guideIcon.node.setPosition(pos);
      this.guideIcon.promptClick();
    } else if (step === 2) {
      gi.Event.emit('showTips', '相同花色的牌可以进行匹配');
      this.guideIcon.node.stopAllActions();
      const pos = this.table.tiles[2][2][4].node.getPosition();
      gi.Guide.fromToPos(this.guideIcon.node.getPosition(), pos, { time: 0.5, guide: this.guideIcon.node }).start();
      this.guideIcon.promptClick();
    } else if (step === 3) {
      gi.Event.emit('showTips', '被左右锁住的牌无法选中');
      this.guideIcon.node.stopAllActions();
      const pos = this.table.tiles[1][2][3].node.getPosition();
      gi.Guide.fromToPos(this.guideIcon.node.getPosition(), pos, { time: 0.5, guide: this.guideIcon.node }).start();
      this.guideIcon.promptClick();
    } else if (step === 4) {
      gi.Event.emit('showTips', '被上层压住的牌无法选中');
      this.guideIcon.node.stopAllActions();
      const pos = this.table.tiles[1][4][7].node.getPosition();
      gi.Guide.fromToPos(this.guideIcon.node.getPosition(), cc.v2(pos.x, pos.y + 50), { time: 0.5, guide: this.guideIcon.node }).start();
      this.guideIcon.promptClick();
    }
  }

  isAccordGuide({ tier, row, col }) {
    if (!gi.Guide.inGuide) return true;

    const step = gi.Guide.getStep();

    if (step === 1) {
      if (tier !== 2 || row !== 2 || col !== 2) return false;
    }

    if (step === 2) {
      if (tier !== 2 || row !== 2 || col !== 4) return false;
    }

    if (step === 3) {
      if (tier !== 1 || row !== 2 || col !== 3) return false;
    }

    if (step === 4) {
      if (tier !== 1 || row !== 4 || col !== 7) return false;
      gi.Guide.inGuide = false;
      this.guideIcon.node.active = false;
      gi.Event.emit('showTips', '匹配相同花色的牌，被左右锁住或者上层压住的牌无法选中');
    }

    return true;
  }

  /** 监听触摸开始事件 */
  async onTouchStart(e: TileControl) {
    if (!this.isAccordGuide(e)) return;
    if (gi.Guide.inGuide) {
      gi.Guide.nextStep();
      this.runGuide(gi.Guide.getStep());
    }

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
