/** 奶奶动作1 */
export function woman1(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.1, { scaleY: 0.98 })
    .to(0.1, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

/** 奶奶动作2 */
export function woman2(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.6, { scaleY: 0.98 })
    .to(0.6, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

/** 奶奶动作3 */
export function woman3(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.6, { scaleY: 0.98 })
    .to(0.6, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

/** 小孩动作1 */
export function girl1(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.15, { scaleX: 0.98, scaleY: 1, angle: 0.5 })
    .to(0.15, { scaleX: 1, scaleY: 0.98, angle: -0.5 })
    .union()
    .repeatForever()
    .start();
}

/** 小孩动作2 */
export function girl2(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(1, { angle: 3 })
    .to(1, { angle: -3 })
    .union()
    .repeatForever()
    .start();
}

/** 小孩动作3 */
export function girl3(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(1, { angle: 3 })
    .to(1, { angle: -3 })
    .union()
    .repeatForever()
    .start();
}

/** 爷爷动作1 */
export function oldman1(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.1, { scaleX: 1, scaleY: 0.98, angle: -0.7 })
    .to(0.1, { scaleX: 0.98, scaleY: 1, angle: 0.7 })
    .union()
    .repeatForever()
    .start();
}

/** 爷爷动作2 */
export function oldman2(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.6, { scaleX: 1, scaleY: 0.98, angle: -0.7 })
    .to(0.6, { scaleX: 0.98, scaleY: 1, angle: 0.7 })
    .union()
    .repeatForever()
    .start();
}

/** 爷爷动作3 */
export function oldman3(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.6, { scaleY: 0.98 })
    .to(0.6, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}

/** 狗狗动作1 */
export function dog1(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.1, { scaleX: 1, scaleY: 0.98, angle: 0.7 })
    .to(0.1, { scaleX: 0.98, scaleY: 1, angle: -0.7 })
    .union()
    .repeatForever()
    .start();
}

/** 狗狗动作2 */
export function dog2(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(1, { angle: 1 })
    .to(1, { angle: -1 })
    .union()
    .repeatForever()
    .start();
}

/** 狗狗拿钱回来 */
export function dog3(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  const timeoutTrue = setInterval(() => {
    if (options.nodes[0].active) {
      const timeoutFalse = setInterval(() => {
        if (!options.nodes[0].active) {
          const originPos = options.target.getPosition();
          (cc.tween(options.target) as cc.Tween)
            .by(0.4, { position: cc.v2(400, 300) })
            .to(0.1, { scaleX: -1 })
            .to(0.4, { position: originPos })
            .call(() => {
              for (const node of options.nodes.slice(1)) {
                const nodePos = node.getPosition();
                node.setPosition(originPos);
                node.opacity = 0;
                node.setScale(0.5);
                node.active = true;
                (cc.tween(node) as cc.Tween).to(0.4, { position: nodePos, scale: 1, opacity: 255 }).start();
              }
            })
            .start();
          clearInterval(timeoutFalse);
        }
      });
      clearInterval(timeoutTrue);
    }
  });
}

/** 狗狗身体动作 */
export function dogBody(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.4, { angle: 1 })
    .to(0.4, { angle: -1 })
    .union()
    .repeatForever()
    .start();
}

/** 狗狗左手动作 */
export function dogLeftHand(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.4, { angle: 16 })
    .to(0.4, { angle: -1 })
    .union()
    .repeatForever()
    .start();
}

/** 狗狗右手动作 */
export function dogRightHand(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.4, { angle: 16 })
    .to(0.4, { angle: -1 })
    .union()
    .repeatForever()
    .start();
}

/** 狗狗扫把 */
export function broom(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.4, { angle: 16 })
    .to(0.4, { angle: -1 })
    .union()
    .repeatForever()
    .start();
}

/** 狗狗尾巴 */
export function tail(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  (cc.tween(options.target) as cc.Tween)
    .call(() => {})
    .to(0.1, { angle: 15 })
    .to(0.1, { angle: -15 })
    .union()
    .repeatForever()
    .start();
}

/** 狗狗遗照 */
export function dog4(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  const timeout = setInterval(() => {
    if (options.nodes[2].active) {
      const originPos = options.target.getPosition();
      const originIndex = options.target.getSiblingIndex();
      const startPos = options.nodes[0].convertToNodeSpaceAR(options.nodes[1].convertToWorldSpaceAR(cc.v2(0, 0)));
      options.target.setPosition(startPos);
      options.target.setSiblingIndex(-1);

      (cc.tween(options.target) as cc.Tween)
        .delay(0.1)
        .to(0.6, { position: originPos, angle: -360 * 3 }, { easing: 'smooth' })
        .call(() => {
          options.target.setSiblingIndex(originIndex);
        })
        .start();
      clearInterval(timeout);
    }
  });
}

/** 女孩遗照 */
export function girl4(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  const timeout = setInterval(() => {
    if (options.nodes[2].active) {
      const originPos = options.target.getPosition();
      const originIndex = options.target.getSiblingIndex();
      const startPos = options.nodes[0].convertToNodeSpaceAR(options.nodes[1].convertToWorldSpaceAR(cc.v2(0, 0)));
      options.target.setPosition(startPos);
      options.target.setSiblingIndex(-1);

      (cc.tween(options.target) as cc.Tween)
        .delay(0.1)
        .to(0.6, { position: originPos, angle: -360 * 3 }, { easing: 'smooth' })
        .call(() => {
          options.target.setSiblingIndex(originIndex);
        })
        .start();
      clearInterval(timeout);
    }
  });
}

/** 奶奶遗照 */
export function woman4(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  const timeout = setInterval(() => {
    if (options.nodes[2].active) {
      const originPos = options.target.getPosition();
      const originIndex = options.target.getSiblingIndex();
      const startPos = options.nodes[0].convertToNodeSpaceAR(options.nodes[1].convertToWorldSpaceAR(cc.v2(0, 0)));
      options.target.setPosition(startPos);
      options.target.setSiblingIndex(-1);

      (cc.tween(options.target) as cc.Tween)
        .delay(0.1)
        .to(0.6, { position: originPos, angle: -360 * 3 }, { easing: 'smooth' })
        .call(() => {
          options.target.setSiblingIndex(originIndex);
        })
        .start();
      clearInterval(timeout);
    }
  });
}

/** 爷爷遗照 */
export function oldman4(options: gi.SubscriptionOptions) {
  options.target.stopAllActions();

  const timeout = setInterval(() => {
    if (options.nodes[2].active) {
      const originPos = options.target.getPosition();
      const originIndex = options.target.getSiblingIndex();
      const startPos = options.nodes[0].convertToNodeSpaceAR(options.nodes[1].convertToWorldSpaceAR(cc.v2(0, 0)));
      options.target.setPosition(startPos);
      options.target.setSiblingIndex(-1);

      (cc.tween(options.target) as cc.Tween)
        .delay(0.1)
        .to(0.6, { position: originPos, angle: -360 * 3 }, { easing: 'smooth' })
        .call(() => {
          options.target.setSiblingIndex(originIndex);
        })
        .start();
      clearInterval(timeout);
    }
  });
}
