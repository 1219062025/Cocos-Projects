import ResControl from "./resControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResAreaControl extends cc.Component {
  /** 整个游戏区域 */
  @property({ type: cc.Node, tooltip: "整个游戏区域" })
  wrap: cc.Node = null;

  /** 当前选中的资源 */
  curRes: ResControl = null;

  /** 当前选中的资源源位置 */
  curResOriPos: cc.Vec2 = cc.v2(0, 0);

  /** 当前选中的资源源父节点 */
  curResOriParent: cc.Node = null;

  /** 当前选中的资源源层级 */
  curResOriIndex: number = 0;

  /** 所有资源节点 */
  children: cc.Node[] = [];

  onLoad() {
    gi.Event.on("touchStartRes", this.onTouchStart, this);
    gi.Event.on("touchMoveRes", this.onTouchMove, this);
    gi.Event.on("touchEndRes", this.onTouchEnd, this);
    gi.Event.on("initRes", this.onInitRes, this);
    gi.Event.on("removeRes", this.onRemoveRes, this);
  }

  onInitRes(node: cc.Node) {
    this.children.push(node);

    this.children.sort((aNode, bNode) => {
      const a = aNode.getComponent(ResControl);
      const b = bNode.getComponent(ResControl);

      if (a.siblingIndex < b.siblingIndex) {
        return -1;
      } else if (a.siblingIndex > b.siblingIndex) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  onRemoveRes(node: cc.Node) {
    if (cc.isValid(node)) {
      const index = this.children.findIndex((value) => value === node);
      if (index !== -1) {
        this.children.splice(index, 1);
      }
    }
  }

  onTouchStart({
    event,
    res,
  }: {
    event: cc.Event.EventTouch;
    res: ResControl;
  }) {
    if (this.curRes) return;

    const _curResNode = res.unique
      ? res.node
      : this.getEffectiveResNode(res.tags);
    if (_curResNode) {
      this.setCurRes(_curResNode.getComponent(ResControl));

      gi.Event.emit("touchStart", event);
    }
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (!this.curRes) return;

    const touchPos = event.getLocation();
    const pos = this.node.convertToNodeSpaceAR(touchPos);
    this.curRes.node.setPosition(pos);

    if (this.curRes.displayNode) {
      this.curRes.displayNode.setPosition(pos);
    }

    gi.Event.emit("touchMove", event);
  }

  onTouchEnd(event: cc.Event.EventTouch) {
    if (!this.curRes) return;

    gi.Event.emit("touchEnd", event);
  }

  /** 获取指定tags一个还可以拖动的资源节点 */
  getEffectiveResNode(tags: number[]) {
    const copyArray = this.children.slice();
    const _curResNode = copyArray.reverse().find((resNode) => {
      return (
        cc.isValid(resNode) &&
        resNode.active &&
        gi.Utils.hasIntersection(resNode.getComponent(ResControl).tags, tags)
      );
    });
    return _curResNode;
  }

  /** 获取一个还可以拖动的资源节点 */
  getRandomEffectiveResNode() {
    const copyArray = this.children.slice();
    const _curResNode = copyArray
      .reverse()
      .find((resNode) => cc.isValid(resNode) && resNode.active);
    return _curResNode;
  }

  /** 设置选中的资源 */
  setCurRes(res: ResControl) {
    this.curRes = res;
    this.curResOriPos = this.curRes.node.getPosition();
    this.curResOriParent = this.curRes.node.getParent();
    this.curResOriIndex = this.curRes.node.getSiblingIndex();

    this.curRes.node.setParent(this.wrap);
    const worldPos = this.curRes.node.convertToWorldSpaceAR(cc.v2(0, 0));
    this.curRes.node.setPosition(this.wrap.convertToNodeSpaceAR(worldPos));

    if (this.curRes.displayNode) {
      this.curRes.node.opacity = 0;

      this.curRes.displayNode.setParent(this.wrap);
      this.curRes.displayNode.active = true;
      this.curRes.displayNode.setPosition(
        this.wrap.convertToNodeSpaceAR(worldPos)
      );
    }
  }

  /** 销毁当前选中的资源 */
  destroyCurRes() {
    if (cc.isValid(this.curRes.node)) {
      const index = this.children.findIndex(
        (value) => this.curRes.node === value
      );
      if (index !== -1) {
        this.children.splice(index, 1);
      }

      this.node.removeChild(this.curRes.node);
      this.curRes.node.destroy();
      if (this.curRes.displayNode) this.curRes.displayNode.destroy();
      this.curResOriPos = cc.v2(0, 0);
      this.curResOriParent = null;
      this.curResOriIndex = 0;
      this.curRes = null;
      if (this.children.length === 0) {
        gi.Event.emit("notHaveRes");
      }
    }
  }

  /** 取消选中的资源 */
  cancleCurRes() {
    if (cc.isValid(this.curRes.node)) {
      this.curRes.node.setParent(this.curResOriParent);
      const worldPos = this.curRes.node.convertToWorldSpaceAR(cc.v2(0, 0));
      this.curRes.node.setPosition(
        this.curResOriParent.convertToNodeSpaceAR(worldPos)
      );

      if (this.curRes.displayNode) {
        this.curRes.displayNode.setParent(this.curResOriParent);
        this.curRes.displayNode.setPosition(
          this.curResOriParent.convertToNodeSpaceAR(worldPos)
        );
      }

      const aniNode = this.curRes.displayNode || this.curRes.node;

      (cc.tween(aniNode) as cc.Tween)
        .to(0.2, { position: this.curResOriPos })
        .call(() => {
          this.curRes.node.setSiblingIndex(this.curResOriIndex);
          if (this.curRes.displayNode) {
            this.curRes.node.setPosition(this.curResOriPos);
            this.curRes.displayNode.setSiblingIndex(this.curResOriIndex);
            this.curRes.displayNode.active = false;
            this.curRes.node.opacity = 255;
          }

          this.curResOriPos = cc.v2(0, 0);

          this.curRes = null;
        })
        .start();
    }
  }
}
