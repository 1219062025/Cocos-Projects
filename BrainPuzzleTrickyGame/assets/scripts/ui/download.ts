const { ccclass, property } = cc._decorator;

@ccclass
export default class DownLoad extends cc.Component {
  scaleTime: number = 0.6;

  onLoad() {
    this.scaleTween();
  }

  scaleTween() {
    cc.tween(this.node)
      .by(this.scaleTime, { scale: 0.1 })
      .by(this.scaleTime, { scale: -0.1 })
      .union()
      .repeatForever()
      .start();
  }

  Download() {
    try {
      // @ts-ignore
      linkToStore();
    } catch (error) {
      console.log(error);
    }
  }
}
