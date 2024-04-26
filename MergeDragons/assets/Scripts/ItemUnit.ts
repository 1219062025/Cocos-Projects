import { Unit, UnitType, UnitInfoMap } from './Config/Game';
import UnitControl from './UnitControl';
const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemUnit extends UnitControl {
  level: number = -1;
  maxLevel: number = Infinity;

  Init(type: number, row: number, col: number, level: number) {
    this.InitUnit(type, row, col);

    const UnitInfo = UnitInfoMap.get(type);
    this.level = level;
    this.maxLevel = UnitInfo.maxLevle;
    cc.loader.loadRes(`Unit/${UnitInfo.path}_${level}`, cc.SpriteFrame, (err, res) => {
      if (err) return new Error(`${row + 1}行${col + 1}列的Item单位加载资源失败`);
      const sprite = this.node.getComponent(cc.Sprite);
      sprite.spriteFrame = res;
    });
  }
}
