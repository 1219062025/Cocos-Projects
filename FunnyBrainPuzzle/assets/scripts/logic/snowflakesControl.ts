const { ccclass, property } = cc._decorator;

@ccclass
export default class SnowflakeEffect extends cc.Component {
  material: cc.Material = null;

  private time: number = 0;

  protected onLoad(): void {
    this.material = this.getComponent(cc.Sprite).getMaterial(0);
    this.time = Number(this.material.getProperty('iTime', 0));
  }

  update(dt: number) {
    this.time += dt;
    if (this.material) {
      this.material.setProperty('iTime', this.time);
    }
  }
}
