/** 所有学生节点的父节点 */
let studentRootNode: cc.Node;
/** 所有学生节点 */
let studentNodes: cc.Node[] = [];
/** 队头学生节点 */
let firstStudentNode: cc.Node;
/** 队头学生的位置 */
let firstStudentPosition: cc.Vec2;
/** 队头学生骨骼 */
let firstStudentSp: sp.Skeleton;

/** 保安节点 */
let directorNode: cc.Node;
/** 保安骨骼 */
let directorSp: sp.Skeleton;

/** 阿姨节点 */
let womanNode: cc.Node;
/** 阿姨骨骼 */
let womanSp: sp.Skeleton;

/** 汽车行进终点 */
let carEndNode: cc.Node = null;

/** 门向右关闭的终点 */
let doorEndNode: cc.Node = null;

/** 蜂窝节点 */
let beehiveNode: cc.Node = null;
/** 蜜蜂节点 */
let beeNode: cc.Node = null;

let wrapNode: cc.Node = null;

gi.Event.on('walk', walk);
gi.Event.on('setAnimation', setAnimation);
gi.Event.on('initTriggerOffCb', () => {
  if (gi.getLevel() !== 17) return;
  studentRootNode = cc.find('Canvas/wrap/sprite_node/student_nodes');
  studentNodes = studentRootNode.children.filter(node => node.name == 'Level18-Student-Spine');

  directorNode = cc.find('Canvas/wrap/sprite_node/Level18-Director-Spine');
  directorSp = directorNode.getComponent(sp.Skeleton);

  womanNode = cc.find('Canvas/wrap/sprite_node/Level18-Student-Spine-woman');
  womanSp = womanNode.getComponent(sp.Skeleton);

  carEndNode = cc.find('Canvas/wrap/sprite_node/car_end');
  doorEndNode = cc.find('Canvas/wrap/sprite_node/door_wrap/door_end');

  beehiveNode = cc.find('Canvas/wrap/sprite_node/Beehive-1');
  beeNode = cc.find('Canvas/bee');

  wrapNode = cc.find('Canvas/wrap');
});

function setFirstStudentInfo() {
  firstStudentNode = studentNodes.shift();
  firstStudentSp = firstStudentNode.getComponent(sp.Skeleton);
  firstStudentPosition = firstStudentNode.getPosition();
}

/** 学生触发器 */
export function student(options: gi.TriggerOffCbOptions) {
  const resNodeName = options.res.node.name;

  setAnimation(resNodeName);
  gi.Event.emit('score', 1);
  console.log(gi.score);
}

/** 保安触发器 */
export function director(options: gi.TriggerOffCbOptions) {
  const resNodeName = options.res.node.name;

  setAnimation(resNodeName);
  gi.Event.emit('score', 1);
  console.log(gi.score);
}

/** 车后备箱触发器 */
export function trunk(options: gi.TriggerOffCbOptions) {
  gi.isClick = false;
  options.nodes[1].active = true;
  setFirstStudentInfo();

  setTimeout(() => {
    const carNode = options.nodes[0];
    const doorNode = options.nodes[2];
    const doorOriPos = doorNode.getPosition();
    (cc.tween(doorNode) as cc.Tween)
      .to(0.5, { position: doorEndNode.getPosition() })
      .call(() => {
        gi.Event.emit('showTips', '8');
        (cc.tween(carNode) as cc.Tween)
          .to(1, { scale: 0.6, position: carEndNode.getPosition() })
          .call(() => {})
          .start();
      })
      .delay(1)
      .to(0.5, { position: doorOriPos })
      .call(() => {
        gi.isClick = true;
      })
      .start();
  }, 300);

  gi.Event.emit('score', 1);
  console.log(gi.score);
}

function setAnimation(name: string) {
  if (name === 'Balloon') {
    // 气球
    setFirstStudentInfo();
    firstStudentNode.setParent(wrapNode);
    gi.isClick = false;
    firstStudentSp.setAnimation(0, 'GoToSchool_Balloon', false);
    gi.Event.emit('showTips', '4');
    firstStudentSp.setEndListener(() => {
      walk();
      gi.Event.emit('removeRes', firstStudentNode);
    });
  } else if (name === 'Shovel-1') {
    // 铲子
    setFirstStudentInfo();
    firstStudentNode.setParent(wrapNode);
    gi.isClick = false;
    firstStudentSp.setAnimation(0, 'GoToSchool_Shovel', false);
    gi.Event.emit('showTips', '6');
    gi.completedAction('shovel');

    const worldPos = firstStudentNode.convertToWorldSpaceAR(cc.v2(0, 0));
    firstStudentNode.setPosition(wrapNode.convertToNodeSpaceAR(worldPos));

    firstStudentNode.setSiblingIndex(-1);
    firstStudentSp.setEndListener(() => {
      walk();
      firstStudentNode.setParent(directorNode.getParent());
      firstStudentNode.setSiblingIndex(directorNode.getSiblingIndex());
      gi.Event.emit('removeRes', firstStudentNode);
    });
  } else if (name === 'Aunt-1') {
    // 阿姨
    setFirstStudentInfo();
    gi.isClick = false;
    womanNode.active = true;
    womanSp.setAnimation(0, 'GoToSchool_Woman', false);
    firstStudentSp.setAnimation(0, 'GoToSchool_Default', false);
    gi.Event.emit('showTips', '10');
    firstStudentSp.setEndListener(() => {
      walk();
      firstStudentNode.setParent(wrapNode);
      gi.Event.emit('removeRes', firstStudentNode);
    });
  } else if (name === 'Clothes-1') {
    // 老师
    setFirstStudentInfo();
    gi.isClick = false;
    firstStudentSp.setAnimation(0, 'GoToSchool_Clothes', false);
    gi.Event.emit('showTips', '7');
    firstStudentSp.setEndListener(() => {
      walk();
      firstStudentNode.setParent(wrapNode);
      gi.Event.emit('removeRes', firstStudentNode);
    });
  } else if (name === 'Cat-1') {
    // 小猫
    setFirstStudentInfo();
    gi.isClick = false;
    directorSp.setAnimation(0, 'Leave_Cat', false);
    gi.Event.emit('showTips', '5');
    gi.completedAction('cat');
    setTimeout(() => {
      firstStudentSp.setAnimation(0, 'GoToSchool_Default', false);
      firstStudentSp.setEndListener(() => {
        directorSp.setAnimation(0, 'Idle', false);
        walk();
        firstStudentNode.setParent(wrapNode);
        gi.Event.emit('removeRes', firstStudentNode);
      });
    }, 400);
  } else if (name === 'Bell-1') {
    // 集合铃
    setFirstStudentInfo();
    gi.isClick = false;
    directorSp.setAnimation(0, 'Leave_Default', false);
    gi.Event.emit('showTips', '3');
    gi.completedAction('bell');
    setTimeout(() => {
      firstStudentSp.setAnimation(0, 'GoToSchool_Default', false);
      firstStudentSp.setEndListener(() => {
        directorSp.setAnimation(0, 'Idle', false);
        walk();
        firstStudentNode.setParent(wrapNode);
        gi.Event.emit('removeRes', firstStudentNode);
      });
    }, 400);
  } else if (name === 'Beehive-1') {
    // 蜜蜂
    setFirstStudentInfo();
    gi.isClick = false;
    beeFly(beehiveNode, carEndNode);
    directorSp.setAnimation(0, 'Leave_Beehive', false);
    gi.Event.emit('showTips', '2');
    gi.completedAction('beehive');
    setTimeout(() => {
      firstStudentSp.setAnimation(0, 'GoToSchool_Default', false);
      firstStudentSp.setEndListener(() => {
        directorSp.setAnimation(0, 'Idle', false);
        walk();
        firstStudentNode.setParent(wrapNode);
        gi.Event.emit('removeRes', firstStudentNode);
      });
    }, 400);
  } else if (name === 'Breakfast') {
    // 早餐
    setFirstStudentInfo();
    gi.isClick = false;
    directorSp.setAnimation(0, 'Leave_Breakfast', false);
    gi.Event.emit('showTips', '9');
    gi.completedAction('breakfast');
    setTimeout(() => {
      firstStudentSp.setAnimation(0, 'GoToSchool_Default', false);
      firstStudentSp.setEndListener(() => {
        walk();
        directorSp.setAnimation(0, 'Idle', false);
        firstStudentNode.setParent(wrapNode);
        gi.Event.emit('removeRes', firstStudentNode);
      });
    }, 400);
  } else if (name === 'Rod-1') {
    // 钓鱼竿
    setFirstStudentInfo();
    gi.isClick = false;
    directorSp.setAnimation(0, 'Leave_Rod', false);
    gi.Event.emit('showTips', '11');
    setTimeout(() => {
      firstStudentSp.setAnimation(0, 'GoToSchool_Default', false);
      firstStudentSp.setEndListener(() => {
        directorSp.setAnimation(0, 'Idle', false);
        walk();
        firstStudentNode.setParent(wrapNode);
        gi.Event.emit('removeRes', firstStudentNode);
      });
    }, 400);
  }
}

/** 除了队头外队伍行走动画 */
function walk() {
  const list = studentNodes.slice().reverse();
  for (let i = 0; i < list.length; i++) {
    const studentNode = list[i];
    const studentSp = studentNode.getComponent(sp.Skeleton);
    studentSp.setAnimation(0, 'Walk', true);

    let targetPosition;
    if (i === list.length - 1) {
      targetPosition = firstStudentPosition;
    } else {
      targetPosition = list[i + 1].getPosition();
    }

    (cc.tween(studentNode) as cc.Tween)
      .to(1.5, { position: targetPosition })
      .call(() => {
        gi.isClick = true;
        studentSp.setAnimation(0, 'Idle', true);
      })
      .start();
  }
}

/** 蜜蜂飞出 */
function beeFly(startNode: cc.Node, endNode: cc.Node) {
  const canvas = cc.Canvas.instance.node;
  const startPos = canvas.convertToNodeSpaceAR(startNode.convertToWorldSpaceAR(cc.v2(0, 0)));
  const endPos = canvas.convertToNodeSpaceAR(endNode.convertToWorldSpaceAR(cc.v2(0, 0)));

  for (let i = 0; i < 10; i++) {
    const node = cc.instantiate(beeNode);
    node.setParent(canvas);
    node.setPosition(startPos);
    (cc.tween(node) as cc.Tween)
      .delay(i * 0.1)
      .call(() => {
        node.active = true;
      })
      .to(1, { position: endPos })
      .start();
  }
}

export function school(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;
  gi.Event.emit('showTips', '12');
  directorSp.setAnimation(0, 'Walk', true);
  (cc.tween(directorNode) as cc.Tween)
    .to(1, { position: options.nodes[1].getPosition() })
    .call(() => {
      directorSp.setAnimation(0, 'Idle', true);
    })
    .start();
}
