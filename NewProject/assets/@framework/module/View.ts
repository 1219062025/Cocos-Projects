const { ccclass, property } = cc._decorator;

@ccclass
export default class View extends cc.Component {
  protected open() {}

  protected close() {}

  protected onEnable() {
    this.open();
  }

  protected onDisable() {
    this.close();
  }
}
