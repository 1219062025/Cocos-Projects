import TriggerGroup from './triggerGroup';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TriggerControl extends cc.Component {
  /** 触发器组 */
  groups: TriggerGroup[] = [];

  maxLevel: number = 0;

  level: number = 0;

  onLoad() {
    this.groups = this.node.getComponents(TriggerGroup);
    this.maxLevel = this.groups.length - 1;
  }

  canUpgrade() {
    return this.level < this.maxLevel;
  }

  upgrade() {
    const curLevel = this.level;
    const curGroup = this.groups.find(group => group.level === curLevel);
    for (const node of curGroup.nodes) {
      node.active = false;
    }
    const nextLevel = ++this.level;
    const nextGroup = this.groups.find(group => group.level === nextLevel);
    for (const node of nextGroup.nodes) {
      node.active = true;
    }
  }
}
