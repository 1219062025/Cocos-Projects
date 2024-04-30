import EventManager from './CommonScripts/EventManager';
import { Unit, UnitType, UnitInfoMap } from './Config/Game';
const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
export default class UnitControl extends cc.Component {
  @property({ type: cc.Sprite, tooltip: '单位Unit负责渲染图片的Sprite节点' })
  Sprite: cc.Sprite = null;

  /** UnitNode的类别 */
  unitType: number = Infinity;
  /** Unit类别 */
  type: number = Infinity;
  /** UnitNode所处行 */
  _row: number = -1;
  get row() {
    return this._row;
  }
  set row(value: number) {
    this._row = value;
    this.node.zIndex = value;
  }
  /** UnitNode所处列 */
  col: number = -1;
  /** UnitNode的合成等级 */
  level: number = -1;
  /** 最大合成等级 */
  maxLevel: number = Infinity;
  /** 图片宽度 */
  fixedWidth: number = 100; // 固定宽度

  Init(type: number, row: number, col: number, level?: number) {
    const UnitInfo = UnitInfoMap.get(type);
    this.row = row;
    this.col = col;
    this.type = type;
    this.level = level;
    this.unitType = UnitInfo.unitType;
    this.maxLevel = UnitInfo.maxLevle;

    const path = this.unitType === UnitType.Item ? `Unit/${UnitInfo.path}_${level || 0}` : `Unit/${UnitInfo.path}_`;

    cc.loader.loadRes(path, cc.SpriteFrame, (err, res) => {
      if (err) return new Error(`${row + 1}行${col + 1}列的单位加载资源失败`);
      this.Sprite.spriteFrame = res;
      // 获取原始 Sprite 的尺寸
      let originalSize = res.getOriginalSize();
      let originalWidth = originalSize.width;
      let originalHeight = originalSize.height;
      // 计算新的高度
      let targetHeight = (originalHeight / originalWidth) * this.fixedWidth;
      // 设置新的尺寸
      this.node.width = this.Sprite.node.width = this.fixedWidth;
      this.node.height = this.Sprite.node.height = targetHeight;

      const anchorY = this.unitType === UnitType.Item ? 0.2 : 0.4;
      const offsetY = this.node.height * this.node.scaleY * anchorY;
      this.node.setPosition(this.node.x, this.node.y + offsetY);

      this.node.zIndex = this.row;

      this.Sprite.node.on(
        cc.Node.EventType.TOUCH_START,
        (event: cc.Event.EventTouch) => {
          EventManager.emit('TouchStart', event, { row: this.row, col: this.col });
        },
        this
      );
    });
  }

  SetUnitNodePosition(position: cc.Vec2) {
    this.node.setPosition(position);
    const anchorY = this.unitType === UnitType.Item ? 0.2 : 0.4;
    const offsetY = this.node.height * this.node.scaleY * anchorY;
    this.node.setPosition(this.node.x, this.node.y + offsetY);
  }

  GetPlotPos(row: number, col: number) {
    const RowPos = cc.v2(0, 0).add(cc.v2(40, -48)).multiply(cc.v2(row, row));
    const ColPos = cc.v2(-95, -20).mul(col);
    const TargetPos = RowPos.add(ColPos);
    return TargetPos;
  }
}
