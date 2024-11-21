export function window(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.RIGHT }, () => {
    gi.completedAction("3");
    options.target.active = false;
    options.nodes[0].active = true;
  });
}
export function picture(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.RIGHT }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
  });
}
export function bag(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.UP }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
  });
}
export function mouse(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(0.3, { scaleY: 0.98 })
    .to(0.3, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}
export function fire(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(0.1, { scaleX: 0.98, scaleY: 0.95 })
    .to(0.1, { scaleX: 1, scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}
