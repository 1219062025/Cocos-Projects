import ResControl from '../res/resControl';

/** 背景移动 */
export function background(options: gi.SubscriptionOptions) {
  /** 背景节点 */
  const backgroundNode = options.target;
  /** 海洋 */
  const sea = options.nodes[0];

  const tempCom = backgroundNode.addComponent(cc.Component);
  const wrap = cc.find('Canvas/wrap');

  tempCom.schedule((dt: number) => {
    sea.x -= 200 * dt;
    if (sea.x <= -wrap.width) {
      sea.x = 0;
    }
  }, 0);

  gi.Event.on('score', () => {
    setTimeout(() => {
      if (gi.score === 12) {
        const sharkNode = cc.find('Canvas/wrap/sprite_node/Shark_node');
        const res = sharkNode.addComponent(ResControl);
        res.initRes();
        res.unique = true;
        res.tags[0] = 6;
      }
    });
  });

  backgroundNode['tempCom'] = tempCom;
}

export function wing(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween).by(0.1, { angle: -180 }).union().repeatForever().start();
}

/** 火焰喷发 */
export function fire(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween).to(0.1, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 1, scaleY: 1 }).union().repeatForever().start();
}

/** 水花 */
export function splash(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween).to(0.1, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 1, scaleY: 1 }).union().repeatForever().start();
}
