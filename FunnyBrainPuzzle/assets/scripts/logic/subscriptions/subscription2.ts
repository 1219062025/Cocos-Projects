/** 宝宝待机 */
export function idle(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(0.8, { scaleY: 0.95 })
    .to(0.8, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

/** 女人待机 */
export function idleWoman(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(1.2, { scaleY: 0.99 })
    .to(1.2, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

/** 水流 */
export function watercolumn(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(0.1, { scaleX: 0.8 })
    .to(0.1, { scaleX: 1 })
    .union()
    .repeatForever()
    .start();

  const node1 = options.nodes[0];
  const node2 = options.nodes[1];

  const startY = options.target.height;
  const endY = -options.target.height;

  cc.director.on(
    cc.Director.EVENT_AFTER_UPDATE,
    () => {
      node1.y -= 10;
      if (node1.y <= endY) {
        node1.y = startY;
      }
      node2.y -= 10;
      if (node2.y <= endY) {
        node2.y = startY;
      }
    },
    this
  );
}

export function splash(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(0.1, { scaleX: 0.8 })
    .to(0.1, { scaleX: 1 })
    .union()
    .repeatForever()
    .start();
}
