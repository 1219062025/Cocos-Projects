import InstanceBase from "./common/InstanceBase";
import EventManager from "./EventManager";

/** 屏幕适配管理 */
class ScreenManager extends InstanceBase {
  private _currentOrientation: Orientation;

  constructor() {
    super();
  }

  init() {
    this._currentOrientation = this.detectOrientation();
    cc.view.setResizeCallback(this.onResize.bind(this));

    this.adapter();
  }

  /** 获取当前屏幕方向 */
  public getOrientation(): Orientation {
    return this._currentOrientation;
  }

  /** 检测当前的屏幕方向 */
  private detectOrientation(): Orientation {
    const viewSize = cc.view.getFrameSize();
    return viewSize.width > viewSize.height
      ? Orientation.Landscape
      : Orientation.Portrait;
  }

  /** 当屏幕尺寸变化时检查方向变化 */
  private onResize() {
    const newOrientation = this.detectOrientation();

    // 屏幕方向发生了改变
    if (newOrientation !== this._currentOrientation) {
      this._currentOrientation = newOrientation;

      this.adapter();
    }
  }

  /** 更改屏幕适配模式 */
  private adapter() {
    const canvas = cc.Canvas.instance;
    if (this._currentOrientation === Orientation.Landscape) {
      canvas.fitHeight = true;
      canvas.fitWidth = false;
    }

    if (this._currentOrientation === Orientation.Portrait) {
      canvas.fitHeight = false;
      canvas.fitWidth = true;
    }

    EventManager.emit("orientationChanged", this._currentOrientation);
  }
}

enum Orientation {
  /** 横屏 */
  Landscape = "Landscape",
  /** 竖屏 */
  Portrait = "Portrait",
}

export default ScreenManager.instance();
