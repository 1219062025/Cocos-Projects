import { gi } from "../../@framework/gi";
import LevelData from "../data/level/LevelData";
import Constant from "../gameplay/Constant";

const { ccclass, property } = cc._decorator;

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

@ccclass
export default class Tips extends cc.Component {
  @property(cc.Label)
  text: cc.Label = null;

  /** 交互语言配置 */
  private _voiceLanguage: LanguageConfig;

  /** 提示语言配置 */
  private _guideLanguage: LanguageConfig;

  onLoad() {
    gi.EventManager.on(Constant.EVENT.SHOW_TIPS, this.showTips, this);
  }

  async showTips(id: string, type: number) {
    let languageConfig: LanguageConfig;

    switch (type) {
      case Constant.TIPS_TYPE.VOICE:
        this._voiceLanguage = await this.getVoiceLanguage();
        languageConfig = this._voiceLanguage;
        break;
      case Constant.TIPS_TYPE.GUIDE:
        this._guideLanguage = await this.getGuideLanguage();
        languageConfig = this._guideLanguage;
        break;
      default:
        break;
    }

    const full = Constant.LANGUAGE[gi.I18nManager.language].full;
    const text = languageConfig[id][full];

    this.node.stopAllActions();
    (cc.tween(this.node) as cc.Tween)
      .to(0.07, { opacity: 0 })
      .call(() => {
        this.text.string = text;
      })
      .to(0.2, { opacity: 255 })
      .delay(2)
      .to(0.2, { opacity: 0 })
      .start();
  }

  getVoiceLanguage(): Promise<LanguageConfig> {
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

  getGuideLanguage(): Promise<LanguageConfig> {
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
