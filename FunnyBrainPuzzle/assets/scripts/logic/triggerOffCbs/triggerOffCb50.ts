/** 队列节点集合 */
let queue: cc.Node[] = [];
/** 队头下标 */
let currentIndex = 0;
/** 展示飞跃动画的骨骼组件 */
let santaClausAniSp: sp.Skeleton;

gi.Event.on("initTriggerOffCb", () => {
  if (gi.getLevel() !== 50) return;

  queue = cc
    .find("Canvas/wrap/sprite_node/SantaClausQueue")
    .children.slice()
    .reverse();

  santaClausAniSp = cc
    .find("Canvas/wrap/sprite_node/SantaClaus_Animation")
    .getComponent(sp.Skeleton);

  santaClausAniSp.setCompleteListener(async () => {
    await walk();
    gi.isClick = true;
  });
});

/** 晾衣杆是否已经触发过了 */
let isRod = false;
/** 晾衣杆 */
export async function rod(options: gi.TriggerOffCbOptions) {
  runAnimation("SantaClaus_Rod");

  isRod = true;
  gi.completedAction("1");
  gi.Event.emit("showTips", "2");
}

/** 弹弓 */
export async function slingshot(options: gi.TriggerOffCbOptions) {
  runAnimation("SantaClaus_Rope");

  gi.Event.emit("showTips", "8");
}

/** 水管 */
export async function pipe(options: gi.TriggerOffCbOptions) {
  runAnimation("SantaClaus_Pipe");

  gi.Event.emit("showTips", "10");
}

/** 气球 */
export async function balloon(options: gi.TriggerOffCbOptions) {
  runAnimation("SantaClaus_Balloon");

  gi.completedAction("2");
  gi.Event.emit("showTips", "3");
}

/** 小鸟 */
export async function bird(options: gi.TriggerOffCbOptions) {
  runAnimation("SantaClaus_Bird");

  gi.completedAction("7");
  gi.Event.emit("showTips", "6");
}

/** 弹簧 */
export async function pogoStick(options: gi.TriggerOffCbOptions) {
  runAnimation("SantaClaus_PogoStick");

  gi.completedAction("10");
  gi.Event.emit("showTips", "9");
}

/** 可乐 */
export async function cola(options: gi.TriggerOffCbOptions) {
  const santaClausCola = options.nodes[0];
  const santaClausColaAni = santaClausCola.getComponent(cc.Animation);
  gi.isClick = false;
  queue[currentIndex].active = false;
  santaClausCola.active = true;
  santaClausColaAni.play();
  santaClausColaAni.on("stop", async () => {
    await walk();
    gi.isClick = true;
  });

  gi.completedAction("6");
  gi.Event.emit("showTips", "5");
}

/** 拐杖糖果 */
export async function suger(options: gi.TriggerOffCbOptions) {
  const sugerNode = options.nodes[0];
  const sugerAni = sugerNode.getComponent(cc.Animation);
  gi.isClick = false;
  queue[currentIndex].active = false;

  if (isRod) {
    // 如果晾衣杆已经触发过了，就隐藏掉
    sugerNode.getChildByName("Rod(1)").active = false;
  }

  sugerNode.active = true;
  sugerAni.play();
  sugerAni.once("stop", async () => {
    await walk();
    sugerNode.active = false;
    gi.isClick = true;
  });

  gi.Event.emit("showTips", "4");
}

/** 执行对应飞跃动画 */
function runAnimation(name: string) {
  queue[currentIndex].active = false;
  gi.isClick = false;
  santaClausAniSp.setAnimation(0, name, false);
}

/** 队列前进 */
async function walk() {
  const walkPromises: Promise<void>[] = [];
  queue.slice(currentIndex + 1).forEach((item, index) => {
    walkPromises.push(
      new Promise((resolve) => {
        (cc.tween(item) as cc.Tween)
          .by(1, { x: -50 })
          .call(() => {
            resolve();
          })
          .start();
      })
    );
  });
  currentIndex++;
  return Promise.all(walkPromises);
}

/** 麋鹿 */
export function reindeer(options: gi.TriggerOffCbOptions) {}
