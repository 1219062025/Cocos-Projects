import { DataManager_ } from "../../../@framework/DataManager";

export default class LevelData implements DataManager_.DataModule {
  private _currentLevel: number;

  save() {
    return {
      currentLevel: this._currentLevel,
    };
  }

  load(data: any): void {
    this._currentLevel = data.currentLevel;
  }
}
