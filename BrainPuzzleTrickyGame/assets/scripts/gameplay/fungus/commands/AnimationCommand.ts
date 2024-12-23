import { gi } from "../../../../@framework/gi";
import LevelData from "../../../data/level/LevelData";
import Constant from "../../Constant";
import ContextManager from "../../context/ContextManager";
import Command from "./Command";
const { ccclass, property, menu, executeInEditMode } = cc._decorator;

enum ExecuteOptions {
  /** 操作动画 */
  OPERATE,
  /** 监听动画事件 */
  ON_EVENT,
  /** 一次性监听动画事件 */
  ONCE_EVENT,
}

enum OperateOptions {
  play,
  stop,
  pause,
  resume,
  toggle,
}

enum EventOptions {
  play,
  stop,
  pause,
  resume,
  finished,
  lastframe,
}

@ccclass
@executeInEditMode
@menu("Fungus/Command/Scripting | AnimationCommand")
export class AnimationCommand extends Command {
  @property({ type: cc.Animation, displayName: "动画组件" })
  animation: cc.Animation = null;

  @property({
    type: cc.Enum(ExecuteOptions),
    tooltip:
      "OPERATE：操作动画\nON_EVENT：监听动画事件\nONCE_EVENT：一次性监听动画事件",
  })
  type: number = ExecuteOptions.OPERATE;

  @property({
    type: cc.Enum(OperateOptions),
    tooltip:
      "play：开始播放\nstop：停止播放\npause：暂停播放\nresume：恢复播放\ntoggle：切换播放状态",
    visible() {
      return this._validOperate(this.type);
    },
  })
  operate: number = OperateOptions.play;

  @property({
    type: cc.Enum(EventOptions),
    tooltip:
      "play：开始播放时\nstop：停止播放时\npause：暂停播放时\nresume：恢复播放时\nfinished：动画播放完成时\nlastframe：假如动画循环次数大于1，当动画播放到最后一帧时",
    visible() {
      return this._validEvent(this.type);
    },
  })
  event: number = EventOptions.play;

  @property({
    type: cc.AnimationClip,
    tooltip: "动画片段\n不填的话相当于不传参给play、stop等方法",
    visible() {
      return this._validOperate(this.type);
    },
  })
  clip: cc.AnimationClip = null;

  @property({
    displayName: "回调函数",
    tooltip: "调用当前关卡上下文中的函数",
    visible() {
      return this._validEvent(this.type);
    },
  })
  callback: string = "";

  execute() {
    if (!this.animation) {
      throw new Error(
        `Animation component not received on Animations Command with command ID ${this.id} on node ${this.node.name}`
      );
    }

    switch (this.type) {
      case ExecuteOptions.OPERATE:
        this.operateAnimation();
        break;
      case ExecuteOptions.ON_EVENT:
        this.onAnimation(false);
        break;
      case ExecuteOptions.ONCE_EVENT:
        this.onAnimation(true);
        break;
    }

    return Promise.resolve();
  }

  /** 操作动画 */
  private operateAnimation() {
    if (this.operate === OperateOptions.toggle) {
      if (this.clip) {
        this._toggle(this.clip);
      } else {
        this.animation.getClips().forEach(this._toggle);
      }
    } else {
      const operate = Object.keys(OperateOptions)[this.operate];

      this.animation[operate](this.clip ? this.clip.name : undefined);
    }
  }

  private _toggle(clip: cc.AnimationClip) {
    const state = this.animation.getAnimationState(clip.name);
    if (state.isPlaying) {
      this.animation.pause(clip.name);
    } else {
      this.animation.play(clip.name);
    }
  }

  /**
   * 监听动画事件
   * @param {boolean} isOnce 是否一次性监听
   */
  private onAnimation(isOnce: boolean) {
    const eventName = Object.keys(EventOptions)[this.event];
    const operate = isOnce ? "once" : "on";

    this.animation[operate](eventName, (event) => {
      const levelData = gi.DataManager.getModule<LevelData>(
        Constant.DATA_MODULE.LEVEL
      );
      const lastInteractive = levelData.lastInteractive;

      const options = {
        object: (lastInteractive && lastInteractive.object) || null,
        trigger: (lastInteractive && lastInteractive.trigger) || null,
        event,
      };

      ContextManager.callFunction(this.callback, options);
    });
  }

  private _valid(type: number, ...args: number[]) {
    const valid = [...args];
    return valid.includes(type);
  }

  private _validOperate(type: number) {
    return this._valid(type, ExecuteOptions.OPERATE);
  }

  private _validEvent(type: number) {
    return this._valid(
      type,
      ExecuteOptions.ON_EVENT,
      ExecuteOptions.ONCE_EVENT
    );
  }
}
