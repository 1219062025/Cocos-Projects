import { DataModule } from "../../../@framework/types/Data";
import DragObject from "../../entities/DragObject";
import TriggerController from "../../entities/TriggerController";

interface LastInteractive {
  object: DragObject;
  trigger: TriggerController;
}

export default class LevelData implements DataModule {
  /** 当前关卡 */
  private _currentLevel: number;
  /** 最后产生交互的拖拽物和触发器 */
  private _lastInteractive: LastInteractive;
  public get lastInteractive() {
    return this._lastInteractive;
  }

  constructor(level: number) {
    this._currentLevel = level;
  }

  save() {
    return {
      currentLevel: this._currentLevel,
    };
  }

  load(data: any): void {
    this._currentLevel = data.currentLevel;
  }

  /** 获取当前关卡 */
  getCurrentLevel(): number {
    return this._currentLevel;
  }

  /** 设置最后产生交互的拖拽物和触发器 */
  setLastInteractive(object: DragObject, trigger: TriggerController) {
    if (!this._lastInteractive) {
      this._lastInteractive = {
        object,
        trigger,
      };
    } else {
      this._lastInteractive.object = object;
      this._lastInteractive.trigger = trigger;
    }
  }
}
