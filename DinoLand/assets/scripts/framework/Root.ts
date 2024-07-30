import { _decorator, Component, Node } from 'cc';
import { AppConfig } from './AppConfig';
import { App } from './App';
const { ccclass, property } = _decorator;

@ccclass('Root')
export class Root extends Component {
  /** 游戏层根节点 */
  @property({
    type: Node,
    tooltip: '游戏层'
  })
  game: Node | null = null;

  /** 界面层根节点 */
  @property({
    type: Node,
    tooltip: '界面层'
  })
  gui: Node | null = null;

  /** 框架启动 */
  startup(config?: AppConfig) {
    App.startup(this, config, this.run, this);
  }

  protected run() {}
}
