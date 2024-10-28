import ResControl from '../res/resControl';
/** 显示当前速度节点 */
let labelNode: cc.Node;
let speed = 50;

gi.Event.on('initTriggerOffCb', () => {
  if (gi.getLevel() !== 3) return;

  labelNode = cc.find('Canvas/wrap/label');
});

gi.Event.on('moderate', (value: number) => {
  if (gi.getLevel() !== 3) return;

  speed += value;
  const label = labelNode.getComponent(cc.Label);
  label.string = `速度：${speed}km/h`;
});

let nums = 0;
/** 使用武学秘籍给两个老人 */
export function note(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;
  (cc.tween(options.nodes[0]) as cc.Tween).by(0.1, { angle: -120 }).union().repeatForever().start();

  (cc.tween(options.nodes[1]) as cc.Tween).to(0.1, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 1, scaleY: 1 }).union().repeatForever().start();

  gi.Event.emit('moderate', 45);
}

export function rocket(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;

  (cc.tween(options.nodes[1]) as cc.Tween).to(0.1, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 1, scaleY: 1 }).union().repeatForever().start();
}

export function rocketLeft(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;

  (cc.tween(options.nodes[1]) as cc.Tween).to(0.1, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 1, scaleY: 1 }).union().repeatForever().start();

  gi.Event.emit('moderate', 100);
}

export function splash(options: gi.TriggerOffCbOptions) {
  (cc.tween(options.nodes[0]) as cc.Tween).to(0.1, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 1, scaleY: 1 }).union().repeatForever().start();
}

export function turtlerotate(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;
  (cc.tween(options.nodes[0]) as cc.Tween).by(0.1, { angle: -120 }).union().repeatForever().start();

  gi.Event.emit('moderate', 80);
}

/** 飞天老人火焰喷发 */
export function flyFire(options: gi.TriggerOffCbOptions) {
  options.nodes[1].active = true;

  (cc.tween(options.nodes[0]) as cc.Tween).to(0.1, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 1, scaleY: 1 }).union().repeatForever().start();

  gi.Event.emit('moderate', 200);
}

export function woodboat(options: gi.TriggerOffCbOptions) {
  (cc.tween(options.nodes[0]) as cc.Tween).to(0.1, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 1, scaleY: 1 }).union().repeatForever().start();

  gi.Event.emit('moderate', 80);
}

export function turtle(options: gi.TriggerOffCbOptions) {
  (cc.tween(options.nodes[0]) as cc.Tween).to(0.1, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 1, scaleY: 1 }).union().repeatForever().start();

  gi.Event.emit('moderate', 20);
}

export function sail(options: gi.TriggerOffCbOptions) {
  gi.Event.emit('moderate', 80);
}

export function sky(options: gi.TriggerOffCbOptions) {
  gi.Event.emit('moderate', 50);
}

export function shark(options: gi.TriggerOffCbOptions) {
  gi.Event.emit('moderate', 50);
}
