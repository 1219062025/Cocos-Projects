import * as subscription1 from "./subscription1";
import * as subscription2 from "./subscription2";
import * as subscription3 from "./subscription3";
import * as subscription6 from "./subscription6";
import * as subscription8 from "./subscription8";
import * as subscription10 from "./subscription10";
import * as subscription12 from "./subscription12";
import * as subscription15 from "./subscription15";
import * as subscription17 from "./subscription17";
import * as subscription18 from "./subscription18";
import * as subscription22 from "./subscription22";
import * as subscription23 from "./subscription23";
import * as subscription24 from "./subscription24";
import * as subscription29 from "./subscription29";
import * as subscription48 from "./subscription48";
import * as subscription49 from "./subscription49";
import * as subscription50 from "./subscription50";
import * as subscription55 from "./subscription55";

const levelsId = {
  1: subscription1,
  2: subscription2,
  3: subscription3,
  6: subscription6,
  8: subscription8,
  10: subscription10,
  12: subscription12,
  15: subscription15,
  17: subscription17,
  18: subscription18,
  22: subscription22,
  23: subscription23,
  24: subscription24,
  29: subscription29,
  48: subscription48,
  49: subscription49,
  50: subscription50,
  55: subscription55,
};

export default class SubscriptionControl {
  /** 映射 */
  subscriptionMap: Map<string, Function> = new Map([]);

  /**
   * 订阅指定关卡的所有动作
   * @param id 关卡id
   */
  constructor(id: number) {
    const actions = levelsId[`${id}`];

    for (const key in actions) {
      if (Object.prototype.hasOwnProperty.call(actions, key)) {
        const func = actions[key];
        this.subscriptionMap.set(key, func);
      }
    }

    gi.Event.on("run", this.run, this);
    gi.Event.emit("initSubcribed");
    gi.initSubcribed = true;
  }

  run(options: gi.SubscriptionOptions) {
    const func = this.subscriptionMap.get(options.key);
    if (func) {
      func.call(this, options);
    }
  }
}
