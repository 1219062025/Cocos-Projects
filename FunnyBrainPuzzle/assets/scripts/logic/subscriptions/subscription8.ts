export function standby(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(1, { scaleY: 0.98 })
    .to(1, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}
