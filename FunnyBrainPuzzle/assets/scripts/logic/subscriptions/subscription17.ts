/** 分开树枝 */
export function branches(options: gi.SubscriptionOptions) {
  options.target.once(cc.Node.EventType.TOUCH_START, () => {
    options.target.active = false;

    options.nodes[0].active = true;
    options.nodes[1].active = true;
  });
}

/** 集合铃声 */
export function bell(options: gi.SubscriptionOptions) {
  options.target.once(cc.Node.EventType.TOUCH_START, () => {
    gi.Event.emit('score', 1);
    console.log(gi.score);
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    gi.Event.emit('setAnimation', 'Bell-1');

    (cc.tween(options.nodes[0]) as cc.Tween)
      .to(0.1, { angle: -5 })
      .to(0.1, { angle: 5 })
      .union()
      .repeat(10)
      .call(() => {
        options.nodes[0].active = false;
      })
      .start();
    (cc.tween(options.nodes[1]) as cc.Tween)
      .to(0.1, { angle: -5 })
      .to(0.1, { angle: 5 })
      .union()
      .repeat(10)
      .call(() => {
        options.nodes[1].active = false;
      })
      .start();
  });
}

/** 放出蜜蜂 */
export function beehive(options: gi.SubscriptionOptions) {
  options.target.once(cc.Node.EventType.TOUCH_START, () => {
    gi.Event.emit('score', 1);
    console.log(gi.score);
    gi.Event.emit('setAnimation', 'Beehive-1');
  });
}

/** 打开车尾箱 */
export function trunk(options: gi.SubscriptionOptions) {
  options.target.once(cc.Node.EventType.TOUCH_START, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
  });
}

/** 打开车门 */
export function carSeat(options: gi.SubscriptionOptions) {
  options.target.once(cc.Node.EventType.TOUCH_START, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
  });
}

/** 打开背包 */
export function bag(options: gi.SubscriptionOptions) {
  options.target.once(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
    options.target.active = false;
    options.nodes[0].active = true;
    event.stopPropagation();
  });
}
