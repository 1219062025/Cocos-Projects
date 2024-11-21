/** 显示当前困意节点 */
let labelNode: cc.Node;
let sleepiness = 100;

/** 躺着的男子节点 */
let boy1Node: cc.Node;
/** 坐起来的男子节点 */
let boy2Node: cc.Node;
/** 眼睛节点 */
let eyeNode: cc.Node;
/** 狰狞面孔节点 */
let headNode: cc.Node;

gi.Event.on("initTriggerOffCb", () => {
  if (gi.getLevel() !== 24) return;
  labelNode = cc.find("Canvas/wrap/label");
  boy1Node = cc.find("Canvas/wrap/sprite_node/Boy-1");
  boy2Node = cc.find("Canvas/wrap/sprite_node/Boy-2");
  eyeNode = cc.find("Canvas/wrap/sprite_node/Boy-2/Eye");
  headNode = cc.find("Canvas/wrap/sprite_node/Head");
});

gi.Event.on("sleepiness", (value: number) => {
  if (gi.getLevel() !== 24) return;

  sleepiness -= value;
  const label = labelNode.getComponent(cc.Label);
  label.string = `困意：${sleepiness}`;
});

gi.Event.on("rouse", (node) => {
  gi.isClick = false;
  runRouseAni();
});

/** 宝宝哭泣 */
export function bady(options: gi.TriggerOffCbOptions) {
  gi.Event.emit("sleepiness", 10);
  gi.isClick = false;
  options.nodes[0].active = false;
  options.nodes[1].active = true;
  (cc.tween(options.nodes[1]) as cc.Tween)
    .to(0.4, { scale: 1.1 })
    .to(0.4, { scale: 1 })
    .union()
    .repeatForever()
    .start();
  runRouseAni();
}

/** 空调调节温度 */
export function airconditioner(options: gi.TriggerOffCbOptions) {
  gi.isClick = false;
  /** 空调遥控器界面 */
  const control = options.nodes[2];
  const originPos = control.getPosition();
  control.active = true;
  control.y -= control.height / 2;

  (cc.tween(control) as cc.Tween)
    .to(0.1, { y: originPos.y })
    .call(() => {
      gi.Event.emit("sleepiness", 20);
      runRouseAni();
    })
    .delay(1)
    .call(() => {
      gi.completedAction("8");
      options.nodes[0].active = false;
      options.nodes[1].active = true;
      control.active = false;
    })
    .start();
}

/** 叫醒 */
export function rouse(options: gi.TriggerOffCbOptions) {
  const resName = options.res.node.name;
  gi.isClick = false;
  if (resName === "Lemon-1") {
    gi.Event.emit("sleepiness", 10);
    /** 拨开的柠檬 */
    const lemon1 = options.nodes[0];
    /** 柠檬水 */
    const lemon2 = options.nodes[1];

    lemon1.active = true;
    lemon2.active = true;

    (cc.tween(lemon2) as cc.Tween)
      .parallel(
        cc.tween().by(0.3, { y: -50 }),
        cc.tween().to(0.3, { opacity: 0 })
      )
      .call(() => {
        lemon2.active = false;
        (cc.tween(lemon1) as cc.Tween)
          .to(0.3, { opacity: 0 })
          .call(() => {
            lemon1.active = false;
            runRouseAni();
          })
          .start();
      })
      .start();
  } else if (resName === "Socks") {
    gi.Event.emit("sleepiness", 10);
    /** 袜子 */
    const socks = options.nodes[2];
    socks.active = true;
    (cc.tween(socks) as cc.Tween)
      .parallel(
        cc.tween().by(1, { x: -150, y: 150 }),
        cc.tween().to(1, { opacity: 0 })
      )
      .call(() => {
        socks.active = false;
        runRouseAni();
      })
      .start();
  } else if (resName === "Cat1") {
    gi.Event.emit("sleepiness", 20);
    /** 挥爪子的猫 */
    const cat2 = options.nodes[3];
    /** 生气的猫 */
    const cat3 = options.nodes[4];
    /** 爪印 */
    const scratch = options.nodes[5];
    cat2.active = true;
    cat2.getComponent(sp.Skeleton).setCompleteListener(() => {
      scratch.opacity = 0;
      scratch.active = true;
      (cc.tween(scratch) as cc.Tween)
        .to(0.5, { opacity: 255 })
        .call(() => {
          runRouseAni();
        })
        .delay(0.5)
        .call(() => {
          cat2.active = false;
          scratch.active = false;
          cat3.active = true;
        })
        .start();
    });
  } else if (resName === "Tape-1") {
    gi.Event.emit("sleepiness", 10);
    /** 胶带 */
    const tape = options.nodes[6];
    /** 胶带印 */
    const legMask = options.nodes[7];
    /** 腿毛 */
    const legHair = options.nodes[8];
    tape.active = true;

    (cc.tween(tape) as cc.Tween)
      .by(0.4, { x: 100 })
      .to(0.5, { opacity: 0 })
      .start();
    (cc.tween(legHair) as cc.Tween)
      .by(0.4, { x: 100 })
      .to(0.5, { opacity: 0 })
      .call(() => {
        tape.active = false;
        legHair.active = false;
        runRouseAni();
      })
      .start();

    legMask.opacity = 0;
    legMask.active = true;
    (cc.tween(legMask) as cc.Tween)
      .to(0.2, { opacity: 255 })
      .delay(0.2)
      .to(0.2, { opacity: 0 })
      .call(() => {
        legMask.active = false;
      })
      .start();
  } else if (resName === "Hammer-1") {
    const hammer = options.nodes[9];
    hammer.active = true;
    (cc.tween(hammer) as cc.Tween)
      .to(0.5, { angle: -80 }, { easing: "circOut" })
      .to(0.2, { angle: 0 }, { easing: "circIn" })
      .delay(0.3)
      .call(() => {
        hammer.active = false;
        headNode.active = true;
        gi.Event.emit("gameover");
      })
      .start();
  }
}

function runRouseAni() {
  const node = new cc.Node();
  (cc.tween(node) as cc.Tween)
    .then(step1)
    .then(step2)
    .call(() => {
      gi.isClick = true;
    })
    .start();
}

var step1 = (cc.tween() as cc.Tween)
  .call(() => {
    headNode.active = true;
  })
  .delay(0.6)
  .call(() => {
    headNode.active = false;
    boy1Node.active = false;
    boy2Node.active = true;
  })
  .union();

var step2 = (cc.tween() as cc.Tween)
  .delay(0.3)
  .call(() => {
    eyeNode.active = false;
  })
  .delay(0.3)
  .call(() => {
    eyeNode.active = true;
  })
  .delay(0.3)
  .union()
  .repeat(2)
  .call(() => {
    if (sleepiness === 0) {
      gi.Event.emit("showTips", "3");
      gi.Event.emit("clearance");
      return;
    }
    gi.Event.emit("showTips", "2");
    boy1Node.active = true;
    boy2Node.active = false;
  });
