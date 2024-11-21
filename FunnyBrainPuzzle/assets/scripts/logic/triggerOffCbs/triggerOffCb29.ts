/** 右边女人节点 */
let womanNode: cc.Node;
/** 左边女人节点 */
let womanBNode: cc.Node;
/** 男人节点 */
let manNode: cc.Node;
/** 是否可以升级了 */
let canImprove = false;
/** 男人骨骼组件 */
let manSp: sp.Skeleton;
/** 手臂目标位置骨骼 */
let bone;
/** 强壮的手 */
let dogStongHand: cc.Node;
/** 普通的手 */
let dogHand: cc.Node;
/** 女人打工次数 */
let count = 0;
/** 左边升级次数，要通关需要4次 */
let money1Count = 0;
/** 右边升级次数，要通关需要6次 */
let moneyRCount = 0;

gi.Event.on("initTriggerOffCb", () => {
  if (gi.getLevel() !== 29) return;
});

export function next(options: gi.TriggerOffCbOptions) {
  setTimeout(() => {
    womanNode = cc.find("Canvas/wrap/sprite_node/2/Woman_a-1");
    womanBNode = cc.find("Canvas/wrap/sprite_node/2/Woman_b-1");
    manNode = cc.find("Canvas/wrap/sprite_node/2/Man");
    manSp = manNode.getComponent(sp.Skeleton);
    dogStongHand = cc.find("Canvas/wrap/sprite_node/2/Dog-hand-l(1)");
    dogHand = cc.find("Canvas/wrap/sprite_node/2/Dog-3/Dog-hand-l");
    bone = manSp.findBone("Location");

    gi.Event.on("curtain", curtain);
  }, 0);
}

/** 女人升级 */
export function woman(options: gi.TriggerOffCbOptions) {
  const resName = options.res.node.name;
  let money: cc.Node = null;
  let startPos: cc.Vec2 = options.target.getPosition();
  if (resName === "Gloves") {
    gi.Event.emit("showTips", "9");
    money = cc.find("Canvas/wrap/sprite_node/2/money2_1");
    womanNode.active = false;
    womanNode = cc.find("Canvas/wrap/sprite_node/2/Woman_a-2");
    work(womanNode, [money], startPos);
  } else if (resName === "Hat") {
    gi.Event.emit("showTips", "11");
    money = cc.find("Canvas/wrap/sprite_node/2/money2_2");
    womanNode.active = false;
    womanNode = cc.find("Canvas/wrap/sprite_node/2/Woman_a-3");
    work(womanNode, [money], startPos);
  } else if (resName === "Broom") {
    gi.Event.emit("showTips", "10");
    money = cc.find("Canvas/wrap/sprite_node/2/money2_3");
    womanNode.active = false;
    womanNode = cc.find("Canvas/wrap/sprite_node/2/Woman_a-4");
    work(womanNode, [money], startPos);
  } else if (resName === "Book") {
    gi.Event.emit("showTips", "14");
    womanNode.active = false;
    womanNode = cc.find("Canvas/wrap/sprite_node/2/Woman_a-5");
    womanNode.active = true;
    options.target.active = false;
    work(womanNode, options.nodes, startPos);
  }
}

/** 升级到强壮狗狗 */
export function dog(options: gi.TriggerOffCbOptions) {
  canImprove = true;
  gi.Event.emit("showTips", "13");
  if (count >= 3) {
    dogGetBood();
  }
}

/** 花钱改善右边家具时 */
export function improve(options: gi.TriggerOffCbOptions) {
  gi.isClick = false;
  const oldNode = options.nodes[0];
  const newNode = options.nodes[1];
  oldNode.active = false;
  newNode.active = true;
  bone.x = newNode.x;
  bone.y = newNode.y;

  const resName = oldNode.name;

  if (canImprove === false) {
    // 如果不能升级
    gi.Event.emit("showTips", "7");
    manSp.setAnimation(0, "Destroy", false);
    manSp.setCompleteListener(() => {
      newNode.active = false;
      oldNode.active = true;
      manSp.setAnimation(0, "Idle", true);
      gi.isClick = true;
    });
  } else {
    options.target.active = false;
    dogStongHand.active = true;
    dogHand.active = false;
    const handAni = dogStongHand.getComponent(cc.Animation);
    handAni.play();
    handAni.on("stop", () => {
      dogStongHand.active = false;
      dogHand.active = true;
    });
    manSp.setAnimation(0, "DestructionFailed", false);
    manSp.setCompleteListener(() => {
      gi.isClick = true;
    });

    if (resName === "Floor_r-1") {
      gi.Event.emit("showTips", "17");
    } else if (resName === "Wall_r-1") {
      gi.Event.emit("showTips", "21");
    } else if (resName === "Table_r-1") {
      gi.Event.emit("showTips", "19");
    } else if (resName === "Window-1") {
      gi.Event.emit("showTips", "18");
    } else if (resName === "Door-1") {
      gi.Event.emit("showTips", "16");
    } else if (resName === "Car-1") {
      gi.Event.emit("showTips", "20");
    } else if (resName === "Suitcases_r-1") {
      gi.Event.emit("showTips", "15");
    }

    moneyRCount++;
    testClearance();
  }
}

export function money1(options: gi.TriggerOffCbOptions) {
  money1Count++;
  testClearance();
}

function testClearance() {
  if (money1Count >= 4 && moneyRCount >= 6) {
    gi.isClick = false;
    setTimeout(() => {
      gi.Event.emit("showTips", "6");
      setTimeout(() => {
        const womanBAni = womanBNode.getComponent(cc.Animation);
        womanBAni.play();
      }, 2000);
    }, 2000);
  }
}

/** 右边女人去工作赚钱的动画 */
function work(womanNode: cc.Node, moneys: cc.Node[], startPos: cc.Vec2) {
  count++;
  gi.isClick = false;
  womanNode.active = true;
  const originPos = womanNode.getPosition();
  (cc.tween(womanNode) as cc.Tween)
    .delay(0.3)
    .to(0.1, { scaleX: -1 })
    .to(0.3, {
      position: cc.v2(
        cc.Canvas.instance.node.width / 2 + womanNode.width / 2,
        womanNode.y
      ),
    })
    .delay(0.3)
    .to(0.1, { scaleX: 1 })
    .to(0.3, { position: originPos })
    .call(() => {
      // 钱从女人身上飞出
      moneys.forEach((money) => {
        const targetPos = money.getPosition();
        money.setPosition(startPos);
        money.scale = 0;
        money.active = true;

        const moneyTween = (cc.tween() as cc.Tween).parallel(
          cc.tween().to(0.4, { position: targetPos }),
          cc.tween().to(0.15, { scale: 1 })
        );

        (cc.tween(money) as cc.Tween)
          .then(moneyTween)
          .call(() => {
            gi.isClick = true;
            if (count >= 3 && canImprove) {
              dogGetBood();
            }
          })
          .start();
      });
    })
    .start();
}

/** 是否已经拿过书了 */
var isGet = false;
/** 狗狗去拿书 */
function dogGetBood() {
  if (isGet) return;
  isGet = true;
  gi.isClick = false;
  const bookNode = cc.find("Canvas/wrap/sprite_node/2/Book");
  const dogNode = cc.find("Canvas/wrap/sprite_node/2/Dog-3");
  const originPos = dogNode.getPosition();
  const startPos = dogNode.getPosition();
  (cc.tween(dogNode) as cc.Tween)
    .delay(0.5)
    .to(0.1, { scaleX: -1 })
    .to(0.4, {
      position: cc.v2(
        cc.Canvas.instance.node.width / 2 + dogNode.width / 2,
        dogNode.y
      ),
    })
    .delay(0.3)
    .to(0.1, { scaleX: 1 })
    .to(0.4, { position: originPos })
    .call(() => {
      // 书从狗狗身上飞出
      const targetPos = bookNode.getPosition();
      bookNode.setPosition(startPos);
      bookNode.scale = 0;
      bookNode.active = true;

      const moneyTween = (cc.tween() as cc.Tween).parallel(
        cc.tween().to(0.6, { position: targetPos }),
        cc.tween().to(0.3, { scale: 1 })
      );

      (cc.tween(bookNode) as cc.Tween)
        .then(moneyTween)
        .call(() => {
          gi.isClick = true;
        })
        .start();
    })
    .start();
}

function curtain() {
  setTimeout(() => {
    cc.find("Canvas/wrap/sprite_node/2").active = false;
    cc.find("Canvas/wrap/sprite_node/3").active = true;
    gi.Event.emit("showTips", "22");
    setTimeout(() => {
      gi.Event.emit("showTips", "23");
      gi.Event.emit("clearance");
    }, 3000);
  }, 2000);
}
