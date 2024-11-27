import * as triggerOffCb2 from "./triggerOffCb2";
import * as triggerOffCb3 from "./triggerOffCb3";
import * as triggerOffCb8 from "./triggerOffCb8";
import * as triggerOffCb12 from "./triggerOffCb12";
import * as triggerOffCb15 from "./triggerOffCb15";
import * as triggerOffCb17 from "./triggerOffCb17";
import * as triggerOffCb18 from "./triggerOffCb18";
import * as triggerOffCb22 from "./triggerOffCb22";
import * as triggerOffCb23 from "./triggerOffCb23";
import * as triggerOffCb24 from "./triggerOffCb24";
import * as triggerOffCb29 from "./triggerOffCb29";
import * as triggerOffCb48 from "./triggerOffCb48";
import * as triggerOffCb49 from "./triggerOffCb49";
import * as triggerOffCb50 from "./triggerOffCb50";
import * as triggerOffCb55 from "./triggerOffCb55";
import * as triggerOffCb59 from "./triggerOffCb59";

const { ccclass, property } = cc._decorator;

const levelsId = {
  2: triggerOffCb2,
  3: triggerOffCb3,
  8: triggerOffCb8,
  12: triggerOffCb12,
  15: triggerOffCb15,
  17: triggerOffCb17,
  18: triggerOffCb18,
  22: triggerOffCb22,
  23: triggerOffCb23,
  24: triggerOffCb24,
  29: triggerOffCb29,
  48: triggerOffCb48,
  49: triggerOffCb49,
  50: triggerOffCb50,
  55: triggerOffCb55,
  59: triggerOffCb59,
};

/** 触发回调管理器 */
@ccclass
export default class TriggerOffCbManager {
  private static _instance: TriggerOffCbManager = null;

  public static get instance() {
    if (this._instance === null) {
      this._instance = new TriggerOffCbManager();
    }

    return this._instance;
  }

  /** 映射 */
  triggerOffCbMap: Map<string, Function> = new Map([]);

  /**
   * 记录指定关卡的所有触发器回调
   * @param id 关卡id
   */
  init(id: number) {
    const actions = levelsId[`${id}`];

    for (const key in actions) {
      if (Object.prototype.hasOwnProperty.call(actions, key)) {
        const func = actions[key];
        this.triggerOffCbMap.set(key, func);
      }
    }

    gi.Event.emit("initTriggerOffCb");
  }

  /** 调用回调 */
  call(options: gi.TriggerOffCbOptions) {
    const cb = this.triggerOffCbMap.get(options.key);

    if (cb) {
      cb.call(this, options);
    }
  }
}
