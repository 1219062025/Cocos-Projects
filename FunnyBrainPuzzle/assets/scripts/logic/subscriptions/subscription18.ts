/** 背景移动 */
export function background(options: gi.SubscriptionOptions) {
  /** 背景节点 */
  const backgroundNode = options.target;
  /** 天空 */
  const sky = options.nodes[0];
  /** 高楼 */
  const house = options.nodes[1];
  /** 道路 */
  const road = options.nodes[2];
  /** 绿化带 */
  const greenbelt = options.nodes[3];

  const tempCom = backgroundNode.addComponent(cc.Component);
  const wrap = cc.find('Canvas/wrap');
 
  tempCom.schedule((dt: number) => {
    sky.x -= 50 * dt;
    house.x -= 500 * dt;
    road.x -= 5000 * dt;
    greenbelt.x -= 3000 * dt;
    if (sky.x <= -wrap.width) {
      sky.x = 0;
    }
    if (house.x <= -wrap.width) {
      house.x = 0;
    } 
    if (road.x <= -wrap.width) {
      road.x = 0;
    }
    if (greenbelt.x <= -wrap.width) {
      greenbelt.x = 0;
    }
  }, 0);

  backgroundNode['tempCom'] = tempCom;
}

/** 轮胎转动 */
export function tireRotate(options: gi.SubscriptionOptions) {
  const angleClockwise = (cc.tween(options.target) as cc.Tween).by(0.1, { angle: -90 }).union().repeatForever();

  angleClockwise.start();
}

/** 火焰喷发 */
export function fire(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween).to(0.1, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 1, scaleY: 1 }).union().repeatForever().start();
}

/** 陨石火焰 */
export function aerolite(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween).to(0.1, { scaleY: 0.9 }).to(0.1, { scaleY: 1 }).union().repeatForever().start();
}

/** 上滑打开后备箱 */
export function openTrunk(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.UP }, () => {
    gi.completedAction('5');
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    options.nodes[2].active = true;
  });
}

/** 下滑腿 脚刹 */
export function brake(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.BOTTOM }, () => {
    /** 腿 */
    const leg = options.nodes[0];
    /** 脚刹时的火星 */
    const spark = options.nodes[1];

    options.target.active = false;
    leg.active = true;
    spark.active = true;

    (cc.tween(leg) as cc.Tween).to(0.12, { angle: 1 }).to(0.12, { angle: -1 }).union().repeatForever().start();

    (cc.tween(spark) as cc.Tween)
      .to(0.12, { scale: 0.8, opacity: 255 * 0.6, angle: 5, position: cc.v2(spark.x + 10, spark.y + 10) })
      .to(0.12, { scale: 1, opacity: 255, angle: 0, position: cc.v2(spark.x, spark.y) })
      .union()
      .repeatForever()
      .start();
    gi.Event.emit('score', 1);
    gi.Event.emit('moderate', 100);
    gi.Event.emit('showTips', '2');
  });
}

/** 打开火箭窗口 */
export function openWindow(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.LEFT }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
  });
}
