import { gi } from "../../@framework/gi";
import { DataModule } from "../../@framework/types/Data";

export default class GlobalData implements DataModule {
  /** 游戏视窗节点 */
  private _gameView: cc.Node;

  constructor() {}

  save() {
    return {
      gameView: this._gameView,
    };
  }

  load(data: any): void {
    this._gameView = data.gameView;
  }

  /** 获取游戏视窗节点 */
  getGameView(): cc.Node {
    return this._gameView;
  }

  /** 设置游戏视窗 */
  setGameView(view: cc.Node) {
    this._gameView = view;
    gi.EventManager.emit("global:updated");
  }
}
