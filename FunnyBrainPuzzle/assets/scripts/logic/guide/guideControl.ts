const { ccclass, property, executeInEditMode } = cc._decorator;
enum GuideType {
  /** 拖动引导 */
  Drag,
  /** 点击引导 */
  Click,
  /** 文本引导 */
  Text,
  /** 上滑引导 */
  UP,
  /** 左滑引导 */
  Left,
  /** 右滑引导 */
  Right,
  /** 下滑引导 */
  Down
}

@ccclass
@executeInEditMode
export default class GuideControl extends cc.Component {
  /** 引导类型 */
  @property({ type: cc.Enum(GuideType), tooltip: '引导类型' })
  type: GuideType = GuideType.Drag;

  /** 引导提示的key值，在配置文件levelinfos中查看 */
  @property({ tooltip: '引导提示的key值，在配置文件levelinfos中查看' })
  key: string = '';

  /** 引导对应动作key值，如果在gi.finishedActionKeys中已经存在该key值，该引导不执行。 */
  @property({ tooltip: '引导对应动作key值，如果在gi.finishedActionKeys中已经存在该key值，该引导不执行' })
  actionKey: string = '';

  /** 目标节点 */
  @property({
    type: cc.Node,
    visible() {
      return this.type !== GuideType.Text;
    },
    tooltip: '目标节点'
  })
  targetNode: cc.Node = null;

  /** 拖动的资源类型 */
  @property({
    step: 1,
    visible() {
      return this.type === GuideType.Drag;
    },
    tooltip: '拖动的资源类型'
  })
  resTag: number = 0;

  onLoad() {
    this.node.name = this.key || 'guideControl';
  }
}
