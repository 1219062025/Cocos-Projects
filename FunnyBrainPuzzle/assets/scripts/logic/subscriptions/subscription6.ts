let inTV2 = false;
export function openTV(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  options.target.once(
    cc.Node.EventType.TOUCH_START,
    () => {
      options.target.active = false;
      options.nodes[0].active = true;
      options.nodes[1].active = true;
      inTV2 = true;
    },
    options.target
  );
}

export function changeTV(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  options.target.once(
    cc.Node.EventType.TOUCH_START,
    () => {
      if (inTV2) {
        options.target.off(cc.Node.EventType.TOUCH_START);
        options.target.active = false;
        options.nodes[0].active = false;
        options.nodes[1].active = true;
        options.nodes[2].active = false;
        options.nodes[3].active = true;
      }
    },
    options.target
  );
}

export function openDoor(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.RIGHT }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
  });
}

export function openToiletWindow(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.UP }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    options.nodes[2].active = true;
    gi.Event.emit('showTips', 'wcwindow');
  });
}

export function openWindow(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  options.target.once(cc.Node.EventType.TOUCH_START, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    options.nodes[2].active = true;
    options.nodes[3].active = true;
    options.nodes[4].active = true;
  });
}
