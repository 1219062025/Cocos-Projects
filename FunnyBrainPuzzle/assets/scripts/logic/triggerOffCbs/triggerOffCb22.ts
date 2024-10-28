gi.Event.on('initTriggerOffCb', () => {
  if (gi.getLevel() !== 22) return;
});

const bowlMap = new Map([
  ['Fish-1', {path: 'Canvas/wrap/sprite_node/Fish-2', tipKey: '1'}],
  ['Seaweed-1', {path: 'Canvas/wrap/sprite_node/Seaweed-2', tipKey: '2'}],
  ['Grass-1', {path: 'Canvas/wrap/sprite_node/Grass-2', tipKey: '3'}],
  ['Fruit-1', {path: 'Canvas/wrap/sprite_node/Fruit-2', tipKey: '4'}],
  ['Hair-1', {path: 'Canvas/wrap/sprite_node/Hair-2', tipKey: '5'}],
  ['Shoelace-1', {path: 'Canvas/wrap/sprite_node/Shoelace-2', tipKey: '6'}],
  ['Clouds-1', {path: 'Canvas/wrap/sprite_node/Clouds-2', tipKey: '7'}],
  ['Door', {path: 'Canvas/wrap/sprite_node/Door-2', tipKey: '8', guideKey: '10'}],
  ['Apple-1', {path: 'Canvas/wrap/sprite_node/Apple-2', tipKey: '9'}],
  ['Spider-1', {path: 'Canvas/wrap/sprite_node/Spider-2', tipKey: '10'}],
  ['Mushroom_white-1', {path: 'Canvas/wrap/sprite_node/Mushroom_white-2', tipKey: '11', guideKey: '16'}],
  ['Bread-1-1', {path: 'Canvas/wrap/sprite_node/Bread-2', tipKey: '13'}],
  ['Mushroom_red-1', {path: 'Canvas/wrap/sprite_node/Mushroom_red-2', tipKey: '14'}],
]);

/** 放入食物 */
export function bowl(options: gi.TriggerOffCbOptions) {

  let part: cc.Node;
  const resNode = options.res.node;
  
  if (bowlMap.has(resNode.name)) {
    const item = bowlMap.get(resNode.name)

    part = cc.find(item.path) as cc.Node;
      
    const originPos = part.position;
    part.active = true;
    part.setPosition(originPos.x, originPos.y + part.height * 2);

    (cc.tween(part) as cc.Tween).to(0.4, {position: originPos}, {easing: 'bounceOut'}).start();

    // 处理门
    if(resNode.name === 'Door') {
      cc.find('Canvas/wrap/sprite_node/Tree').active = true;
      cc.find('Canvas/wrap/sprite_node/Cow').active = true;
      cc.find('Canvas/wrap/sprite_node/trigger_cow').active = true;
    }

    if(item.guideKey) {
      gi.completedAction(item.guideKey);
    }

    gi.Event.emit('showTips', item.tipKey);
    gi.Event.emit('score', 1)

  }
}

/** 剪头发 */
export function scissor(options: gi.TriggerOffCbOptions) {
  /** 剪刀节点 */
  const scissorNode = options.nodes[0];
  /** 女人节点 */
  const womanNode = options.nodes[1];
  const womanSp = womanNode.getComponent(sp.Skeleton)
  scissorNode.active = true;
  setTimeout(() => {
    scissorNode.active = false;
    womanSp.setAnimation(0, 'Woman2', true);
    options.nodes[2].active = true
  }, 1000);
}