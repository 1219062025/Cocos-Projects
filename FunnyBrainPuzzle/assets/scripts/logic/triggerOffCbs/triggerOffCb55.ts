/** 圣诞老人节点 */
let santaClausNode: cc.Node = null;
/** 圣诞老人骨骼 */
let santaClausSpine: sp.Skeleton = null;
/** 是否扑灭了火焰 */
let isFirefighting = false;

gi.Event.on("initTriggerOffCb", () => {
  if (gi.getLevel() !== 55) return;

  santaClausNode = cc.find("Canvas/wrap/sprite_node/SantaClaus_Node");
  santaClausSpine = cc
    .find("Canvas/wrap/sprite_node/SantaClaus_Node/SantaClaus/SantaClaus_Spine")
    .getComponent(sp.Skeleton);
});

export async function layer(options: gi.TriggerOffCbOptions) {
  const resName = options.res.node.name;
  const layerNode = options.nodes[0];
  gi.isClick = false;
  if (resName === "FireBox") {
    // 冰块层
    gi.completedAction("2");
    santaClausSpine.setAnimation(0, "SantaClaus-2", true);
    await wait(1333);
    fadeOut(layerNode);
    fail();
  } else if (resName === "Shovel") {
    // 土壤层
    gi.completedAction("4");
    santaClausSpine.setAnimation(0, "SantaClaus-3", true);
    await wait(1333);
    fadeOut(layerNode);
    fail();
  } else if (resName === "Mouse") {
    // 食物层
    await wait(500);
    fadeOut(layerNode);
    fail();
  } else if (resName === "Sword") {
    // 蛛网层
    santaClausSpine.setAnimation(0, "SantaClaus-4", true);
    await wait(1333);
    fadeOut(layerNode);
    fail();
  } else if (resName === "Pickaxe-1") {
    // 使用木稿，游戏失败
    santaClausSpine.setAnimation(0, "SantaClaus-5", false);
    gi.Event.emit("showTips", "8");
    await wait(2333);
    gi.Event.emit("gameover");
  } else if (resName === "Pickaxe-2") {
    // 金子层
    santaClausSpine.setAnimation(0, "SantaClaus-6", true);
    gi.Event.emit("showTips", "10");
    await wait(1333);
    fadeOut(layerNode);
    fail();
  } else if (resName === "Crowbar") {
    // 上锁层
    santaClausSpine.setAnimation(0, "SantaClaus-7", true);
    await wait(1333);
    fadeOut(layerNode);
    gi.Event.emit("showTips", "11");

    (cc.tween(santaClausNode) as cc.Tween)
      .by(0.4, { y: -72 })
      .call(() => {
        if (isFirefighting) {
          santaClausNode.active = false;
          options.nodes[4].active = false;

          options.nodes[1].active = true;
          options.nodes[2].active = true;
          options.nodes[7].active = true;
          gi.isClick = true;
        } else {
          santaClausNode.active = false;
          options.nodes[4].active = false;
          options.nodes[5].active = false;

          options.nodes[3].getComponent(sp.Skeleton).setCompleteListener(() => {
            gi.Event.emit("gameover");
          });
          gi.Event.emit("showTips", "14");
          options.nodes[3].active = true;
          options.nodes[6].active = true;
        }
      })
      .start();
  }
}

export function fire(options: gi.TriggerOffCbOptions) {
  isFirefighting = true;
}

export async function smoke(options: gi.TriggerOffCbOptions) {
  gi.completedAction("1");
  gi.isClick = false;
  options.nodes[2].active = true;
  (cc.tween(options.nodes[2]) as cc.Tween)
    .to(3.5, { angle: 360 * 20 })
    .call(() => {
      options.nodes[2].active = false;
      gi.isClick = true;
    })
    .start();

  options.nodes[1].active = true;
  await wait(2000);
  options.nodes[0].getComponent(cc.ParticleSystem).autoRemoveOnFinish = true;
  options.nodes[0].getComponent(cc.ParticleSystem).duration = 1;
}

export async function socks(options: gi.TriggerOffCbOptions) {
  gi.isClick = false;
  const scene1 = options.nodes[0];
  const label = options.nodes[1];
  const scene2 = options.nodes[2];
  gi.Event.emit("showTips", "12");

  await wait(2000);
  scene1.active = true;
  (cc.tween(scene1) as cc.Tween)
    .to(0.5, { opacity: 255 })
    .call(() => {
      (cc.tween(label) as cc.Tween)
        .to(1, { opacity: 255 })
        .call(async () => {
          await wait(1000);
          scene2.active = true;
          gi.Event.emit("showTips", "13");
          await wait(2000);
          gi.Event.emit("clearance");
        })
        .start();
    })
    .start();
}

function fadeOut(node: cc.Node) {
  (cc.tween(node) as cc.Tween)
    .to(0.2, { opacity: 0 })
    .call(() => {
      node.active = false;
    })
    .start();
}

function wait(delay: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
}

function fail() {
  (cc.tween(santaClausNode) as cc.Tween)
    .by(0.4, { y: -72 })
    .call(() => {
      santaClausSpine.setAnimation(0, "SantaClaus-1", true);
      gi.isClick = true;
    })
    .start();
}
