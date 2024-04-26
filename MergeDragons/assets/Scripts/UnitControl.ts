import { Unit, UnitType, UnitInfoMap } from './Config/Game';
const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
export default class UnitControl extends cc.Component {
  type: number = Infinity;
  unitType: number = Infinity;
  row: number = -1;
  col: number = -1;

  InitUnit(type: number, row: number, col: number) {
    this.type = type;
    this.row = row;
    this.col = col;
  }

  GetPlotPos(row: number, col: number) {
    const RowPos = cc.v2(0, 0).add(cc.v2(40, -48)).multiply(cc.v2(row, row));
    const ColPos = cc.v2(-95, -20).mul(col);
    const TargetPos = RowPos.add(ColPos);
    return TargetPos;
  }
}
