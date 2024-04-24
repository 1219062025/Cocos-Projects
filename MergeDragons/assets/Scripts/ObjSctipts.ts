const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class ObjControl extends cc.Component {
  protected onLoad(): void {
    this.node.zIndex = 100;
  }
  Init() {
    this.node.zIndex = 100;
  }
}
