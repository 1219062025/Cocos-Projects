/** 全局对象 */
const GI = {
  /** 配置信息 */
  config: {
    /** 配置-广告平台列表 */
    adPlatforms: [''],
    /** 配置-方向 */
    orientation: 0,
    /** 配置-Tikok支持语言 */
    languages: [''],
    /** 配置-MTG支持语言 */
    mtg_languages: [''],
    /** 配置-是否基于模板打包 */
    isTemplate: false,
    /** 配置-产品列表 */
    productList: [''],
    /** 配置-是否全选模板 */
    allSelected: false,
    /** 配置-是否需要替换对应产品的URL */
    replaceUrl: false,
    /** 配置-项目构建后的路径 */
    input: '',
    /** 配置-项目打包后的输出路径 */
    output: ''
  },
  /** 全局常量 */
  cs: {
    /** web-mobile包基础路径，可通过修改面板构建路径选项改变 */
    BASE_PATH: '',
    /** 构建后输出的文件路径 */
    OUTPUT_FLOLD: '',
    /** web-mobile包下的res资源路径 */
    RES_PATH: '',
    /** 需要使用base64编码的资源后缀(根据项目自行扩充) */
    RES_BASE64_EXTNAME_SET: new Set([]),
    /** 预设好的html文件路径 */
    INPUT_HTML_FILE: '',
    /** 预设好的css文件路径数组 */
    INPUT_CSS_FILES: [''],
    /** 所有广告平台自定义代码js文件路径 */
    AD_PLATFORMS: [''],
    /** 产品图片路径数组 */
    PRODUCTLIST: [''],
    /** 所有平台打包文件配置 */
    PACKAGE_FILE: {},
    /** 穿山甲SDK地址 */
    PANGLE: '',
    /** 海外穿山甲SDK地址 */
    TIKTOK: '',
    /** AdWords SDK地址 */
    ADWORDS: '',
    /** IRONSOURCE SDK */
    IRONSOURCE: '',
    /** GDT SDK */
    GDT: '',
    /** KWAI SDK */
    KWAI: '',
    /** BIGO SDK */
    BIGO: '',
    /** PA信息配置文件 */
    CONFIGJS: '',
    /** cocos引擎相关的js文件 */
    INPUT_JS_FILES: [''],
    /** 模板的商店链接 */
    TEMPLATE_STORE_URLS: {},
    /** 需要html分包的平台 */
    SPLIT_BUILD_AD: ['']
  }
};
module.exports = GI;
