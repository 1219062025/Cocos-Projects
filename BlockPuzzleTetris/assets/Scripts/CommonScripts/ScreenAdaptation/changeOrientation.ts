/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-11-30 11:16:51
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-11-30 15:22:59
 * @FilePath: \Dots\assets\scripts\changeOrientation.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import EventManager from '../EventManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class changeOrientation extends cc.Component {
  @property(cc.SpriteFrame)
  bg_h: cc.SpriteFrame = null;

  @property(cc.SpriteFrame)
  bg: cc.SpriteFrame = null;

  @property(cc.Sprite)
  pay1: cc.Sprite = null;

  @property(cc.Sprite)
  pay2: cc.Sprite = null;

  private bgsp: cc.Sprite = null;

  private paylogo: cc.Node = null;
  private labelNode: cc.Node = null;
  private layout: cc.Layout = null;

  onLoad() {
    this.bgsp = this.node.getComponent(cc.Sprite);
    this.layout = this.node.getComponent(cc.Layout);
    this.paylogo = this.node.getChildByName('pay');
    this.labelNode = this.node.getChildByName('label');
  }

  //   start() {
  //     this.AddEvent();
  //   }

  //   private AddEvent() {
  //     EventManager.on("LANDSCAPE", this.isHorizontal, this);
  //     EventManager.on("PORTRAIT", this.isVertical, this);
  //   }

  //   protected onDestroy(): void {
  //     this.RemoveEvent();
  //   }

  //   private RemoveEvent() {
  //     EventManager.off("LANDSCAPE", this.isHorizontal, this);
  //     EventManager.off("PORTRAIT", this.isVertical, this);
  //   }

  public isVertical() {
    this.changeSPF(this.bgsp, this.bg);
    this.paylogo.y = 0;
    this.labelNode.y = 0;
    this.node.setContentSize(cc.size(680, 180));
    this.layout.type = cc.Layout.Type.HORIZONTAL;
    this.layout.resizeMode = cc.Layout.ResizeMode.CHILDREN;
    this.layout.paddingLeft = this.layout.paddingRight = 10;
    this.layout.spacingX = 10;
  }

  public isHorizontal() {
    this.changeSPF(this.bgsp, this.bg_h);
    this.paylogo.x = 0;
    this.labelNode.x = 0;
    this.node.setContentSize(cc.size(500, 360));
    this.layout.type = cc.Layout.Type.VERTICAL;
    this.layout.resizeMode = cc.Layout.ResizeMode.CHILDREN;
    this.layout.paddingTop = this.layout.paddingBottom = 15;
    this.layout.spacingY = 10;
  }

  private changeSPF(sp: cc.Sprite, spf: cc.SpriteFrame) {
    sp.spriteFrame = spf;
  }
}
