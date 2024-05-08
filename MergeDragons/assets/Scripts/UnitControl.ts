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
  /** UnitNode在UnitNodes映射中所处行 */
  row: number = -1;
  /** UnitNode在UnitNodes映射中所处列 */
  col: number = -1;
  /** UnitNode的合成等级 */
  level: number = -1;
  /** 最大合成等级 */
  maxLevel: number = Infinity;
  /** 图片宽度 */
  fixedWidth: number = 100; // 固定宽度

  /** 初始化Unit */
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
      this.node.setPosition(this.node.x, this.node.y);
      const offsetY = this.node.height * this.node.scaleY * anchorY;
      this.Sprite.node.setPosition(this.Sprite.node.x, this.Sprite.node.y + offsetY);

      this.node.zIndex = this.row + 10;

      this.onTouch();
    });
  }

  /** 设置Unit的层级 */
  SetZIndex(value: number) {
    this.node.zIndex = value + 10;
  }
  /** 缓动设置Unit的位置，不用节点的setPosition方法是因为需要额外对子节点进行处理 */
  TweenSetUnitNodePosition(position: cc.Vec2) {
    cc.tween(this.node)
      .to(0.12, { position: cc.v2(position.x, position.y) })
      .start();
  }

  onTouch() {
    this.Sprite.node.on(
      cc.Node.EventType.TOUCH_START,
      (event: cc.Event.EventTouch) => {
        cc.tween(this.Sprite.node).to(0.12, { scale: 1.1 }).start();
        EventManager.emit('TouchStart', event, { row: this.row, col: this.col });
      },
      this
    );
    this.Sprite.node.on(
      cc.Node.EventType.TOUCH_END,
      (event: cc.Event.EventTouch) => {
        cc.tween(this.Sprite.node).to(0.12, { scale: 1 }).start();
      },
      this
    );
    this.Sprite.node.on(
      cc.Node.EventType.TOUCH_CANCEL,
      (event: cc.Event.EventTouch) => {
        cc.tween(this.Sprite.node).to(0.12, { scale: 1 }).start();
      },
      this
    );
  }
}
