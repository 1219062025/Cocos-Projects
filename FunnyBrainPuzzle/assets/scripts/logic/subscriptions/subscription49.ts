/** 开门 */
export function door(options: gi.SubscriptionOptions) {
  options.target.once(cc.Node.EventType.TOUCH_END, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;

    gi.completedAction("4");
  });
}
/** 开窗 */
export function window(options: gi.SubscriptionOptions) {
  options.target.once(cc.Node.EventType.TOUCH_END, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
  });
}
