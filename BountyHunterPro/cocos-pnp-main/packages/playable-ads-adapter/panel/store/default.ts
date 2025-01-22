import { ref, reactive, toRefs } from "vue";
import { readFileSync } from "fs-extra";
import { join } from "path";
import utils from "../utils";
// import * as files from '../adPlatforms/*.ts';

/** 试玩广告打包配置 */
export interface Config {
  /** 配置-广告平台列表 */
  adPlatforms: Set<string>;
  /** 配置-方向 */
  orientation: number;
  /** 配置-Tikok支持语言 */
  languages: Set<string>;
  /** 配置-MTG支持语言 */
  mtg_languages: Set<string>;
  /** 配置-是否基于模板打包 */
  isTemplate: boolean;
  /** 配置-产品列表 */
  products: Set<string>;
  /** 配置-是否全选模板 */
  allSelected: boolean;
  /** 配置-是否需要替换对应产品的URL */
  replaceUrl: boolean;
  /** 配置-项目构建后的路径 */
  input: string;
  /** 配置-项目打包后的输出路径 */
  output: string;
}

const store = reactive({
  /** 试玩广告打包配置 */
  config: reactive<Config>({
    adPlatforms: new Set([
      "Applovin",
      "IronSource",
      "Tiktok",
      "Unity",
      "Mintegral",
    ]),
    orientation: 0,
    languages: new Set(["en"]),
    mtg_languages: new Set(["en"]),
    isTemplate: true,
    products: new Set([]),
    allSelected: false,
    replaceUrl: true,
    input: join(Editor.Project.path, "build", "web-mobile"),
    output: join(Editor.Project.path, "build", "web-mobile", "dist"),
  }),

  /** 打包信息提示 */
  tips: ref(""),

  /** 打包进度 */
  progress: ref(0),

  /** 是否处于打包中 */
  isPackage: ref(false),

  /** 平台列表 */
  adPlatforms: ref(
    // utils.getFileNameList(join(__dirname, "../adPlatforms"), ".js")
    ["Applovin", "IronSource", "Tiktok", "Unity", "Mintegral"]
  ),

  /** 产品列表 */
  products: ref(
    // utils.getFileNameList(join(__dirname, "../products"), ".png")
    ["product1", "product2", "product3"]
  ),

  /** 方向列表 */
  orientationOptions: reactive({
    Portrait: { value: 1, checked: true },
    Landscape: { value: 1, checked: true },
  }),

  /** Tikok支持语言列表 */
  languagesOptions: new Set([
    { label: "英语", abbr: "en" },
    { label: "巴西", abbr: "pt" },
    { label: "印度", abbr: "in" },
    { label: "印尼语", abbr: "id" },
    { label: "印地语", abbr: "hi" },
    { label: "越南语", abbr: "vi" },
    { label: "菲律宾语", abbr: "fil" },
    { label: "土耳其语", abbr: "tr" },
    { label: "尼日利亚", abbr: "ng" },
    { label: "韩语", abbr: "ko" },
    { label: "西班牙语", abbr: "es" },
    { label: "俄语", abbr: "ru" },
    { label: "泰语", abbr: "th" },
    { label: "马来语", abbr: "ms" },
    { label: "阿拉伯语", abbr: "ar" },
    { label: "繁体中文", abbr: "zh-Hant" },
    { label: "日语", abbr: "ja" },
    { label: "德语", abbr: "de" },
    { label: "法语", abbr: "fr" },
    { label: "台湾", abbr: "tw" },
    { label: "墨西哥", abbr: "mx" },
  ]),

  /** MTG支持语言列表 */
  mtg_languagesOptions: new Set([
    { label: "英语", abbr: "en" },
    { label: "葡萄牙语", abbr: "pt" },
    { label: "印度", abbr: "in" },
    { label: "印尼语", abbr: "id" },
    { label: "印地语", abbr: "hi" },
    { label: "越南语", abbr: "vi" },
    { label: "菲律宾语", abbr: "fil" },
    { label: "土耳其语", abbr: "tr" },
    { label: "尼日利亚", abbr: "ng" },
    { label: "韩语", abbr: "ko" },
    { label: "西班牙语", abbr: "es" },
    { label: "俄语", abbr: "ru" },
    { label: "泰语", abbr: "th" },
    { label: "马来语", abbr: "ms" },
    { label: "阿拉伯语", abbr: "ar" },
    { label: "繁体中文", abbr: "zh-Hant" },
    { label: "日语", abbr: "ja" },
    { label: "德语", abbr: "de" },
    { label: "法语", abbr: "fr" },
    { label: "台湾", abbr: "tw" },
    { label: "墨西哥", abbr: "mx" },
  ]),
});

export default toRefs(store);
