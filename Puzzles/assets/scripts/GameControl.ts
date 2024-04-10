const { ccclass, property } = cc._decorator;
import CellAreaControl from './CellAreaControl';

@ccclass
export default class NewClass extends cc.Component {
  @property(CellAreaControl)
  CellArea: CellAreaControl = null;

  onLoad() {
    this.CellArea.Init();
  }
}
