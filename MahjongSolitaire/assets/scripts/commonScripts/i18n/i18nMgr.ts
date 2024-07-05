const { ccclass, property } = cc._decorator;
import { Language } from './i18nType';
export const ResLanguage: Record<string, string> = {};

(() => {
  let dir = 'CommonResources/i18n/label';
  cc.loader.loadResDir(dir, function (err, objects, urls) {
    if (err) return;
    for (let i = 0; i < objects.length; i++) {
      ResLanguage[objects[i].name] = objects[i].name;
    }
  });
})();

@ccclass
export default class i18nMgr {
  // 单例
  private static _ins: i18nMgr;
  public static get ins() {
    if (this._ins == null) {
      this._ins = new i18nMgr();
    }
    return this._ins;
  }

  /** 语言路径 */
  private language_path: Record<string, string> = {};
  /** 是否初始化过 */
  private _inited: boolean = false;
  /** 语言，默认英文 */
  private _language: Language = Language.en;
  /** 文本配置 */
  private _labelConfig = {};
  /** 注册了i18n的组件列表 */
  private _componentList = [];

  constructor() {
    Object.values(Language).forEach(key => {
      if (typeof key === 'string') {
        this.language_path[Language[key]] = key;
      }
    });
  }

  /**
   * 设置语言
   * @param language 语言
   */
  public setLanguage(language: Language) {
    if (this._language == language) {
      return;
    }
    gi.setLanguage(Language[language]);
    this._language = language;
    this.loadConfig();
  }

  public getLanguage() {
    return this._language;
  }

  /**语言改变后加载配置，重置组件 */
  private loadConfig() {
    let url = this.getLabelPath(this._language);
    cc.loader.loadRes(url, cc.JsonAsset, (err, assets) => {
      if (err !== null) return console.error('[i18nMgr] 文本配置不存在:', url);
      this._labelConfig = (assets as cc.JsonAsset).json;
      for (let component of this._componentList) {
        component.resetValue();
      }
    });
  }

  /**
   * 获取文本配置路径
   * @param language 语言
   * @returns 返回文本配置路径
   */
  public getLabelPath(language: Language) {
    return 'CommonResources/i18n/label/' + this.language_path[language];
  }

  /**
   * 获取图片路径
   * @param language 语言
   * @param key  图片key
   * @returns 返回图片路径
   */
  public getSpritePath(language: Language, key) {
    return 'CommonResources/i18n/sprite/' + this.language_path[language] + '/' + key;
  }

  /**
   * 添加组件
   * @param componet 组件
   */
  public add(component) {
    this._componentList.push(component);
  }

  /**
   * 移除组件
   * @param component 组件
   */
  public remove(component) {
    let index = this._componentList.indexOf(component);
    if (index != -1) {
      this._componentList.splice(index, 1);
    }
  }

  /**
   * 获取配置文本
   * @param key key值
   * @param params 传入参数
   * @returns 返回字符串
   */
  public getLabel(key: string, params: string[] = null) {
    this.checkInit();
    if (params == null || params.length == 0) {
      return this._labelConfig[key] || key;
    }
    let str = this._labelConfig[key] || key;
    for (let i = 0; i < params.length; i++) {
      let reg = new RegExp('%' + i, 'g');
      str = str.replace(reg, params[i]);
    }
    return str;
  }

  /**
   * 获取图片
   * @param key key值
   * @param cb 回调
   * @param target 回调对象
   * @returns 返回图片spriteFrame
   */
  public getSpriteFrame(key: string, cb: Function, target: any) {
    this.checkInit();
    let url = this.getSpritePath(this._language, key);
    cc.loader.loadRes(url, cc.SpriteFrame, (err, assets) => {
      if (err == null) {
        cb.call(target, assets);
      } else {
        cb.call(target, null);
      }
    });
  }

  /**检查初始化 */
  private checkInit() {
    if (this._inited == false) {
      this._inited = true;
      this.loadConfig();
    }
  }
}

//
