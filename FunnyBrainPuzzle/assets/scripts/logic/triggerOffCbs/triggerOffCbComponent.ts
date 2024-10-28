import ResControl from '../res/resControl';
import TriggerControl from '../trigger/triggerControl';
import TriggerOffCbManager from './triggerOffCbManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TriggerOffCbComponent extends cc.Component {
  @property({ tooltip: '该节点订阅的动作的函数名' })
  key: string = '';

  @property({ type: [cc.Node], tooltip: '执行动作时需要用到的节点数组，没有可以无视' })
  nodes: cc.Node[] = [];

  @property({ type: [cc.String], tooltip: '执行动作时需要用到的位置数组，没有可以无视' })
  positions: string[] = [];

  run(res: ResControl, trigger: TriggerControl) {
    if (!this.key) return;
    TriggerOffCbManager.instance.call({
      key: this.key,
      target: this.node,
      res,
      trigger,
      nodes: this.nodes,
      positions: this.positions
    });
  }
}
