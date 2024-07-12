const { ccclass, property } = cc._decorator;

@ccclass
export default class SubscribeTween extends cc.Component {
  @property({ tooltip: '该节点订阅的动作的函数名' })
  key: string = '';

  @property({ type: [cc.Node], tooltip: '执行动作时需要用到的节点数组，没有可以无视' })
  nodes: cc.Node[] = [];

  @property({ type: [cc.String], tooltip: '执行动作时需要用到的位置数组，没有可以无视' })
  positions: string[] = [];

  onLoad() {
    gi.Event.on('initSubcribed', this.run, this);
  }

  run() {
    gi.Event.emit('run', { target: this.node, key: this.key, nodes: this.nodes, positions: this.positions } as gi.SubscriptionOptions);
  }
}
