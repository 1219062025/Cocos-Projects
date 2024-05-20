import EventManager from './CommonScripts/EventManager';
import { Unit, UnitType, UnitInfoMap } from './Config/Game';
const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
export default class UnitControl extends cc.Component {
  @property({ type: cc.Sprite, tooltip: '单位Unit负责渲染图片的Sprite节点' })
  Sprite: cc.Sprite = null;

  @property({ type: cc.Prefab, tooltip: '单位Unit合并时升级动画预制体' })
  MergePrefab: cc.Prefab = null;

  /** Unit的id */
  id: number = Infinity;
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
  fixedWidth: number = 80; // 固定宽度
  /** 当前Unit是否处于贴近缓动动画中 */
  InTweenAdjoin: boolean = false;
  /** 当前Unit在贴近缓动动画前的源位置 */
  OriginPosition: cc.Vec2 = null;

  /** 初始化Unit */
  Init(type: number, row: number, col: number, level?: number, isMerge?: boolean) {
    const UnitInfo = UnitInfoMap.get(type);
    this.id = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    this.row = row;
    this.col = col;
    this.type = type;
    this.level = level;
    this.unitType = UnitInfo.unitType;
    this.maxLevel = UnitInfo.maxLevle;

    this.SetSprite();
    if (isMerge) this.Upgrades();
    this.onTouch();
  }

  SetSprite() {
    const UnitInfo = UnitInfoMap.get(this.type);
    const path = this.unitType === UnitType.Item ? `Unit/${UnitInfo.path}_${this.level || 0}` : `Unit/${UnitInfo.path}_`;

    cc.loader.loadRes(path, cc.SpriteFrame, (err, res) => {
      if (err) return new Error(`${this.row + 1}行${this.col + 1}列的单位加载资源失败`);
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
      this.Sprite.node.setPosition(0, offsetY);

      this.node.zIndex = this.row + 10;
    });
  }

  /** 设置Unit的层级 */
  SetZIndex(value: number) {
    this.node.zIndex = value + 10;
  }

  /** 缓动设置Unit的位置 */
  TweenSetUnitNodePosition(position: cc.Vec2) {
    return (cc.tween(this.node) as cc.Tween).to(0.12, { position: cc.v2(position.x, position.y) }).start();
  }

  /** 缓动贴近目标位置 */
  TweenAdjoinToPos(position: cc.Vec2) {
    if (this.InTweenAdjoin) return;
    this.InTweenAdjoin = true;
    this.OriginPosition = this.node.getPosition();
    /** 贴近目标位置1/4的距离（因为所有向量的起点是原点，所以不是简单的向量减法后缩放就可以得出1/4距离的向量） */
    const TargetPos = position.mul(1 / 4).add(this.node.getPosition().mul(3 / 4));
    (cc.tween(this.node) as cc.Tween).to(0.6, { position: TargetPos }).tag(this.id).start();
  }

  /** 取消缓动贴近目标位置 */
  CancelTweenAdjoinToPos() {
    this.InTweenAdjoin = false;
    if (this.OriginPosition) {
      cc.Tween.stopAllByTag(this.id);
      this.node.setPosition(this.OriginPosition);
    }
  }

  Upgrades() {
    const MergeAnimationNode = cc.instantiate(this.MergePrefab);
    MergeAnimationNode.setParent(this.node);
    MergeAnimationNode.setPosition(this.Sprite.node.getPosition());
    const MergeAnimation = MergeAnimationNode.getComponent(cc.Animation);
    MergeAnimation.play();
    MergeAnimation.on('finished', () => {
      MergeAnimationNode.destroy();
    });
  }

  onTouch() {
    this.Sprite.node.on(
      cc.Node.EventType.TOUCH_START,
      (event: cc.Event.EventTouch) => {
        cc.tween(this.Sprite.node).to(0.12, { scale: 1.1 }).start();
        EventManager.emit('TouchStart', event, { row: this.row, col: this.col });

        /** ___DEBUG START___ */
        // const pointInNode = this.node.convertToNodeSpaceAR(event.getLocation());
        // /** 图片纹理矩形区域 */
        // const rect = this.Sprite.spriteFrame.getRect();
        // /** 图片纹理偏移量 */
        // const offset = this.Sprite.spriteFrame.getOffset();
        // const texture = this.Sprite.spriteFrame.getTexture();
        // const pointInRect = cc.v2(parseInt(`${pointInNode.x - offset.x + rect.width / 2}`), parseInt(`${pointInNode.y - offset.y + rect.height / 2}`));
        // const rt = new cc.RenderTexture();
        // rt.initWithSize(texture.width, texture.height);
        // // @ts-ignore
        // rt.drawTextureAt(texture, 0, 0);
        // // data就是这个texture的rgba值数组
        // let data = rt.readPixels(null, rect.x + pointInRect.x, rect.y + rect.height - pointInRect.y, 1, 1);
        // console.log(data[3] < 100);
        /** ___DEBUG END___ */
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
