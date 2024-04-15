const { ccclass, property } = cc._decorator;

@ccclass
export default class CellControl extends cc.Component {
  /** 格子是否处于锁定状态 */
  @property
  isLock: boolean = false;

  Init(type: number) {
    this.isLock = type === -1;
    const resUrl = this.isLock ? 'cellLock' : 'cell';
    cc.loader.loadRes(resUrl, cc.SpriteFrame, (err, res) => {
      if (err) return;
      this.node.getComponent(cc.Sprite).spriteFrame = res;
    });
  }
}
