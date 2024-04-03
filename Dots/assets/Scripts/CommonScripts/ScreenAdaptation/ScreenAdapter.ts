/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-11-28 11:34:10
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-11-30 16:22:26
 * @FilePath: \Dots\assets\scripts\common\eazax-ccc\ScreenAdapter.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// import { GameEvent } from "./core/GameEvent";
import EventManager from '../EventManager';

const { ccclass, executionOrder, help, menu } = cc._decorator;

@ccclass
@executionOrder(-1)
export default class ScreenAdapter extends cc.Component {
  /**
   * 生命周期：加载
   */
  protected onLoad() {
    this.init();
  }

  /**
   * 生命周期：组件启用
   */
  protected onEnable() {
    this.adapt();
  }

  /**
   * 初始化
   */
  protected init() {
    // 设置游戏窗口变化的回调（仅 Web 平台有效）
    cc.view.setResizeCallback(() => this.onResize());
  }

  /**
   * 窗口变化回调
   */
  protected onResize() {
    // 由于 setResizeCallback 只能设置一个回调
    // 使用事件系统发送一个特定事件，让其他组件也可以监听到窗口变化
    // 适配
    this.adapt();
    // cc.log("onResize")
    EventManager.emit('view-resize');
  }

  /**
   * 适配
   */
  protected adapt() {
    const winSize = cc.view.getFrameSize();
    // cc.log(winSize.width, winSize.height)
    if (winSize.width > winSize.height) {
      this.setFitHeight();
    } else {
      this.setFitWidth();
    }
  }

  /**
   * 适配高度模式，并通知所有横屏模式下需要变化的节点改变
   */
  protected setFitHeight() {
    const canvas = cc.Canvas.instance;
    canvas.fitHeight = true;
    canvas.fitWidth = false;
    cc.log('LANDSCAPE');
    EventManager.emit('LANDSCAPE');
  }

  /**
   * 适配宽屏模式，并通知所有竖屏模式下需要变化的节点改变
   */
  protected setFitWidth() {
    const canvas = cc.Canvas.instance;
    canvas.fitHeight = false;
    canvas.fitWidth = true;
    cc.log('PORTRAIT');
    EventManager.emit('PORTRAIT');
  }
}
