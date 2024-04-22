const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  onLoad() {
    cc.director.getPhysicsManager().enabled = true;
    cc.Texture2D;
  }

  // update (dt) {}
}
