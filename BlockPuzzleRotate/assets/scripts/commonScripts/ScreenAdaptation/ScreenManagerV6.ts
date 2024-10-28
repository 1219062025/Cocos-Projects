const { ccclass, property } = cc._decorator;

@ccclass
export default class ScreenManagerV6 extends cc.Component {
  @property(cc.Node)
  boardWrap: cc.Node = null;
  @property(cc.Node)
  chunkArea: cc.Node = null;
  @property(cc.Node)
  rotateCheck: cc.Node = null;
  @property(cc.Node)
  scoreBg: cc.Node = null;

  onLoad() {
    // 监听屏幕方向变化
    gi.EventManager.on('LANDSCAPE', this.landscape, this);
    gi.EventManager.on('PORTRAIT', this.portrait, this);
  }

  /** 屏幕方向变为横屏 */
  landscape() {
    gi.EventManager.emit('resize');
    gi.scale = 1;
    const winSize = cc.winSize;

    const gameCointainerSize: cc.Size = new cc.Size(990, 1320);

    const boardWrapPos = cc.v2(0, 0);

    this.boardWrap.setPosition(boardWrapPos);

    let h = winSize.height / gameCointainerSize.height;
    let w = winSize.width / 2 / gameCointainerSize.width;
    gi.scale = Math.min(h, w);

    this.boardWrap.scale = this.chunkArea.scale = this.rotateCheck.scale = this.scoreBg.scale = gi.scale;

    this.chunkArea.width = 300;
    this.chunkArea.height = 990;
    this.chunkArea.children.forEach((area, index) => {
      const beginY = this.chunkArea.height / 2;
      area.width = this.chunkArea.width;
      area.height = (this.chunkArea.height - 90) / 3;
      area.x = 0;
      area.y = -beginY + area.height / 2 + area.height * index + 30 * index;
    });

    const boardWrapRect = this.boardWrap.getBoundingBoxToWorld();
    const chunkAreaRect = this.chunkArea.getBoundingBoxToWorld();
    const rotateCheckRect = this.rotateCheck.getBoundingBoxToWorld();
    const scoreBgRect = this.scoreBg.getBoundingBoxToWorld();

    const chunkAreaPos = cc.v2(-boardWrapRect.width / 2 - this.chunkArea.width, 0);
    const rotateCheckPos = cc.v2(chunkAreaPos.x, chunkAreaPos.y - chunkAreaRect.height / 2 - rotateCheckRect.height / 1.2);
    const scoreBgPos = cc.v2(chunkAreaPos.x, chunkAreaPos.y + chunkAreaRect.height / 2 + scoreBgRect.height / 2);

    this.chunkArea.setPosition(chunkAreaPos);
    this.rotateCheck.setPosition(rotateCheckPos);
    this.scoreBg.setPosition(scoreBgPos);
  }

  /** 屏幕方向变为竖屏 */
  portrait() {
    gi.EventManager.emit('resize');
    gi.scale = 1;
    const winSize = cc.winSize;

    const gameCointainerSize: cc.Size = new cc.Size(990, 1320);

    const boardWrapPos = cc.v2(0, 110.042);

    this.boardWrap.setPosition(boardWrapPos);

    this.boardWrap.scale = this.chunkArea.scale = this.rotateCheck.scale = this.scoreBg.scale = gi.scale;

    this.chunkArea.width = 990;
    this.chunkArea.height = 300;
    this.chunkArea.children.forEach((area, index) => {
      const beginX = this.chunkArea.width / 2;
      area.width = (this.chunkArea.width - 90) / 3;
      area.height = this.chunkArea.height;
      area.x = -beginX + area.width / 2 + area.width * index + 30 * index;
      area.y = 0;
    });

    const chunkAreaPos = cc.v2(0, -611.372);
    const rotateCheckPos = cc.v2(-350.121, 723.554);
    const scoreBgPos = cc.v2(337.422, 728.124);

    this.chunkArea.setPosition(chunkAreaPos);
    this.rotateCheck.setPosition(rotateCheckPos);
    this.scoreBg.setPosition(scoreBgPos);
  }
}
