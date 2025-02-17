import InstanceBase from "../../../@framework/common/InstanceBase";
import { gi } from "../../../@framework/gi";
import Constant from "../Constant";
import Guide from "./Guide";

/** 引导器信息 */
interface GuideInfo {
  guide: Guide;
  /** 是否已经完成了该引导 */
  isCompleted: boolean;
}

class GuideManager extends InstanceBase {
  private _guides: Map<string, GuideInfo> = new Map();
  /** 当前运行的引导器 */
  private _currentGuide: Guide | null = null;
  private _timeout: any;

  constructor() {
    super();
  }

  init() {
    gi.EventManager.on(Constant.EVENT.START_GUIDE, this.onGameTouchEnd, this);
    gi.EventManager.on(Constant.EVENT.COMPLETE_GUIDE, this.completeGuide, this);

    gi.EventManager.on(
      Constant.EVENT.GAME_TOUCH_START,
      this.onGameTouchStart,
      this
    );

    gi.EventManager.on(
      Constant.EVENT.GAME_TOUCH_CANCEL,
      this.onGameTouchEnd,
      this
    );

    gi.EventManager.on(
      Constant.EVENT.GAME_TOUCH_END,
      this.onGameTouchEnd,
      this
    );
  }

  /** 注册引导器 */
  register(guide: Guide) {
    if (!this._guides.has(guide.id)) {
      this._guides.set(guide.id, { guide, isCompleted: false });
    } else {
      console.warn(`[GuideManager] Duplicate guide ID '${guide.id}'.`);
    }
  }

  /** 运行引导器 */
  private startGuide() {
    if (this._currentGuide) return;

    const guide = this.getHighestPriorityGuide();

    if (guide) {
      this._currentGuide = guide;
      this._currentGuide.run();
    }
  }

  /** 完成某个引导引导器 */
  private completeGuide(id: string) {
    const info = this._guides.get(id);
    if (info) {
      info.guide.pause();
      info.isCompleted = true;
    }
    this._currentGuide = null;
  }

  /** 获取优先级最高且未完成的引导器 */
  private getHighestPriorityGuide(): Guide | null {
    let highestPriorityGuide: Guide | null = null;

    this._guides.forEach((info) => {
      if (!info.isCompleted && info.guide.isNormal()) {
        if (
          !highestPriorityGuide ||
          info.guide.priority > highestPriorityGuide.priority
        ) {
          highestPriorityGuide = info.guide;
        }
      }
    });

    return highestPriorityGuide;
  }

  private onGameTouchStart() {
    this._timeout && clearTimeout(this._timeout);
    if (this._currentGuide) {
      this._currentGuide.pause();
      this._currentGuide = null;
    }
  }

  private onGameTouchEnd() {
    this._timeout && clearTimeout(this._timeout);
    this._timeout = setTimeout(
      this.startGuide.bind(this),
      Constant.GUIDING_INTERVAL * 1000
    );
  }
}

export default GuideManager.instance();
