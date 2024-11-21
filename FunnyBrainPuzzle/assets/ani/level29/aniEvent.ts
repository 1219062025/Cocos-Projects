const { ccclass, property } = cc._decorator;

@ccclass
export default class AniEvent extends cc.Component {
  startMan() {
    const manNode = cc.find("Canvas/wrap/sprite_node/2/Man");
    const manAni = manNode.getComponent(cc.Animation);
    manAni.play();
    manAni.on("stop", () => {
      gi.Event.emit("curtain");
    });
  }
}
