/** 背景移动 */
export async function background(options: gi.SubscriptionOptions) {
  /** 背景节点 */
  const backgroundNode = options.target;
  /** 山岳 */
  const mountain = options.nodes[0];
  /** 道路 */
  const river = options.nodes[1];
  const ground = options.nodes[2];

  const tempCom = backgroundNode.addComponent(cc.Component);
  const wrap = cc.find("Canvas/wrap");

  tempCom.schedule((dt: number) => {
    mountain.x -= 500 * dt;
    river.x -= 500 * dt;
    ground.x -= 500 * dt;
    if (mountain.x <= -mountain.width) {
      mountain.x = 0;
    }
    if (river.x <= -river.width) {
      river.x = 0;
    }
    if (ground.x <= -ground.width) {
      ground.x = 0;
    }
  }, 0);

  /** 开始剧情的小偷节点 */
  const theifStartNode = options.nodes[3];
  gi.isClick = false;

  theifStartNode.active = true;
  const theifStartAni = theifStartNode.getComponent(cc.Animation);
  gi.Event.emit("showTips", "1");

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2000);
  });

  theifStartAni.play();

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });

  gi.Event.emit("showTips", "2");

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
      gi.isClick = true;
    }, 2000);
  });

  gi.Event.on("score", () => {
    setTimeout(() => {
      if (gi.score === 11) {
        gi.isClick = false;

        /** 结尾剧情的小偷节点 */
        const theifEndNode = options.nodes[4];
        theifEndNode.active = true;
        const theifEndAni = theifEndNode.getComponent(cc.Animation);

        gi.Event.emit("showTips", "14");
        theifEndAni.play();
        theifEndAni.once("stop", () => {
          gi.Event.emit("clearance");
        });
      }
    });
  });
}

/** 铃铛 */
export function bell(options: gi.SubscriptionOptions) {
  gi.Swipe.once(
    options.target,
    { direction: gi.Swipe.Direction.UP },
    async () => {
      options.target.active = false;
      options.nodes[0].active = true;
      options.nodes[0].getComponent(cc.Animation).play();
      gi.Event.emit("showTips", "3");
      gi.completedAction("1");
      gi.playAudio();

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 2000);
      });
      gi.Event.emit("score", 1);
    }
  );
}

export function gift(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.UP }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
    options.nodes[2].active = true;
  });
}

/** 火焰喷发 */
export function fire(options: gi.SubscriptionOptions) {
  (cc.tween(options.target) as cc.Tween)
    .to(0.1, { scaleX: -0.9, scaleY: -0.9 })
    .to(0.1, { scaleX: -1, scaleY: -1 })
    .union()
    .repeatForever()
    .start();
}
