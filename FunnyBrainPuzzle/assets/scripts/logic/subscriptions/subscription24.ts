/** 打开窗户 */
export function openWindow(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.LEFT }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    options.nodes[2].active = true;
  });
}

/** 打开床头柜的抽屉 */
export function openCabinet(options: gi.SubscriptionOptions) {
  gi.Swipe.once(
    options.target,
    { direction: gi.Swipe.Direction.BOTTOM },
    () => {
      options.nodes[0].active = false;
      options.nodes[1].active = true;
      options.nodes[2].active = true;
    }
  );
}

/** 打开桌子的抽屉 */
export function openDesk(options: gi.SubscriptionOptions) {
  gi.Swipe.once(
    options.target,
    { direction: gi.Swipe.Direction.BOTTOM },
    () => {
      options.nodes[0].active = false;
      options.nodes[1].active = true;
      options.nodes[2].active = true;
    }
  );
}

/** 单击公鸡 */
export function chicken(options: gi.SubscriptionOptions) {
  options.target.on(cc.Node.EventType.TOUCH_END, () => {
    options.nodes[0].active = true;
    options.nodes[1].active = true;

    (cc.tween(options.nodes[0]) as cc.Tween)
      .by(0.1, { angle: -8 })
      .by(0.1, { angle: 8 })
      .union()
      .repeatForever()
      .start();
    (cc.tween(options.nodes[1]) as cc.Tween)
      .by(0.1, { angle: 8 })
      .by(0.1, { angle: -8 })
      .union()
      .repeatForever()
      .start();

    gi.Event.emit("sleepiness", 10);
    gi.Event.emit("rouse", options.target);
  });
}

/** 单击手机 */
export function phone(options: gi.SubscriptionOptions) {
  options.target.on(cc.Node.EventType.TOUCH_END, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    options.nodes[2].active = true;

    (cc.tween(options.nodes[0]) as cc.Tween)
      .by(0.1, { angle: -8 })
      .by(0.1, { angle: 8 })
      .union()
      .repeatForever()
      .start();
    (cc.tween(options.nodes[1]) as cc.Tween)
      .by(0.1, { angle: -8 })
      .by(0.1, { angle: 8 })
      .union()
      .repeatForever()
      .start();
    (cc.tween(options.nodes[2]) as cc.Tween)
      .by(0.1, { angle: 8 })
      .by(0.1, { angle: -8 })
      .union()
      .repeatForever()
      .start();

    gi.Event.emit("sleepiness", 10);
    gi.Event.emit("rouse", options.target);
    gi.completedAction("2");
  });
}

export function boy(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(1, { scaleY: 1.02 })
    .to(1, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

export function shake(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(1, { angle: -2 })
    .to(1, { angle: 2 })
    .union()
    .repeatForever()
    .start();
}
