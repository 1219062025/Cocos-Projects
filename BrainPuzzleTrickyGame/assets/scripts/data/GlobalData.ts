import { gi } from "../../@framework/gi";
import { DataModule } from "../../@framework/types/Data";

export default class GlobalData implements DataModule {
  /** 游戏视窗节点 */
  private _gameView: cc.Node;
  /** 是否是debug模式 */
  private _debug: boolean;

  constructor(debug: boolean) {
    this._debug = debug;
  }

  save() {
    return {
      debug: this._debug,
    };
  }

  load(data: any): void {
    this._debug = data.debug;
  }

  isDebug(): boolean {
    return this._debug;
  }

  /** 获取游戏视窗节点 */
  getGameView(): cc.Node {
    return this._gameView;
  }

  /** 设置游戏视窗 */
  setGameView(view: cc.Node) {
    this._gameView = view;
  }
}
