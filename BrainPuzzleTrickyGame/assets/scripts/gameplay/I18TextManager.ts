import InstanceBase from "../../@framework/common/InstanceBase";
import { gi } from "../../@framework/gi";
import LevelData from "../data/level/LevelData";
import Constant from "./Constant";

type LanguageConfig = Record<
  string,
  {
    id: string;
    Chinese: string;
    English: string;
    Thailand: string;
    Indonasia: string;
    Chinese_tw: string;
    Malay: string;
    Vietnamese: string;
    Japanese: string;
    Korean: string;
    Russian: string;
    Hindi: string;
    Portuguese: string;
    Spanish: string;
    German: string;
    French: string;
    Arabic: string;
  }
>;

class I18nTextManager extends InstanceBase {
  constructor() {
    super();
  }

  /** 语音语言配置 */
  private _voiceLanguage: LanguageConfig;

  /** 引导语言配置 */
  private _guideLanguage: LanguageConfig;

  init() {
    const promis: Promise<LanguageConfig>[] = [];
    if (!this._voiceLanguage) {
      promis.push(
        this.getVoiceLanguage().then((data) => (this._voiceLanguage = data))
      );
    }

    if (!this._guideLanguage) {
      promis.push(
        this.getGuideLanguage().then((data) => (this._guideLanguage = data))
      );
    }

    return Promise.all(promis);
  }

  /**
   * 获取多语言文本
   * @param id 文本ID
   * @param type 文本类型
   */
  getText(id: string, type: number): string {
    let languageConfig: LanguageConfig;

    switch (type) {
      case Constant.TIPS_TYPE.VOICE:
        languageConfig = this._voiceLanguage;
        break;
      case Constant.TIPS_TYPE.GUIDE:
        languageConfig = this._guideLanguage;
        break;
      default:
        break;
    }

    if (!languageConfig) return "";

    const full = Constant.LANGUAGE[gi.I18nManager.language].full;
    const text = languageConfig[id][full];

    return text;
  }

  private getVoiceLanguage(): Promise<LanguageConfig> {
    return new Promise((resolve, reject) => {
      if (this._voiceLanguage) resolve(this._voiceLanguage);

      // 获取关卡数据
      const levelData = gi.DataManager.getModule<LevelData>(
        Constant.DATA_MODULE.LEVEL
      );

      gi.ResourceManager.loadRes(
        `${Constant.CONFIG_PATH.VOICE_LAN}${levelData.getCurrentLevel()}`,
        cc.JsonAsset
      )
        .then((jsonAsset: cc.JsonAsset) => {
          resolve(jsonAsset.json);
        })
        .catch((err) => {
          console.error(`[GAME] Error loading level language config, ${err}`);
          reject(err);
        });
    });
  }

  private getGuideLanguage(): Promise<LanguageConfig> {
    return new Promise((resolve, reject) => {
      if (this._guideLanguage) resolve(this._guideLanguage);

      // 获取关卡数据
      const levelData = gi.DataManager.getModule<LevelData>(
        Constant.DATA_MODULE.LEVEL
      );

      gi.ResourceManager.loadRes(
        `${Constant.CONFIG_PATH.GUIDE_LAN}${levelData.getCurrentLevel()}`,
        cc.JsonAsset
      )
        .then((jsonAsset: cc.JsonAsset) => {
          resolve(jsonAsset.json);
        })
        .catch((err) => {
          console.error(
            `[GAME] Error loading level tips language config, ${err}`
          );
          reject(err);
        });
    });
  }
}

export default I18nTextManager.instance();
