export function calendar(options: gi.SubscriptionOptions) {
  options.target.once(
    cc.Node.EventType.TOUCH_START,
    () => {
      gi.isClick = false;
      /** 大日历的动画组件 */
      const calendarBigAni = options.nodes[3].getComponent(cc.Animation);
      /** 圣诞老人节点 */
      const santaClausNode = options.nodes[4];
      /** 所有礼物的根节点 */
      const giftRoot = options.nodes[5];

      calendarBigAni.play();
      calendarBigAni.once("stop", async () => {
        options.target.active = false;
        options.nodes[2].active = true;
        calendarBigAni.node.active = false;

        options.nodes[0].active = false;
        options.nodes[1].active = true;

        santaClausNode.active = true;
        (cc.tween(santaClausNode) as cc.Tween)
          .by(0.5, { x: -500 })
          .call(() => {
            gi.Event.emit("showTips", "4");
            giftRoot.active = true;
            giftRoot.children.forEach((item) => {
              const oriPos = item.getPosition();
              const santaClausPos = giftRoot.convertToNodeSpaceAR(
                santaClausNode.convertToWorldSpaceAR(cc.v2(0, 0))
              );
              item.setPosition(santaClausPos);

              (cc.tween(item) as cc.Tween)
                .to(0.2, { position: oriPos })
                .start();
            });
            gi.isClick = true;
          })
          .start();
      });
    },
    this
  );
}

export function cabinet(options: gi.SubscriptionOptions) {
  gi.Event.emit("showTips", "1");
  gi.Swipe.once(
    options.target,
    { direction: gi.Swipe.Direction.BOTTOM },
    () => {
      options.target.active = false;
      options.nodes[0].active = true;
      options.nodes[1].active = true;
    },
    this
  );
}

export function idleFast(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(0.1, { scaleY: 0.98 })
    .to(0.1, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

export function idle(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(1, { scaleY: 0.98 })
    .to(1, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

function wait(delay: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
}
