/** 游戏初始化 */
export function init(options: gi.SubscriptionOptions) {
  gi.Event.on('showFailPop1', (key: string) => {
    gi.Event.emit('showTips', key);

    setTimeout(() => {
      options.nodes[0].active = true;
      (cc.tween(options.nodes[0]) as cc.Tween)
        .to(1, { opacity: 255 })
        .call(() => {
          setTimeout(() => {
            gi.Event.emit('gameover');
          }, 1000);
        })
        .start();
    }, 2000);
  });
}

/** 打开窗户 */
export function openWindow(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.LEFT }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    options.nodes[2].active = true;
    gi.completedAction('openWindow');
  });
}

/** 对狗狗操作后惊醒杀手 */
export function touchDog(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  options.target.once(
    cc.Node.EventType.TOUCH_START,
    () => {
      options.target.getComponent(sp.Skeleton).setAnimation(0, 'Dog2', true);
      gi.Event.emit('showTips', '2');
      gi.Event.emit('showFailPop1', '10');
    },
    options.target
  );
}
