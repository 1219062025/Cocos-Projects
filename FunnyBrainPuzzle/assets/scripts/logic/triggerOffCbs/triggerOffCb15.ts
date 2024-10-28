import ResControl from '../res/resControl';

/** 桥梁目前最边上的部件 */
let lastNode: cc.Node = null;

/** 女人行走终点 */
let womanEndNode: cc.Node = null;
/** 杀手行走终点 */
let killerEndNode: cc.Node = null;

/** 女人节点 */
let woman: cc.Node = null;
/** 女人骨骼 */
let womanSp: sp.Skeleton = null;

/** 杀手节点 */
let killer: cc.Node = null;
/** 杀手骨骼 */
let killerSp: sp.Skeleton = null;

/** 杀手是否已经走到门口停下来了 */
let isKillerIdle: boolean = false;

const bridegMap = new Map([
  ['Door-1', 'Canvas/wrap/sprite_node/Door-2'],
  ['Ashcan-1', 'Canvas/wrap/sprite_node/Ashcan-2'],
  ['Level15-Dog-Spine', 'Canvas/wrap/sprite_node/Dog-4'],
  ['Fan-1', 'Canvas/wrap/sprite_node/Fan-2'],
  ['Hanger-1', 'Canvas/wrap/sprite_node/Hanger-2'],
  ['Lamp-1', 'Canvas/wrap/sprite_node/Lamp-2'],
  ['Moon-1', 'Canvas/wrap/sprite_node/Moon-2'],
  ['Pipe-1', 'Canvas/wrap/sprite_node/Pipe-2'],
  ['Refrigeration-1', 'Canvas/wrap/sprite_node/Refrigeration-2'],
  ['Tree-1', 'Canvas/wrap/sprite_node/Tree-2']
]);

export function buildBridge(options: gi.TriggerOffCbOptions) {
  if (lastNode === null) {
    lastNode = cc.find('Canvas/wrap/sprite_node/bridge_origin');
  }

  if (womanEndNode === null) {
    womanEndNode = cc.find('Canvas/wrap/sprite_node/bridge_end');
  }

  if (woman === null) {
    woman = cc.find('Canvas/wrap/sprite_node/Level15-Woman-Spine');
    womanSp = woman.getComponent(sp.Skeleton);
  }

  if (killerEndNode === null) {
    killerEndNode = cc.find('Canvas/wrap/sprite_node/killer_end');
  }

  if (killer === null) {
    killer = cc.find('Canvas/wrap/sprite_node/Level15-Killer-Spine');
    killerSp = killer.getComponent(sp.Skeleton);
  }

  let targetX;
  let part = null;
  const resNode = options.res.node;

  targetX = lastNode.x - 52;
  if (bridegMap.has(resNode.name)) {
    part = cc.find(bridegMap.get(resNode.name));
    part.active = true;
    part.setPosition(targetX, part.y);
    lastNode = part;
    gi.completedAction(resNode.name);
    bridegMap.delete(resNode.name);

    if (resNode.name === 'Door-1') {
      // 把门拿开后将 香蕉皮滑晕狗狗的触发器打开
      options.nodes[1].active = true;
    }
  }

  // 设置行走动画
  womanSp.setAnimation(0, 'Woman_Walk', true);
  if (bridegMap.size > 0) {
    // 桥还没搭建完
    if (resNode.name === 'Banana') {
      gi.Event.emit('showTips', '3');
    } else if (resNode.name === 'Cloud-1') {
      gi.Event.emit('showTips', '4');
    } else if (resNode.name === 'Flowerpot-1') {
      gi.Event.emit('showTips', '5');
    } else {
      gi.Event.emit('showTips', '6');
    }

    (cc.tween(woman) as cc.Tween)
      .to(0.5, { position: cc.v2(targetX, woman.y) })
      .call(() => {
        if (part) {
          // 移动触发器
          options.nodes[0].setPosition(woman.x, woman.y + 280);
          // 设置等待动画
          womanSp.setAnimation(0, 'Woman_Idle', true);
        } else {
          // 设置坠落动画
          womanSp.setAnimation(0, 'Woman_Fall', false);
          setTimeout(() => {
            killerSp.setAnimation(0, 'Killer2', true);
            gi.Event.emit('showTips', '2');
            gi.Event.emit('showFailPop1', '2');
          }, 1000);
        }
      })
      .start();
  } else {
    // 桥搭建完了
    (cc.tween(woman) as cc.Tween)
      .to(0.5, { position: cc.v2(targetX, woman.y) })
      .to(0.5, { position: cc.v2(womanEndNode.x, womanEndNode.y) })
      .call(() => {
        options.nodes[0].active = false;
        options.nodes[2].active = true;
        womanSp.setAnimation(0, 'Woman2', true);
        killerSp.setAnimation(0, 'Killer2', true);
        gi.Event.emit('showTips', '10');
        setTimeout(() => {
          killerWalk(options.nodes[3]);
        }, 2000);
      })
      .start();
  }
}

export function faintDog(options: gi.TriggerOffCbOptions) {
  options.nodes[0].getComponent(sp.Skeleton).setAnimation(0, 'Dog3', true);
  options.nodes[0].getComponent(cc.Animation).play('faint');
  options.nodes[0].off(cc.Node.EventType.TOUCH_START);
  const res = options.nodes[0].addComponent(ResControl);
  res.tags = [0];
}

function killerWalk(flowerpotNode: cc.Node) {
  killerSp.setAnimation(0, 'Killer3_Walk', true);

  (cc.tween(killer) as cc.Tween)
    .to(4, { position: killerEndNode.getPosition() })
    .call(() => {
      gi.Event.emit('showTips', '7');
      killerSp.setAnimation(0, 'Killer3_Idle', true);
      flowerpotNode.getComponent(ResControl).tags = [0, 3];
      isKillerIdle = true;
    })
    .start();
}

export function throwFlowerpot(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;
  options.nodes[0].getComponent(cc.Animation).play('throw');
  setTimeout(() => {
    options.nodes[1].active = true;
    killerSp.setAnimation(0, 'Killer4', true);
    womanSp.setAnimation(0, 'Woman3', true);
    gi.Event.emit('showTips', '8');
    gi.Event.emit('clearance');
  }, 1000);
}
