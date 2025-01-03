import GuideManager from "./GuideManager";

const { ccclass, property, disallowMultiple } = cc._decorator;

@ccclass
@disallowMultiple
export default abstract class Guide extends cc.Component {
  @property({ displayName: "引导器的ID" })
  id: string = "";

  @property({ displayName: "引导提示ID" })
  tid: string = "";

  /** 引导器的优先级 */
  @property({
    displayName: "优先级",
    step: 1,
  })
  priority: number = 0;

  onLoad() {
    GuideManager.register(this);
  }

  /** 引导器是否可用 */
  abstract isNormal(): boolean;

  /** 运行引导 */
  abstract run(): void;

  /** 暂停引导 */
  abstract pause(): void;
}
