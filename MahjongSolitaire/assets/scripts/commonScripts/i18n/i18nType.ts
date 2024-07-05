/** cocos编辑器属性检查器@property选项 */
export const PropertyType = cc.Enum({
  Label: 0,
  Sprite: 1,
  RichText: 2,
  Mask: 3,
  Particle: 4
});

/** 根据选项获取组件类型Prop */
export const ComponentType = new Map([
  [PropertyType.Label, 'Label'],
  [PropertyType.Sprite, 'Sprite'],
  [PropertyType.RichText, 'RichText'],
  [PropertyType.Mask, 'Mask'],
  [PropertyType.Particle, 'Particle']
]);

/** 语言简写对于编号 */
export enum Language {
  /** 英语 */
  en,
  /** 巴西 */
  // pt,
  /** 印度 */
  // in,
  /** 印尼语 */
  id,
  /** 印地语 */
  // hi,
  /** 越南语 */
  vi,
  /** 菲律宾语 */
  // fil,
  /** 土耳其语 */
  // tr,
  /** 尼日利亚 */
  // ng,
  /** 韩语 */
  ko,
  /** 西班牙语 */
  // es,
  /** 俄语 */
  // ru,
  /** 泰语 */
  th,
  /** 马来语 */
  ms,
  /** 阿拉伯语 */
  // ar,
  /** 繁体中文 */
  // 'zh-Hant',
  /** 日语 */
  ja,
  /** 德语 */
  // de,
  /** 法语 */
  // fr,
  /** 台湾 */
  tw
  /** 墨西哥 */
  // mx
}

/** 国家对应的语言简写 */
export const CountryLanguageMap = {
  '美国': 'en',
  '印尼': 'id',
  '巴西': 'pt',
  '印度': 'hi',
  '俄罗斯': 'ru',
  '阿拉伯': 'ar',
  '菲律宾': 'fil',
  '土耳其': 'tr',
  '西班牙': 'es',
  '越南': 'vi',
  '德国': 'de',
  '法国': 'fr',
  '日本': 'ja',
  '韩国': 'ko',
  '中国-台湾': 'tw'
};

/** 获取国家名字 */
export function GetCountryName(language: string): string | undefined {
  const name = Object.keys(CountryLanguageMap).find(key => CountryLanguageMap[key] === language);
  return name || undefined;
}
