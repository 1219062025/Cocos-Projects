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
  /** 英文 */
  en = 1,
  /** 巴西 */
  pt = 2,
  /** 菲律宾 */
  fil = 3,
  hi = 4,
  /** 印尼 */
  id = 5,
  // ja = 6,
  // ko = 7,
  /** 俄罗斯 */
  ru = 8,
  tr = 9
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
  '韩国': 'ko'
};

/** 获取国家名字 */
export function GetCountryName(language: string): string | undefined {
  const name = Object.keys(CountryLanguageMap).find(key => CountryLanguageMap[key] === language);
  return name || undefined;
}
