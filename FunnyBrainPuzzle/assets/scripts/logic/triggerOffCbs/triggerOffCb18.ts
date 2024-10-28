/** 左边轮胎节点 */
let leftTire: cc.Node;
/** 右边轮胎节点 */
let rightTire: cc.Node;
/** 背景节点 */
let backgroundNode: cc.Node;
/** 骑车男子 */
let manStart: cc.Node;
/** 摔倒男子 */
let manEnd: cc.Node;
/** 游戏的主容器 */
let wrap: cc.Node;

/** 显示当前速度节点 */
let labelNode: cc.Node;
let speed = 1000;

gi.Event.on('initTriggerOffCb', () => {
  if (gi.getLevel() !== 18) return;
  backgroundNode = cc.find('Canvas/wrap/sprite_node/Background');
  leftTire = cc.find('Canvas/wrap/sprite_node/LTire');
  rightTire = cc.find('Canvas/wrap/sprite_node/RTire');
  manStart = cc.find('Canvas/wrap/sprite_node/Man_node/Man_start');
  manEnd = cc.find('Canvas/wrap/sprite_node/Man_node/Man_end');
  labelNode = cc.find('Canvas/wrap/label');
  wrap = cc.find('Canvas/wrap');
});

gi.Event.on('moderate', (value: number) => {
  if (gi.getLevel() !== 18) return;

  speed -= value;
  const label = labelNode.getComponent(cc.Label);
  label.string = `速度：${speed}km/h`;
});

function stopBackground() {
  backgroundNode['tempCom'].unscheduleAllCallbacks();
}

function fall() {
  manStart.active = false;
  manEnd.active = true;
  manEnd.getComponent(cc.Animation).play();
}

function stopTire() {
  if (cc.isValid(rightTire)) {
    rightTire.stopAllActions();
  }

  if (cc.isValid(leftTire)) {
    leftTire.stopAllActions();
  }
}

/** 挂载车左边的陨石 */
export function aeroliteLeft(options: gi.TriggerOffCbOptions) {
  options.res.node.active = false;
  // 陨石挂在车上
  (cc.tween(options.nodes[0]) as cc.Tween).to(0.2, { angle: 2 }).to(0.2, { angle: 0 }).union().repeatForever().start();

  gi.Event.emit('score', 1);
  gi.Event.emit('moderate', 100);
  gi.Event.emit('showTips', '8');
  gi.completedAction('12');
}

/** 挂载车右边的陨石 */
export function aeroliteRight(options: gi.TriggerOffCbOptions) {
  options.res.node.active = false;

  if (gi.score !== 8) {
    stopBackground();
    stopTire();
    fall();
    gi.Event.emit('deductScore', 1);
    gi.Event.emit('showTips', '11');
  } else {
    stopBackground();
    stopTire();
    gi.Event.emit('score', 1);
    gi.Event.emit('moderate', 150);
    gi.Event.emit('showTips', '12');
  }
}

/** 排气 */
export function exhaust(options: gi.TriggerOffCbOptions) {
  const originPos = options.nodes[0].getPosition();
  options.nodes[0].opacity = 0;
  options.nodes[0].active = true;
  options.nodes[1].opacity = 0;
  (cc.tween(options.nodes[0]) as cc.Tween)
    .by(0.3, { x: -50, opacity: 255 })
    .by(0.3, { x: -50, opacity: -255 })
    .call(() => {
      options.nodes[0].setPosition(originPos);
    })
    .union()
    .repeatForever()
    .start();
  gi.Event.emit('score', 1);
  gi.Event.emit('moderate', 50);
  gi.Event.emit('showTips', '4');
  gi.completedAction('8');
}

/** 左边的推进火箭，游戏失败 */
export function rocketLeft(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;

  // 火焰喷发
  (cc.tween(options.nodes[1]) as cc.Tween).to(0.1, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 1, scaleY: 1 }).union().repeatForever().start();
  gi.Event.emit('deductScore', 1);
  gi.Event.emit('showTips', '9');
}

/** 右边减速火箭 */
export function rocketRight(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;

  // 火焰喷发
  (cc.tween(options.nodes[1]) as cc.Tween).to(0.1, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 1, scaleY: 1 }).union().repeatForever().start();
  gi.Event.emit('score', 1);
  gi.Event.emit('moderate', 200);
  gi.Event.emit('showTips', '10');
}

/** 降落伞挂载车尾 */
export function parachutes(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;
  (cc.tween(options.nodes[0]) as cc.Tween).to(0.2, { angle: 5 }).to(0.2, { angle: -5 }).union().repeatForever().start();
  gi.Event.emit('score', 1);
  gi.Event.emit('moderate', 100);
  gi.Event.emit('showTips', '7');
}

/** 油箱漏油 */
export function fuel(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;
  gi.Event.emit('score', 1);
  gi.Event.emit('moderate', 100);
  gi.Event.emit('showTips', '3');
  gi.completedAction('5');
}

/** 卸下轮胎 */
export function tire(options: gi.TriggerOffCbOptions) {
  const tireNode = options.nodes[0];

  if (tireNode.name === 'RTire') {
    gi.Event.emit('showTips', '6');
  } else {
    gi.Event.emit('showTips', '5');
    gi.completedAction('9');
  }

  const angleAnticlockwise = (cc.tween(tireNode) as cc.Tween).by(0.2, { angle: -90 }).union().repeatForever();
  tireNode.stopAllActions();

  angleAnticlockwise.start();
  (cc.tween(tireNode) as cc.Tween).by(0.1, { y: 10, x: 20 }).by(0.1, { x: 20 }).by(0.3, { y: 20, x: 40 }).by(0.2, { x: 20 }).to(3, { x: -wrap.width }).start();

  if (cc.isValid(options.nodes[1])) {
    options.nodes[1].active = true;
  }
  gi.Event.emit('score', 1);
  gi.Event.emit('moderate', 100);
}
