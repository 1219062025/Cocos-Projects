export enum LayerType {
  /** 主界面层 游戏的核心界面，通常显示主游戏界面、游戏元素、角色、背景等。 */
  Main = "MainLayer",
  /** 加载层 显示加载动画或等待界面 */
  Loading = "LoadingLayer",
  /** 弹窗层 显示各种弹窗、提示框、确认框等，一般会遮挡在主界面之上。 */
  Popup = "PopupLayer",
  /** 模态层 用于显示全屏覆盖的 UI 元素，如登录界面、设置面板等，通常需要强制交互。 */
  Modal = "ModalLayer",
  /** 提示层 显示临时提示信息或消息框，通常位于最上层，并且是临时性的。 */
  Tip = "TipLayer",
}

export function test() {}
