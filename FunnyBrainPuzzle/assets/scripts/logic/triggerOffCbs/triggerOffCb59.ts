/** 是否帮助到老人的次数，需要3次,分别是：升级碗、升级袋子、升级用扫把扫掉雪之后的老人 */
let keyPoint = 0;
/** 钱的数量 */
let moneyCount = 3;
/** 被冰住的老人节点 */
let grandpa1Node: cc.Node = null;
/** 穿单薄衣服的老人节点 */
let grandpa2Node: cc.Node = null;
/** 穿大衣的老人节点 */
let grandpa3Node: cc.Node = null;
/** 离开的老人节点 */
let grandpa4Node: cc.Node = null;
/** 老人发狂的节点 */
let grandpaRunNode: cc.Node = null;
/** 老人发狂的骨骼组件 */
let grandpaRunSpine: sp.Skeleton = null;
/** 女孩节点 */
let girlNode: cc.Node = null;

/** 老人是否穿了大衣 */
let isGrandpa3 = false;

gi.Event.on("initTriggerOffCb", () => {
  if (gi.getLevel() !== 59) return;

  grandpa1Node = cc.find("Canvas/wrap/sprite_node/Grandpa-1");
  grandpa2Node = cc.find("Canvas/wrap/sprite_node/Grandpa-2");
  grandpa3Node = cc.find("Canvas/wrap/sprite_node/Grandpa-3");
  grandpa4Node = cc.find("Canvas/wrap/sprite_node/Grandpa-4");

  girlNode = cc.find("Canvas/wrap/sprite_node/Girl_node");

  grandpaRunNode = cc.find("Canvas/wrap/sprite_node/grandpaRun_node");
  grandpaRunSpine = grandpaRunNode
    .getChildByName("spine")
    .getComponent(sp.Skeleton);
});

/** 扫把扫掉老人身上的雪 */
export function grandpa1(options: gi.TriggerOffCbOptions) {
  const broom = options.nodes[0];
  const broomAni = broom.getComponent(cc.Animation);

  gi.isClick = false;
  gi.completedAction("3");

  broom.active = true;
  broomAni.play();

  gi.Event.emit("showTips", "2");
  broomAni.once("stop", () => {
    broom.active = false;
    options.nodes[1].active = false;
    options.nodes[2].active = true;
    gi.isClick = true;
  });
}

/** 升级老人穿上大衣 */
export function grandpa2(options: gi.TriggerOffCbOptions) {
  gi.completedAction("4");
  isGrandpa3 = true;
  grandpa3Node.active = true;

  keyPoint++;
  isHelp(false);
}

/** 升级袋子 */
export function bag(options: gi.TriggerOffCbOptions) {
  gi.completedAction("2");
  keyPoint++;
  isHelp(false);
}

/** 升级碗 */
export function bowl(options: gi.TriggerOffCbOptions) {
  gi.completedAction("1");
  keyPoint++;
  isHelp(false);
}

/** 用礼物升级柜子 */
export function cabinet(options: gi.TriggerOffCbOptions) {
  if (options.nodes[0].active === true) {
    options.nodes[0].active = false;
    options.nodes[2].active = true;
  } else if (options.nodes[1].active === true) {
    options.nodes[1].active = false;
    options.nodes[3].active = true;
  }
}

/** 用钱升级老人不需要的东西 */
export function otherMoney(options: gi.TriggerOffCbOptions) {
  if (options.trigger.node.name === "trigger_Cabinet_money") {
    if (options.nodes[0].active === true) {
      options.nodes[0].active = false;
      options.nodes[2].active = true;
    } else if (options.nodes[1].active === true) {
      options.nodes[1].active = false;
      options.nodes[3].active = true;
    }
  }
  isHelp();
}

/** 是否帮助到老人 */
async function isHelp(isOther: boolean = true) {
  moneyCount--;
  if (moneyCount === 0) {
    gi.isClick = false;
    if (keyPoint === 3) {
      // 成功，老人离开
      gi.Event.emit("showTips", "3");

      await wait(1000);

      cc.find("Canvas/wrap/sprite_node/Bowl-2").active = false;
      cc.find("Canvas/wrap/sprite_node/Bag-2").active = false;
      cc.find("Canvas/wrap/sprite_node/Calendar-1-static").active = false;
      cc.find("Canvas/wrap/sprite_node/Calendar-1").active = true;

      grandpa3Node.active = false;
      grandpa4Node.active = true;
      await wait(500);
      grandpa4Node.scaleX = -1;
      (cc.tween(grandpa4Node) as cc.Tween)
        .to(0.5, {
          x: cc.winSize.width / 2 + grandpa4Node.width / 2,
        })
        .call(() => {
          gi.isClick = true;
        })
        .start();
    } else {
      // 失败，老人发狂
      gi.Event.emit("showTips", "18");

      await wait(1000);

      grandpa1Node.active = false;
      grandpa2Node.active = false;
      grandpa3Node.active = false;

      if (isGrandpa3) {
        grandpaRunSpine.defaultSkin = "B";
      }
      grandpaRunNode.active = true;
      grandpaRunNode.getComponent(cc.Animation).play();
      setTimeout(() => {
        girlNode.getComponent(cc.Animation).play();
      }, 250);

      grandpaRunNode.getComponent(cc.Animation).once("stop", async () => {
        grandpaRunNode.active = false;

        await wait(1000);
        gi.Event.emit("gameover");
      });
    }
  } else {
    if (isOther) {
      gi.Event.emit("showTips", "17");
    } else {
      gi.Event.emit("showTips", "2");
    }
  }
}

function wait(delay: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
}
