import * as subscription1 from './subscription1';
import * as subscription6 from './subscription6';

const levelsId = {
  1: subscription1,
  6: subscription6
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

    gi.Event.on('run', this.run, this);
    gi.Event.emit('initSubcribed');
  }

  run(options: gi.SubscriptionOptions) {
    const func = this.subscriptionMap.get(options.key);
    if (func) {
      func.call(this, options);
    }
  }
}
