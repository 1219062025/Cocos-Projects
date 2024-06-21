export default class Guide {
  /** 当前引导步骤 */
  static step: number = 1;

  /** 是否还处于引导阶段 */
  static inGuide: boolean = true;

  /** 当前引导的缓动 */
  static currentTween: cc.Tween = null;
}
