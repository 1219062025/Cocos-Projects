import { _decorator, Component, Node } from 'cc';
import { Root } from './framework/Root';
import { AppConfig } from './framework/AppConfig';
const { ccclass, property } = _decorator;

/** 项目入口脚本 */
@ccclass('Main')
export class Main extends Root {
  start() {
    const config = new AppConfig();
    this.startup(config);
  }
}
