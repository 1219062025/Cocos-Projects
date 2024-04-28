import { Unit, UnitType, UnitInfoMap } from './Config/Game';
import UnitControl from './UnitControl';
const { ccclass, property } = cc._decorator;

@ccclass
export default class AdornUnit extends UnitControl {
  Init(type: number, row: number, col: number) {
    this.InitUnit(type, row, col);

    const UnitInfo = UnitInfoMap.get(type);

    cc.loader.loadRes(`Unit/${UnitInfo.path}_`, cc.SpriteFrame, (err, res) => {
      if (err) return new Error(`${row + 1}行${col + 1}列的Adorn单位加载资源失败`);
      const sprite = this.node.getComponent(cc.Sprite);
      sprite.spriteFrame = res;

      const offsetY = this.node.height * 0.4 * this.node.scaleY;
      this.node.setPosition(this.node.x, this.node.y + offsetY);
    });
  }
}
