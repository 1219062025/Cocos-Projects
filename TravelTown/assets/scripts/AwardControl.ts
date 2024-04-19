import { AwardType, TileWidth, TileHeight } from './Config/Game';
const { ccclass, property } = cc._decorator;

@ccclass
export default class AwardControl extends cc.Component {
  type: number = Infinity;

  Init(type: number, row: number, col: number, parent: cc.Node) {
    if (AwardType.has(type)) {
      this.type = type;
      const AwardInfo = AwardType.get(this.type);
      new Promise<void>(resolve => {
        cc.loader.loadRes(`${AwardInfo.value}`, cc.SpriteFrame, (err, res) => {
          if (err) return;
          this.node.setParent(parent);
          this.node.setPosition(this.GetTilePos(row, col));
          this.node.getComponent(cc.Sprite).spriteFrame = res;
          this.node.setContentSize(120, 120);
          resolve();
        });
      });
    }
  }

  Play() {
    const AwardInfo = AwardType.get(this.type);
    new Promise<void>(resolve => {
      cc.loader.loadRes(`${AwardInfo.value}`, cc.AnimationClip, (err, res) => {
        if (err) return;
        const Animation = this.node.getComponent(cc.Animation);
        Animation.addClip(res);
        Animation.play(AwardInfo.value);
        Animation.on('stop', this.onStop, this);
        resolve();
      });
    });
  }

  onStop() {
    this.node.destroy();
  }

  /** 获取指定行、列的TileNode的位置 */
  GetTilePos(row, col): cc.Vec2 {
    const BeginX = this.node.parent.x - this.node.parent.width / 2 + TileWidth / 2;
    const BeginY = this.node.parent.y + this.node.parent.height / 2 - TileHeight / 2;
    const targetX = BeginX + col * TileWidth;
    const targetY = BeginY - row * TileHeight;
    return cc.v2(targetX, targetY);
  }
}
