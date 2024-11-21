gi.Event.on("initTriggerOffCb", () => {
  if (gi.getLevel() !== 48) return;
});

/** 麋鹿 */
export function reindeer(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = false;
  options.nodes[1].active = true;

  const spinSp = options.nodes[1].getComponent(sp.Skeleton);
  const lineBone = spinSp.findBone("Line");
  lineBone.x = options.nodes[2].x;
  lineBone.y = options.nodes[2].y;

  gi.completedAction("2");
}

/** 圣诞老人在地上爬行 */
export function stantaClaus(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;
  options.nodes[2].active = true;

  const spinSp = options.nodes[0].getComponent(sp.Skeleton);
  const lineBone = spinSp.findBone("Line");
  lineBone.x = options.nodes[1].x;
  lineBone.y = options.nodes[1].y;
  gi.completedAction("3");
}

/** 狗狗跑 */
export function dog2(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;
  options.nodes[2].active = true;

  const spinSp = options.nodes[0].getComponent(sp.Skeleton);
  const lineBone = spinSp.findBone("Line");
  lineBone.x = options.nodes[1].x;
  lineBone.y = options.nodes[1].y;
}

/** 圣诞老人飞天了 */
export function stantaClausRun(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = false;
  options.nodes[1].active = true;

  const spinSp = options.nodes[1].getComponent(sp.Skeleton);
  const lineBone = spinSp.findBone("Line");
  lineBone.x = options.nodes[2].x;
  lineBone.y = options.nodes[2].y;

  gi.completedAction("4");
}

export function sun(options: gi.TriggerOffCbOptions) {
  options.nodes[0].getComponent(cc.Animation).play();

  options.nodes[1].active = true;

  const spinSp = options.nodes[1].getComponent(sp.Skeleton);
  const lineBone = spinSp.findBone("Line");
  lineBone.x = options.nodes[2].x;
  lineBone.y = options.nodes[2].y;
}

export function river(options: gi.TriggerOffCbOptions) {
  gi.completedAction("5");
}
