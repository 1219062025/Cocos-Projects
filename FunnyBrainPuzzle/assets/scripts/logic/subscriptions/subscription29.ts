/** 腿摇摆 */
export function leg(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(0.5, { angle: 8 })
    .to(0.5, { angle: 0 })
    .union()
    .repeatForever()
    .start();
}

/** 慢速待机 */
export function idle(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(0.8, { scaleY: 0.98 })
    .to(0.8, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

/** 快速待机 */
export function idleFast(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(0.1, { scaleY: 0.98 })
    .to(0.1, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

export function door(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.RIGHT }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    options.nodes[2].active = true;
  });
}
