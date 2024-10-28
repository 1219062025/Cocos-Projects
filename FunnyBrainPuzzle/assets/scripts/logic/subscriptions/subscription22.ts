/** 打开窗户 */
export function openWindow(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.LEFT }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    gi.completedAction('8');
  });
}

/** 单击大树落下苹果 */
export function tree(options: gi.SubscriptionOptions) {
  options.target.once(cc.Node.EventType.TOUCH_START, () => {

    const apple = options.nodes[0]
          
    const originPos = apple.position;
    apple.active = true;
    apple.setPosition(originPos.x, originPos.y + 200);

    (cc.tween(apple) as cc.Tween).to(0.3, {position: originPos}, {easing: 'quadOut'}).start();
  }, this)
}

/** 左滑打开冰箱 */
export function fridge(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, {direction: gi.Swipe.Direction.LEFT}, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    options.nodes[2].active = true;
    options.nodes[3].active = true;
    gi.completedAction('13');
  })
}

/** 鱼 */
export function fish(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween).to(0.5, {angle: -3}).to(0.5, {angle: 3}).union().repeatForever().start();
}

/** 海草 */
export function seaweed(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween).to(0.8, {angle: 2}).to(0.8, {angle: -2}).union().repeatForever().start();
}