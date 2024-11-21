gi.Event.on("initTriggerOffCb", () => {
  if (gi.getLevel() !== 2) return;

  gi.Event.on(
    "notHaveRes",
    () => {
      if (babyLevel === 7) {
        gi.Event.emit("clearance");
      } else {
        gi.Event.emit("gameover");
      }
    },
    this
  );
});

/** 女人当前等级 */
let womanLevel = 1;
/** 宝宝是否发烧 */
let isFever = true;
/** 宝宝是否还是湿的 */
let isWet = true;
/** 宝宝等级 */
let babyLevel = 2;

/**
 * 宝宝等级：
 * 1-默认
 * 2-发烧
 * 3-不发烧
 * 4-发烧，打湿
 * 5-发烧，不打湿
 * 6-不发烧，打湿
 * 7-不发烧，不打湿
 */

export function baby(options: gi.TriggerOffCbOptions) {
  if (babyLevel === 2) {
    options.nodes[2].active = false;

    if (isWet) {
      options.nodes[4].active = true;
      babyLevel = 4;
      //....
      gi.Event.emit("showTips", "9");
    } else {
      options.nodes[5].active = true;
      babyLevel = 5;
      gi.Event.emit("showTips", "8");
    }
  } else if (babyLevel === 3) {
    options.nodes[3].active = false;

    if (isWet) {
      options.nodes[6].active = true;
      babyLevel = 6;
      //....
      gi.Event.emit("showTips", "9");
    } else {
      options.nodes[7].active = true;
      babyLevel = 7;
      gi.Event.emit("showTips", "8");
    }
  }

  console.log(babyLevel);
}

export function towel(options: gi.TriggerOffCbOptions) {
  isWet = false;
  options.nodes[0].active = false;
}

export function medicine(options: gi.TriggerOffCbOptions) {
  isFever = false;
  if (babyLevel === 2) {
    options.nodes[2].active = false;
    options.nodes[3].active = true;
    babyLevel = 3;
  } else if (babyLevel === 4) {
    options.nodes[4].active = false;
    options.nodes[6].active = true;
    babyLevel = 6;
  } else if (babyLevel === 5) {
    options.nodes[5].active = false;
    options.nodes[7].active = true;
    babyLevel = 7;
  }
}

/** 女人升级 */
export function woman1(options: gi.TriggerOffCbOptions) {
  womanLevel++;
}

/** 墙体升级 */
export function wall1(options: gi.TriggerOffCbOptions) {
  if (womanLevel === 1) {
    options.nodes[0].active = true;
    options.nodes[2].active = true;
  } else if (womanLevel === 2) {
    options.nodes[1].active = true;
  }
}
