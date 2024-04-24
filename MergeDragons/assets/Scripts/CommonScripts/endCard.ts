/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-11-30 11:34:39
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-11-30 15:13:35
 * @FilePath: \Dots\assets\scripts\v3\endCard.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// import EventManager from "../../../../eazax-ccc/EventManager";
import EventManager from './EventManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ENDCARD extends cc.Component {
  @property(cc.Node)
  content: cc.Node = null;

  protected onLoad(): void {
    EventManager.on('LANDSCAPE', this.landscape, this);
    EventManager.on('PORTRAIT', this.portrait, this);
  }

  start() {
    let scale = this.adapt();
    // this.rotateLight()
    this.content.scale = 0;
    cc.tween(this.content)
      .to(0.3, { scale: scale + 0.2 })
      .to(0.2, { scale: scale })
      .start();
  }

  landscape() {
    this.content.scale = this.adapt();
    // cc.log("landscape", this.node.scale);
  }

  portrait() {
    this.content.scale = this.adapt();
    // cc.log("portrait", this.node.scale);
  }

  adapt(): number {
    const winSize = cc.winSize;
    let scale = 1;
    // if (winSize.width > winSize.height) {
    //     scale = winSize.height / (this.node.height + 180);
    // }
    // cc.log(winSize.height, this.node.height)
    // cc.log("scale", scale)
    return scale;
  }

  // update (dt) {}
}
