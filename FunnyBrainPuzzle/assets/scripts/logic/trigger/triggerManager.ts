import TriggerControl from './triggerControl';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TriggerManager extends cc.Component {
  /** 所有触发器节点 */
  children: cc.Node[] = [];

  onLoad() {
    gi.Event.on('initTrigger', this.onInitTrigger, this);
    gi.Event.on('removeTrigger', this.onRemoveTrigger, this);
  }

  onInitTrigger(node: cc.Node) {
    this.children.push(node);

    this.children.sort((a: cc.Node, b: cc.Node) => {
      const aTrigger = a.getComponent(TriggerControl);
      const bTrigger = b.getComponent(TriggerControl);
      if (aTrigger.siblingIndex > bTrigger.siblingIndex) {
        return -1;
      } else if (aTrigger.siblingIndex < bTrigger.siblingIndex) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  onRemoveTrigger(node: cc.Node) {
    if (cc.isValid(node)) {
      const index = this.children.findIndex(value => value === node);
      if (index !== -1) {
        this.children.splice(index, 1);
      }
    }
  }
}
