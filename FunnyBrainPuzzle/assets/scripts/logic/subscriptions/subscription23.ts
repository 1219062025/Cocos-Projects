var score = 0;
var targetScore = 6;
export function init(options: gi.SubscriptionOptions) {
  gi.Event.emit('showTips', '2');
}

//#region 第一组道具
/** 吹风机 */
export function Dryer(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 吹风机动画节点 */
    const dryerNode = options.nodes[2];
    dryerNode.active = true;
    (cc.tween(dryerNode) as cc.Tween)
      .to(0.2, { angle: 8 })
      .to(0.2, { angle: -8 })
      .union()
      .repeat(3)
      .call(() => {
        score++;
        dryerNode.active = false;
        options.nodes[0].active = false;
        options.nodes[1].active = true;
        nextStep();
      })
      .start();
  });
}
/** 帽子 */
export function Hat(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 帽子动画节点 */
    const hatNode = options.nodes[1];
    hatNode.scale = 0;
    hatNode.active = true;
    (cc.tween(hatNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        hatNode.active = false;
        options.nodes[0].active = true;
        nextStep();
      })
      .start();
  });
}
/** 发型 */
export function Wigs(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 发型动画节点 */
    const wigsNode = options.nodes[2];
    wigsNode.scale = 0;
    wigsNode.active = true;

    (cc.tween(wigsNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        wigsNode.active = false;
        options.nodes[0].active = false;
        options.nodes[1].active = true;
        nextStep();
      })
      .start();
  });
}
//#endregion

//#region 第二组道具
/** 黄瓜 */
export function Cucumber(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 黄瓜动画节点 */
    const cucumberNode = options.nodes[1];
    cucumberNode.scale = 0;
    cucumberNode.active = true;

    (cc.tween(cucumberNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        cucumberNode.active = false;
        options.nodes[0].active = true;
        nextStep();
      })
      .start();
  });
}
/** 蛤蟆 */
export function Toad(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 蛤蟆动画节点 */
    const toadNode = options.nodes[2];
    toadNode.scale = 0;
    toadNode.active = true;

    (cc.tween(toadNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        toadNode.active = false;
        options.nodes[0].active = false;
        options.nodes[1].active = true;
        nextStep();
        nextStep();
      })
      .start();
  });
}
/** 粉底液 */
export function Foundation(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 粉底液动画节点 */
    const foundationNode = options.nodes[2];
    foundationNode.scale = 0;
    foundationNode.active = true;

    (cc.tween(foundationNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        score++;
        foundationNode.active = false;
        options.nodes[0].active = false;
        options.nodes[1].active = true;
        nextStep();
      })
      .start();
  });
}
//#endregion

//#region 第三组道具
/** 脱毛膏 */
export function Cream(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 脱毛膏动画节点 */
    const creamNode = options.nodes[2];
    creamNode.scale = 0;
    creamNode.active = true;

    (cc.tween(creamNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        creamNode.active = false;
        options.nodes[0].active = false;
        options.nodes[1].active = true;
        nextStep();
      })
      .start();
  });
}
/** 刮毛刀 */
export function Knife(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 刮毛刀动画节点 */
    const knifeNode = options.nodes[2];
    knifeNode.scale = 0;
    knifeNode.active = true;

    (cc.tween(knifeNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        score++;
        knifeNode.active = false;
        options.nodes[0].active = false;
        options.nodes[1].active = true;
        nextStep();
      })
      .start();
  });
}
/** 胶布 */
export function Tape(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 胶布动画节点 */
    const tapeNode = options.nodes[2];
    tapeNode.scale = 0;
    tapeNode.active = true;

    (cc.tween(tapeNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        tapeNode.active = false;
        options.nodes[0].active = false;
        options.nodes[1].active = true;
        nextStep();
      })
      .start();
  });
}
//#endregion

//#region 第四组道具
/** 美瞳 */
export function Lens(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 美瞳动画节点 */
    const lensNode = options.nodes[1];
    lensNode.scale = 0;
    lensNode.active = true;

    (cc.tween(lensNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        lensNode.active = false;
        options.nodes[0].active = true;
        nextStep();
      })
      .start();
  });
}
/** 睫毛夹 */
export function Curler(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 睫毛夹动画节点 */
    const curlerNode = options.nodes[1];
    curlerNode.scale = 0;
    curlerNode.active = true;

    (cc.tween(curlerNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        curlerNode.active = false;
        options.nodes[0].active = true;
        nextStep();
      })
      .start();
  });
}
/** 睫毛刷 */
export function Brush(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 睫毛刷动画节点 */
    const brushNode = options.nodes[1];
    brushNode.scale = 0;
    brushNode.active = true;

    (cc.tween(brushNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        brushNode.active = false;
        options.nodes[0].active = true;
        nextStep();
      })
      .start();
  });
}
/** 假睫毛+美瞳 */
export function AndLens(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 假睫毛+美瞳动画节点 */
    const andLensNode = options.nodes[2];
    andLensNode.scale = 0;
    andLensNode.active = true;

    (cc.tween(andLensNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        score++;
        andLensNode.active = false;
        options.nodes[0].active = true;
        options.nodes[1].active = true;
        nextStep();
      })
      .start();
  });
}
/** 假睫毛 */
export function Eyelashes(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 假睫毛动画节点 */
    const eyelashesNode = options.nodes[1];
    eyelashesNode.scale = 0;
    eyelashesNode.active = true;

    (cc.tween(eyelashesNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        eyelashesNode.active = false;
        options.nodes[0].active = true;
        nextStep();
      })
      .start();
  });
}
//#endregion

/** 体型 1-肥胖 2-整层 3-消瘦 */
var bodyType = 1;
var bodyNode: cc.Node;
//#region 第五组道具
/** 杠铃 */
export function Dumbbells(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 杠铃动画节点 */
    const dumbbellsNode = options.nodes[3];
    dumbbellsNode.scale = 0;
    dumbbellsNode.active = true;

    (cc.tween(dumbbellsNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        dumbbellsNode.active = false;
        options.nodes[0].active = false;
        options.nodes[1].active = true;
        options.nodes[2].active = true;
        options.nodes[4].active = true;
        bodyType = 2;
        bodyNode = options.nodes[1];
        nextStep();
      })
      .start();
  });
}
/** 沙拉 */
export function Salad(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 沙拉动画节点 */
    const saladNode = options.nodes[3];
    saladNode.scale = 0;
    saladNode.active = true;

    (cc.tween(saladNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        saladNode.active = false;
        options.nodes[0].active = false;
        options.nodes[1].active = true;
        options.nodes[2].active = true;
        bodyType = 3;
        bodyNode = options.nodes[1];
        nextStep();
      })
      .start();
  });
}
/** 绳子 */
export function Rope(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 绳子动画节点 */
    const ropeNode = options.nodes[2];
    ropeNode.scale = 0;
    ropeNode.active = true;

    (cc.tween(ropeNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        ropeNode.active = false;
        options.nodes[0].active = true;
        bodyType = 1;
        bodyNode = options.nodes[1];
        nextStep();
      })
      .start();
  });
}
/** 沙拉和杠铃 */
export function SaladAndDumbbells(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 沙拉和杠铃动画节点 */
    const saladAndDumbbellsNode = options.nodes[2];
    saladAndDumbbellsNode.scale = 0;
    saladAndDumbbellsNode.active = true;

    (cc.tween(saladAndDumbbellsNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        score++;
        saladAndDumbbellsNode.active = false;
        options.nodes[0].active = false;
        options.nodes[1].active = true;
        bodyType = 2;
        bodyNode = options.nodes[1];
        nextStep();
      })
      .start();
  });
}
//#endregion

//#region 第六组道具
/** 针线 */
export function Needle(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 针线动画节点 */
    const needleNode = options.nodes[2];
    needleNode.active = true;

    (cc.tween(needleNode) as cc.Tween)
      .to(0.2, { angle: 8 })
      .to(0.2, { angle: -8 })
      .union()
      .repeat(3)
      .call(() => {
        needleNode.active = false;
        options.nodes[1].active = true;
        nextStep();
      })
      .start();
  });
}
/** 剪刀 */
export function Cut(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 剪刀动画节点 */
    const cutNode = options.nodes[1];
    cutNode.active = true;

    (cc.tween(cutNode) as cc.Tween)
      .delay(2)
      .call(() => {
        cutNode.active = false;
        options.nodes[0].active = true;
        nextStep();
      })
      .start();
  });
}
/** 运动套装 */
export function Suit(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 运动套装动画节点 */
    const suitNode = options.nodes[3];
    suitNode.scale = 0;
    suitNode.active = true;

    (cc.tween(suitNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        suitNode.active = false;
        bodyNode.active = false;
        options.nodes[bodyType - 1].active = true;
        nextStep();
      })
      .start();
  });
}
/** 裙子 */
export function Skirt(options: gi.SubscriptionOptions) {
  select(options.target, () => {
    /** 裙子动画节点 */
    const skirtNode = options.nodes[3];
    skirtNode.scale = 0;
    skirtNode.active = true;

    (cc.tween(skirtNode) as cc.Tween)
      .to(0.3, { scale: 1.2 })
      .to(0.3, { scale: 1 })
      .union()
      .call(() => {
        score++;
        skirtNode.active = false;
        bodyNode.active = false;
        options.nodes[bodyType - 1].active = true;
        nextStep();
      })
      .start();
  });
}
//#endregion

var step = 1;
function nextStep() {
  if (step === 6) {
    if (score === targetScore) {
      gi.Event.emit('clearance');
    } else {
      gi.Event.emit('gameover');
    }
    return;
  }
  const groupCur = groupMap.get(step);
  groupCur.forEach(node => (node.active = false));

  step++;

  const groupLoc = groupMap.get(step);
  for (let i = 0; i < 3; i++) {
    groupLoc[i].active = true;
  }
  gi.Event.emit('showTips', String(step + 1));

  if (step === 4) {
    groupLoc[5].active = true;
  } else if (step === 5) {
    groupLoc[5].active = true;
    groupLoc[6].active = true;
  } else if (step === 6) {
    groupLoc[4].active = true;
  }

  gi.isClick = true;
}

var groupMap = new Map<number, cc.Node[]>([]);

export function group1(options: gi.SubscriptionOptions) {
  groupMap.set(1, options.nodes);
}

export function group2(options: gi.SubscriptionOptions) {
  groupMap.set(2, options.nodes);
}

export function group3(options: gi.SubscriptionOptions) {
  groupMap.set(3, options.nodes);
}

export function group4(options: gi.SubscriptionOptions) {
  groupMap.set(4, options.nodes);
}

export function group5(options: gi.SubscriptionOptions) {
  groupMap.set(5, options.nodes);
}

export function group6(options: gi.SubscriptionOptions) {
  groupMap.set(6, options.nodes);
}

function select(node: cc.Node, callback: Function) {
  node.on(cc.Node.EventType.TOUCH_START, () => {
    (cc.tween(node) as cc.Tween).to(0.1, { scale: 1.2 }).start();
  });
  node.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
    (cc.tween(node) as cc.Tween)
      .to(0.2, { scale: 1 })
      .call(() => {
        if (e.getStartLocation().sub(e.getLocation()).mag() < 10) {
          gi.isClick = false;
          callback();
        }
      })
      .start();
  });
  node.on(cc.Node.EventType.TOUCH_CANCEL, () => {
    (cc.tween(node) as cc.Tween).to(0.1, { scale: 1 }).start();
  });
}
