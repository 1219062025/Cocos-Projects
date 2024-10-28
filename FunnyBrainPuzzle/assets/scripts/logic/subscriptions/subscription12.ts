/** 床尾 */
export function tailstock(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.UP }, () => {
    options.nodes[0].active = false;
    options.nodes[1].active = true;
    options.nodes[2].active = true;
  });
}

/** 打开衣柜 */
export function wardrobe(options: gi.SubscriptionOptions) {
  options.target.once(cc.Node.EventType.TOUCH_START, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    gi.completedAction('4');
  });
}

/** 打开门 */
export function door(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.LEFT }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    gi.completedAction('5');
  });
}

/** 床边的箱子 */
export function box(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.UP }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    gi.completedAction('6');
  });
}
