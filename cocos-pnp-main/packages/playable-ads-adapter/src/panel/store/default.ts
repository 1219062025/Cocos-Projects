import { ref, reactive, toRefs } from "vue";
import { readFileSync } from "fs-extra";
import { join } from "path";
import { getFileNameList } from "@/extensions/utils";

const store = reactive({
  /** 可玩广告打包配置 */
  config: reactive<TPanelAdapterRC>({
    skipBuild: false,
    buildPlatform: "web-mobile",
    exportChannels: new Set([
      "AppLovin",
      "IronSource",
      "Facebook",
      "Google",
      "Tiktok",
      "Unity",
      "Mintegral",
    ]),
    orientation: "auto",
    tiktok_languages: new Set(["en"]),
    mtg_languages: new Set(["en"]),
    product: "",
    replaceUrl: true,
    enableSplash: true,
    isZip: true,
    tinify: false,
    tinifyApiKey: "KNshdGvKnVgJ76SSVxf8lvztVCC4d8c1",
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
  buildPlatform: ref(["web-mobile", "web-desktop"]),

  /** 平台列表 */
  exportChannels: ref([
    "AppLovin",
    "Facebook",
    "Google",
    "Bigo",
    "IronSource",
    "Liftoff",
    "Mintegral",
    "Moloco",
    "Pangle",
    "Rubeex",
    "Tiktok",
    "Unity",
  ]),

  /** 产品列表 */
  products: ref(
    getFileNameList(join(__dirname, "../panel/products"), [
      ".png",
      ".jpg",
      ".jpeg",
    ])
  ),

  /** 方向列表 */
  orientations: ref(["auto", "portrait", "landscape"]),

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
