const { ccclass, property } = cc._decorator;

@ccclass
export default class SelectControl extends cc.Component {
  SetPosition(position: cc.Vec2) {
    this.node.setPosition(position);
  }
}
