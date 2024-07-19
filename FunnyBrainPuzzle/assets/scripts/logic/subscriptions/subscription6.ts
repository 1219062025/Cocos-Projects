let canChangeTV = false;
/** 打开电视 */
export function openTV(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  options.target.once(
    cc.Node.EventType.TOUCH_START,
    () => {
      options.target.active = false;
      options.nodes[0].active = true;
      options.nodes[1].active = true;
      canChangeTV = true;
      gi.completedAction('clicktelevision');
    },
    options.target
  );
}

/** 换台 */
export function changeTV(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  options.target.on(
    cc.Node.EventType.TOUCH_START,
    () => {
      if (canChangeTV) {
        options.target.off(cc.Node.EventType.TOUCH_START);
        options.target.active = false;
        options.nodes[0].active = false;
        options.nodes[1].active = true;
        options.nodes[2].active = false;
        options.nodes[3].active = true;
        canChangeTV = false;
        gi.completedAction('clickbtn');
      }
    },
    options.target
  );
}

/** 打开门 */
export function openDoor(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.RIGHT }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    gi.completedAction('clickdoor');
  });
}

/** 打开厕所里面窗户 */
export function openToiletWindow(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.UP }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    options.nodes[2].active = true;
    gi.Event.emit('showTips', 'wcwindow');
    gi.completedAction('wcwindow');
  });
}

/** 打开客厅里的窗口 */
export function openWindow(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  options.target.once(cc.Node.EventType.TOUCH_START, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    options.nodes[2].active = true;
    options.nodes[3].active = true;
    options.nodes[4].active = true;
    gi.completedAction('clickwindow');
  });
}

/** 小狗动作 */
export function dog(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.6, { scaleY: 0.98 })
    .to(0.6, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

/** 小猫动作 */
export function cat1(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.6, { scaleX: 0.98 })
    .to(0.6, { scaleX: 1 })
    .union()
    .repeatForever()
    .start();
}

/** 男人动作 */
export function man(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.5, { scaleY: 0.99, angle: 0.5 })
    .to(0.5, { scaleY: 1, angle: -0.5 })
    .union()
    .repeatForever()
    .start();
}

/** 女人动作 */
export function woman(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.5, { scaleY: 0.98 })
    .to(0.5, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();

  const originPos = options.nodes[0].getPosition();
  (cc.tween(options.nodes[0]) as cc.Tween)
    .call(() => {
      options.nodes[0].setPosition(originPos);
      options.nodes[0].opacity = 255;
      options.nodes[0].setScale(1);
    })
    .to(0.7, { position: cc.v2(originPos.x + 30, originPos.y + 30), opacity: 0, scale: 0.5 })
    .union()
    .repeatForever()
    .start();
}

/** 衣架上宝宝摇晃 */
export function clip(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.8, { angle: 10 })
    .to(0.8, { angle: -15 })
    .union()
    .repeatForever()
    .start();
}

/** 跷跷板 */
export function seesaw(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.8, { angle: 5 })
    .to(0.8, { angle: -5 })
    .union()
    .repeatForever()
    .start();

  let timeoutRight = setInterval(() => {
    if (options.nodes[1].active) {
      options.target.stopAllActions();

      if (!options.nodes[0].active) {
        (cc.tween(options.target) as cc.Tween)
          .call(() => {})
          .to(0.8, { angle: -10 })
          .start();
        gi.completedAction('seesaw_right');
      } else {
        (cc.tween(options.target) as cc.Tween)
          .call(() => {})
          .to(0.8, { angle: -10 })
          .to(0.8, { angle: 10 })
          .union()
          .repeatForever()
          .start();
        gi.completedAction('seesaw');
        clearInterval(timeoutLeft);
      }
      clearInterval(timeoutRight);
    }
  });

  let timeoutLeft = setInterval(() => {
    if (options.nodes[0].active) {
      options.target.stopAllActions();

      if (!options.nodes[1].active) {
        (cc.tween(options.target) as cc.Tween)
          .call(() => {})
          .to(0.8, { angle: 10 })
          .start();
        gi.completedAction('seesaw_left');
      } else {
        (cc.tween(options.target) as cc.Tween)
          .call(() => {})
          .to(0.8, { angle: 10 })
          .to(0.8, { angle: -10 })
          .union()
          .repeatForever()
          .start();
        gi.completedAction('seesaw');
        clearInterval(timeoutRight);
      }
      clearInterval(timeoutLeft);
    }
  });
}

/** 马桶水动作 */
export function water(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.4, { scaleY: 0.9 })
    .to(0.4, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

/** 默认宝宝动作 */
export function defaultAction(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.6, { angle: 1 })
    .to(0.6, { angle: -1 })
    .union()
    .repeatForever()
    .start();
}

/** 小猫动作2 */
export function cat2(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.6, { scaleY: 0.98 })
    .to(0.6, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}
