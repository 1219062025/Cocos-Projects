import ResControl from '../res/resControl';

/** 女孩节点 */
let girl: cc.Node = null;
/** 所有被子节点初始时的父节点 */
let bedQuiltTemp: cc.Node = null;
/** 被子显示出来后的父节点 */
let bedQuiltNode: cc.Node = null;

/** 最上面的被子的位置 */
let lastPosition: cc.Vec2;

/** 显示当前温度节点 */
let labelNode: cc.Node;
/** 当前温度 */
let temperature = -50;

/** 被剪开的保温箱节点 */
let warmingBoxNode: cc.Node = null;

const bedQuiltMap = new Map([
  ['WarmingBox-2', 'WarmingBox-3'],
  ['Cardboard-1', 'Cardboard-2'],
  ['Cotton-1', 'Cotton-2'],
  ['WindowQuilt-1', 'WindowQuilt-2'],
  ['Curtain-1', 'Curtain-2'],
  ['DogHair-1', 'DogHair-2'],
  ['DogHouse-1', 'DogHouse-2'],
  ['AirQuilt-1', 'AirQuilt-2'],
  ['Coat-1', 'Coat-2'],
  ['Quilt-1', 'Quilt-2'],
  ['TestPaper-1', 'TestPaper-2'],
  ['YogaMat-1', 'YogaMat-2'],
  ['TinFoil-1', 'TinFoil-2'],
  ['Carpet-1', 'Carpet-2'],
  ['BodyWarmer-1', 'BodyWarmer-2'],
  ['Blanket-1', 'Blanket-2'],
  ['Socks-1', 'Socks-2']
]);

gi.Event.on('initTriggerOffCb', () => {
  if (gi.getLevel() !== 12) return;
  girl = cc.find('Canvas/wrap/sprite_node/girl');
  bedQuiltTemp = cc.find('Canvas/wrap/sprite_node/BedQuiltTemp');
  bedQuiltNode = cc.find('Canvas/wrap/sprite_node/BedQuilt');
  warmingBoxNode = cc.find('Canvas/wrap/sprite_node/WarmingBox-2');
  lastPosition = cc.v2(girl.x + 15, girl.y + 20);
  labelNode = cc.find('Canvas/wrap/label');
});

/** 剪开毛绒玩具 */
export function doll(options: gi.TriggerOffCbOptions) {
  const dollNode = options.nodes[0];
  const dollSp = dollNode.getComponent(sp.Skeleton);
  dollSp.setAnimation(0, 'Doll2', false);

  gi.completedAction('7');
  dollSp.setCompleteListener(() => {
    options.nodes[1].active = true;
  });
}

/** 剪狗狗的毛 */
export function dog(options: gi.TriggerOffCbOptions) {
  const dogNode = options.nodes[0];
  const dogSp = dogNode.getComponent(sp.Skeleton);
  dogSp.setAnimation(0, 'Dog2', true);

  gi.completedAction('8');
  options.nodes[1].active = true;
}

export function bedQuilt(options: gi.TriggerOffCbOptions) {
  const targetName = bedQuiltMap.get(options.res.node.name);
  if (targetName) {
    if (targetName !== 'WarmingBox-2' && lastPosition.y === girl.y + 20) {
      warmingBoxNode.getComponent(ResControl).tags = [5];
    }

    const part = bedQuiltTemp.getChildByName(targetName);
    part.active = true;
    part.setParent(bedQuiltNode);
    part.setPosition(lastPosition);
    lastPosition = cc.v2(lastPosition.x, lastPosition.y + 20);

    gi.Event.emit('score', 1);
    temperature += 5;
    const label = labelNode.getComponent(cc.Label);
    label.string = `温度：${temperature}℃`;
  }
}
