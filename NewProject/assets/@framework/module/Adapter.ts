import EventManager from "../EventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Adapter extends cc.Component {
  onLoad() {
    EventManager.on("LANDSCAPE", this.landscape, this);
    EventManager.on("PORTRAIT", this.portrait, this);
  }

  protected landscape() {}

  protected portrait() {}
}
