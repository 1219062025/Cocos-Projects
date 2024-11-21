gi.Event.on("initTriggerOffCb", () => {
  if (gi.getLevel() !== 49) return;
});

const buildMap = new Map([
  ["StarDecoration-1", "StarDecoration-2"],
  ["LightBar-1", "LightBar-2"],
  ["Radiator-1", "Radiator-2"],
  ["Fence-1", "Fence-2"],
  ["Antlers-1", "Antlers-2"],
  ["RoastChicken-1", "RoastChicken-2"],
  ["Carrot-1", "Carrot-2"],
  ["Shovel-1", "Shovel-2"],
  ["Rope-1", "Rope-2"],
  ["StreetLight-1", "StreetLight-2"],
  ["Branches-1", "Branches-2"],
  ["TreasureChest-1", "TreasureChest-2"],
]);

let step = 0;

/** 麋鹿 */
export function build(options: gi.TriggerOffCbOptions) {
  const stairsSub = options.nodes[0];
  const santaClaus = options.nodes[1];
  const santaClausSp = santaClaus.getComponent(sp.Skeleton);

  const resName = options.res.node.name;

  const targetPart = buildMap.get(resName);

  if (targetPart) {
    step++;
    if (step < 12) {
      gi.Event.emit("showTips", "2");
    } else {
      gi.Event.emit("showTips", "3");
    }

    if (resName === "Carrot-1") {
      gi.completedAction("1");
    } else if (resName === "Rope-1") {
      gi.completedAction("2");
    } else if (resName === "LightBar-1") {
      gi.completedAction("3");
    } else if (resName === "RoastChicken-1") {
      gi.completedAction("5");
    }

    const part = stairsSub.getChildByName(targetPart);
    part.active = true;
    const targetStairs = stairsSub.getChildByName(`Stairs${step}`);
    part.setPosition(targetStairs.getPosition());

    gi.isClick = false;
    santaClausSp.setAnimation(0, "ClimbStairs", true);
    (cc.tween(santaClaus) as cc.Tween)
      .by(1, { y: 90 })
      .call(() => {
        santaClausSp.setAnimation(0, "Idle", true);
        if (step >= 12) {
          setTimeout(() => {
            gi.Event.emit("clearance");
          }, 2000);
        } else {
          gi.isClick = true;
        }
      })
      .start();
  }
}

/** 挖雪堆 */
export function snow(options: gi.TriggerOffCbOptions) {
  /** 用来做挖掘动画的铁锹节点 */
  const shovelAniNode = options.nodes[0];
  /** 雪堆 */
  const snowDrifts = options.nodes[1];
  /** 宝箱 */
  const treasureChest = options.nodes[2];
  /** 铁锹节点 */
  const shovelNode = options.nodes[3];
  /** 大坑 */
  const hole = options.nodes[4];

  gi.isClick = false;

  shovelAniNode.active = true;
  const shovelAni = shovelAniNode.getComponent(cc.Animation);
  shovelAni.play();
  setTimeout(() => {
    shovelAni.pause();
    shovelAniNode.active = false;
    shovelNode.active = true;
    snowDrifts.active = false;
    hole.active = true;
    treasureChest.active = true;

    const treasureChestAni = treasureChest.getComponent(cc.Animation);
    treasureChestAni.play();
    treasureChestAni.once("stop", () => {
      gi.isClick = true;
    });
  }, 3000);
}
