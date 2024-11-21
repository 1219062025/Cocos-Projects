import InstanceBase from "./common/InstanceBase";
import Localized from "./components/i18n/Localize";
import ResourceManager from "./ResourceManager";

type I18nData = {
  [key: string]: string;
};

/** 多语言管理器 */
class I18nManager extends InstanceBase {
  /** 当前语言 */
  private _currentLanguage: string;
  /** 语言数据缓存映射 */
  private _languageDataMap = new Map<string, I18nData>();
  /** 语言数据 */
  private _languageData: Record<string, string> = null;
  /** 默认语言 */
  private _fallbackLanguage: string = "en";
  /** 已注册的Localized组件 */
  private _registeredComponents = new Set<Localized>();
  /** 基础路径 */
  private _basePath: string;

  /** 基础路径 */
  public get basePath() {
    return this._basePath;
  }

  /** 当前语言 */
  public get language() {
    return this._currentLanguage;
  }

  constructor() {
    super();
  }

  init(basePath?: string) {
    this._basePath = basePath || "i18n";
    this._currentLanguage = this._fallbackLanguage;
  }

  /**
   * 加载语言文件（JSON 格式）
   * @param language 语言类型，如 "en", "zh", "fr" 等
   */
  private async _loadLanguage(language: string) {
    const url = `${this._basePath}/${language}`;

    return new Promise((resolve, reject) => {
      if (this._languageDataMap.has(language)) {
        this._languageData = this._languageDataMap.get(language);
        this._updateAllLocalized();
        resolve(true);
      }

      ResourceManager.loadRes(url, cc.JsonAsset, (err, res: cc.JsonAsset) => {
        if (err) {
          console.error(
            `[I18nManager] Failed to load language file: ${url}`,
            err
          );
          reject(err);
        } else {
          this._languageData = res.json;
          this._languageDataMap.set(language, res.json);
          this._updateAllLocalized();
          resolve(true);
        }
      });
    });
  }

  /**
   * 切换当前语言
   * @param language 语言类型，如 "en", "zh", "fr" 等
   */
  public async switchLanguage(language: string) {
    if (this._currentLanguage === language) return;

    this._currentLanguage = language;

    await this._loadLanguage(this._currentLanguage);
  }

  /** 获取当前语言数据 */
  public getCurrentLanguageData(): Record<string, string> {
    return this._languageData;
  }

  /** 更新所有已经注册的Localized组件 */
  private _updateAllLocalized() {
    this._registeredComponents.forEach((localized: Localized) => {
      localized.updateLocalization();
    });
  }

  /**
   * 注册需要更新文本的Localized组件
   * @param localized 需要更新的Localized组件
   */
  public register(localized: Localized) {
    this._registeredComponents.add(localized);
    localized.updateLocalization();
  }

  /** 注销 */
  public unregister(localized: Localized) {
    this._registeredComponents.delete(localized);
  }
}

export default I18nManager.instance();
