import { gi } from "../../@framework/gi";
import { DataModule } from "../../@framework/types/Data";
import Constant from "../gameplay/Constant";

export default class GlobalData implements DataModule {
  /** 游戏视窗节点 */
  private _gameView: cc.Node;
  /** 是否在开发 */
  private _debug: boolean;
  /** 游戏状态 */
  private _status: number = Constant.GAME_STATUS.PLAYING;
  /** 视窗触摸是否启用 */
  private _isTouchEnabled: boolean = true;

  constructor(debug: boolean) {
    this._debug = debug;

    gi.EventManager.on(
      Constant.EVENT.DISABLE_TOUCH,
      () => {
        this._isTouchEnabled = false;
      },
      this
    );

    gi.EventManager.on(
      Constant.EVENT.ENABLE_TOUCH,
      () => {
        this._isTouchEnabled = true;
      },
      this
    );
  }

  save() {
    return {};
  }

  load(data: any): void {}

  isTouchEnabled() {
    return this._isTouchEnabled;
  }

  /** 是否是debug模式 */
  isDebug(): boolean {
    return this._debug;
  }

  /** 游戏是否已经结束 */
  isEnd() {
    return this._status !== Constant.GAME_STATUS.PLAYING;
  }

  victory() {
    this._status = Constant.GAME_STATUS.VICTORY;
    gi.EventManager.emit(`${Constant.DATA_MODULE.GLOBAL}:updated`);
  }

  lose() {
    this._status = Constant.GAME_STATUS.LOSE;
    gi.EventManager.emit(`${Constant.DATA_MODULE.GLOBAL}:updated`);
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
