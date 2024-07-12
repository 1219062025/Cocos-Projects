/** 水滴下落 */
export function drop(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();
  const moveTarget = options.nodes[0];
  const originPos = options.target.getPosition();
  const pos = options.target.parent.convertToNodeSpaceAR(moveTarget.convertToWorldSpaceAR(cc.v2(0, 0)));

  (cc.tween(options.target) as cc.Tween)
    .call(() => {
      options.target.setPosition(originPos);
      options.target.opacity = 255;
      options.target.scale = 0;
    })
    .to(0.15, { scale: 1 })
    .to(0.4, { position: cc.v2(options.target.x, pos.y) })
    .to(0.2, { opacity: 255 * 0 })
    .union()
    .repeatForever()
    .start();
}

/** 老婆婆颤抖 */
export function woman(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {
      options.target.angle = 0;
    })
    .to(0.1, { angle: 5 })
    .to(0.1, { angle: -5 })
    .union()
    .repeatForever()
    .start();
}

/** 老爷爷颤抖 */
export function man(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {
      options.target.angle = 0;
    })
    .to(0.1, { angle: 1 })
    .to(0.1, { angle: -1 })
    .union()
    .repeatForever()
    .start();
}

/** 门开合 */
export function doorOpen(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.2, { scaleX: 0.5 })
    .to(0.2, { scaleX: 1 })
    .union()
    .repeatForever()
    .start();
}

/** 窗户开合 */
export function windowOpen(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.17, { scaleX: -0.5 })
    .to(0.17, { scaleX: 1 })
    .union()
    .repeatForever()
    .start();
}
