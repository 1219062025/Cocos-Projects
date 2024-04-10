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
  @property(cc.Node)
  targetNode: cc.Node = null;

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
    this.bgsp = this.targetNode.getComponent(cc.Sprite);
    this.layout = this.targetNode.getComponent(cc.Layout);
    this.paylogo = this.targetNode.getChildByName('pay');
    this.labelNode = this.targetNode.getChildByName('label');
  }

  public isVertical() {
    this.changeSPF(this.bgsp, this.bg);
    this.targetNode.setContentSize(cc.size(680, 180));
    this.layout.type = cc.Layout.Type.HORIZONTAL;
    this.paylogo.y = 0;
    this.labelNode.y = 0;
    this.layout.resizeMode = cc.Layout.ResizeMode.NONE;
    this.layout.paddingLeft = this.layout.paddingRight = 10;
    this.layout.spacingX = 10;
  }

  public isHorizontal() {
    this.changeSPF(this.bgsp, this.bg_h);
    this.targetNode.setContentSize(cc.size(500, 360));
    this.layout.type = cc.Layout.Type.VERTICAL;
    this.paylogo.x = 0;
    this.labelNode.x = 0;
    this.layout.resizeMode = cc.Layout.ResizeMode.NONE;
    this.layout.paddingTop = this.layout.paddingBottom = 15;
    this.layout.spacingY = 100;
  }

  private changeSPF(sp: cc.Sprite, spf: cc.SpriteFrame) {
    sp.spriteFrame = spf;
  }
}
