import { DataModule } from "../../../@framework/types/Data";

export default class LevelData implements DataModule {
  private _currentLevel: number;

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
}
