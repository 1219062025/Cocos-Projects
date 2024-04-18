/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-11-30 15:19:23
 * @LastEditors: lizhanyao kevinlee599@163.com
 * @LastEditTime: 2023-12-04 15:11:32
 * @FilePath: \Dots\assets\scripts\v6\ScreenManagerV6.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// import EventManager from "../../../../eazax-ccc/EventManager";
// import changeOrientation from "./changeOrientation";

import EventManager from '../EventManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScreenChangePargressBarTop extends cc.Component {
  @property(cc.Node)
  RewardBanner: cc.Node = null;

  @property(cc.Node)
  AboutBanner: cc.Node = null;

  @property(cc.Node)
  GameContainer: cc.Node = null;

  @property(cc.Node)
  h_button: cc.Node = null;

  @property(cc.Node)
  h_aboutGame: cc.Node = null;

  onLoad() {
    EventManager.on('LANDSCAPE', this.landscape, this);
    EventManager.on('PORTRAIT', this.portrait, this);
  }

  start() {}

  landscape() {
    cc.log('landscape ScreenManagerV6');
    const winSize = cc.winSize;
    this.AboutBanner.active = false;
    this.h_aboutGame.active = this.h_button.active = true;

    this.GameContainer.setPosition(cc.v2(winSize.width / 4, 0));
    this.RewardBanner.setPosition(cc.v2(-winSize.width / 4, 0));
    this.h_aboutGame.setPosition(cc.v2(-winSize.width / 4, winSize.height / 2.8));
    this.h_button.setPosition(cc.v2(-winSize.width / 4, -winSize.height / 2.8));

    this.AboutBanner.setPosition(cc.v2(-winSize.width / 4, -winSize.height / 3));
    const GameCointainerSize: cc.Size = new cc.Size(720, 720);
    let scale = 1;
    let h = winSize.height / GameCointainerSize.height;
    let w = winSize.width / 2 / GameCointainerSize.width;
    scale = Math.min(h, w);

    this.GameContainer.scale = this.RewardBanner.scale = this.AboutBanner.scale = scale;
    this.h_aboutGame.scale = this.h_button.scale = scale;
  }

  portrait() {
    cc.log('portrait ScreenManagerV6');

    let scale = 1;
    const winSize = cc.winSize;
    this.AboutBanner.active = true;
    this.h_aboutGame.active = this.h_button.active = false;
    this.GameContainer.setPosition(cc.v2(0, 0));
    this.RewardBanner.setPosition(cc.v2(0, winSize.height / 2 - this.RewardBanner.height / 2 - 50));
    this.AboutBanner.setPosition(cc.v2(0, -winSize.height / 2 + this.RewardBanner.height / 2 + 50));
    this.GameContainer.scale = this.RewardBanner.scale = this.AboutBanner.scale = scale;
    this.h_aboutGame.scale = this.h_button.scale = scale;
  }
}
