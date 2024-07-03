const path = require('path');

/**
 * 全局常量类
 * @param config 配置信息
 */
function Constant(config) {
  const base_path = config.input;
  const output_flold = config.ouput;
  const adPlatforms = config.adPlatforms;
  const productList = config.productList;

  //#region 文件路径相关
  /** web-mobile包基础路径，可通过修改面板构建路径选项改变 */
  this.BASE_PATH = base_path || path.join(Editor.Project.path, 'build', 'web-mobile');
  /** 构建后输出的文件路径 */
  this.OUTPUT_FLOLD = output_flold || path.join(base_path, 'dist');
  /** web-mobile包下的res资源路径 */
  this.RES_PATH = path.join(base_path, 'res');
  /** 预设好的html文件路径 */
  this.INPUT_HTML_FILE = path.join(__dirname, 'lib', 'index.html');
  /** 预设好的css文件路径数组 */
  this.INPUT_CSS_FILES = [path.join(__dirname, 'lib', 'style-mobile.css')];
  /** 所有广告平台自定义代码js文件路径 */
  this.AD_PLATFORMS = [];
  adPlatforms.forEach(ad => {
    this.AD_PLATFORMS.push(path.join(Editor.url('packages://ad-build/adPlatforms'), ad + '.js'));
  });
  /** 所有产品的列表 */
  this.PRODUCTLIST = [];
  productList.forEach(product => {
    // 产品图片路径src 数组
    this.PRODUCTLIST.push(path.join(Editor.url('packages://ad-build/products'), product + '.png'));
  });
  /** cocos引擎相关的js文件路径 */
  this.INPUT_JS_FILES = [path.join(base_path, 'cocos2d-js-min.js'), path.join(base_path, 'src', 'settings.js'), path.join(base_path, 'src', 'project.js'), path.join(__dirname, 'lib', 'main.js'), path.join(__dirname, 'lib', 'assetsLoad.js')];
  /** 所有平台打包文件配置 */
  this.PACKAGE_FILE = {
    Pangle: path.join(path.resolve(__dirname, '../../'), 'adConfig', 'Pangle', 'config.json'), // 穿山甲平台需要一起打包的配置文件
    GDT: path.join(path.resolve(__dirname, '../../'), 'adConfig', 'GDT', 'config.json'), // 广点通平台需要一起打包的配置文件
    Tiktok: path.join(path.resolve(__dirname, '../../'), 'adConfig', 'Tiktok', 'config.json'), // 海外穿山甲平台需要一起打包的配置文件
    Vungle: path.join(path.resolve(__dirname, '../../'), 'adConfig', 'Vungle', 'index.html'), // Vungle平台需要一起打包的配置文件
    Bigo: path.join(path.resolve(__dirname, '../../'), 'adConfig', 'Bigo', 'config.json'), // Bigo平台需要一起打包的配置文件
    Kwai: path.join(path.resolve(__dirname, '../../'), 'adConfig', 'Kwai', 'config.json') // Kwai平台需要一起打包的配置文件
  };
  /** PA信息配置文件 */
  this.CONFIGJS = path.join(__dirname, 'lib', 'config.js');
  //#endregion

  //#region 平台SDK地址
  /** 穿山甲SDK地址 */
  this.PANGLE = "<script type='text/javascript' src='https://sf3-ttcdn-tos.pstatp.com/obj/union-fe-nc/playable/sdk/playable-sdk.js'></script>";
  /** 海外穿山甲SDK地址 */
  this.TIKTOK = "<script type='text/javascript' src='https://sf16-muse-va.ibytedtos.com/obj/union-fe-nc-i18n/playable/sdk/playable-sdk.js'></script>";
  /** AdWords SDK地址 */
  this.ADWORDS = "<script type='text/javascript' src='https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js'></script>";
  //$是特殊字符 意思是插入.改成$$$
  this.IRONSOURCE = `<script>function getScript(e, i) { var n = document.createElement("script"); n.type = "text/javascript", n.async = !0, i && (n.onload = i), n.src = e, document.head.appendChild(n) } function parseMessage(e) { var i = e.data, n = i.indexOf(DOLLAR_PREFIX + RECEIVE_MSG_PREFIX); if (-1 !== n) { var t = i.slice(n + 2); return getMessageParams(t) } return {} } function getMessageParams(e) { var i, n = [], t = e.split("/"), a = t.length; if (-1 === e.indexOf(RECEIVE_MSG_PREFIX)) { if (a >= 2 && a % 2 === 0) for (i = 0; a > i; i += 2)n[t[i]] = t.length < i + 1 ? null : decodeURIComponent(t[i + 1]) } else { var o = e.split(RECEIVE_MSG_PREFIX); void 0 !== o[1] && (n = JSON && JSON.parse(o[1])) } return n } function getDapi(e) { var i = parseMessage(e); if (!i || i.name === GET_DAPI_URL_MSG_NAME) { var n = i.data; getScript(n, onDapiReceived) } } function invokeDapiListeners() { for (var e in dapiEventsPool) dapiEventsPool.hasOwnProperty(e) && dapi.addEventListener(e, dapiEventsPool[e]) } function onDapiReceived() { dapi = window.dapi, window.removeEventListener("message", getDapi), invokeDapiListeners() } function init() { window.dapi.isDemoDapi && (window.parent.postMessage(DOLLAR_PREFIX + SEND_MSG_PREFIX + JSON.stringify({ state: "getDapiUrl" }), "*"), window.addEventListener("message", getDapi, !1)) } var DOLLAR_PREFIX = "$$$", RECEIVE_MSG_PREFIX = "DAPI_SERVICE:", SEND_MSG_PREFIX = "DAPI_AD:", GET_DAPI_URL_MSG_NAME = "connection.getDapiUrl", dapiEventsPool = {}, dapi = window.dapi || { isReady: function () { return !1 }, addEventListener: function (e, i) { dapiEventsPool[e] = i }, removeEventListener: function (e) { delete dapiEventsPool[e] }, isDemoDapi: !0 }; init();</script>`;
  this.GDT = "<script type='text/javascript' src='https://qzs.qq.com/union/res/union_sdk/page/unjs/unsdk.js'></script>";
  this.KWAI = "<script src='https://s1.kwai.net/kos/s101/nlav11187/playable/kwai-playable-sdk.js'></script>";
  this.BIGO = "<script type='text/javascript' src='https://static-web.likeevideo.com/as/common-static/big-data/dsp-public/bgy-mraid-sdk.js'></script>";
  //#endregion

  //#region 模板的商店链接
  /** 模板的商店链接 */
  this.TEMPLATE_STORE_URLS = {
    goldenknife: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.goldenknife.real.game'
    },
    easybridge: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.easybridge.real.game'
    },
    goldenpuppy: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.golddoggy.reward.free.game'
    },
    CC: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.mergeball.merge.free.game'
    },
    knifemaster: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.knifemaster.knifehit.bounty'
    },

    //#region  k" puzzle 系列
    puzzlecube: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.puzzlecube.real.game'
    },
    puzzlesugar: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.puzzlesugar.real.game'
    },
    puzzlefruit: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.puzzlefruit.real.game'
    },
    animalcube: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.animalcube.panda.game'
    },
    funnybrain: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.fun.brain.game&hl=en'
    },
    //#endregion  k" puzzle 系列

    //#region k" block 系列
    blockpuzzlemaster: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.blockpuzzlemaster.real.game'
    },
    luckyblockpuzzle: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.luckyblockpuzzle.real.game'
    },
    blockpuzzletangram: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.blockpuzzletangram.real.game'
    },
    blockpuzzlerevolution: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.blockpuzzlerevolution.casual.game'
    },
    blockpuzzlerevolution2: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.blockpuzzlerevolution.casual.game'
    },
    blockpuzzlejourney: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.woodenblockpuzzle.casual.game'
    },
    gempuzzle: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.gempuzzle.panda.game'
    },
    //#endregion  k" block 系列

    //#region k" dots 系列
    dotsconnect: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.dotsconnect.real.game'
    },
    fortunedots: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.fortunedots.real.game'
    },
    easydots: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.easydots.real.game'
    },
    dotspop: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.dotspop.real.game'
    },
    happylink: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.happylink.panda.game'
    },
    linkemup: {
      APPLE_URL: '',
      GOOGLE_URL: ''
    },
    //#endregion k" dots 系列

    //#region k" ball run 2048 系列
    ballrun: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.ballrun.real.game'
    },
    crazyball2048: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.crazyball2048.real.game'
    },
    '2048ballrunner': {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.ballrunner.real.game'
    },
    //#endregion k" ball run 2048 系列

    //#region k" chubby 系列
    chubbygarden: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.chubbygarden.real.game'
    },
    chubbykitten: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.chubbykitten.real.game'
    },
    oceanmerge: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.oceanmerge.real.robux.game'
    },
    toymerge: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.toymerge.real.game'
    },
    shiningocean: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.shiningocean.miso.game&pli=1'
    },

    //#endregion k" chubby 系列

    //#region k" rush 系列
    toiletrush: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.toiletrushmaze.casual.game'
    },
    tilecrush: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.tilecrush.tile.master.blast.free.match'
    },
    //#endregion k" rush 系列

    //#region k" step 系列
    stepmaster: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.stepmaster.free.lucky.step'
    },
    walkward: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.walkward.sweat.step'
    },
    playward: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.walkward.sweat.step'
    },
    stepfit: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.stepfit.step.fit.reward.free&gl=id'
    },
    walkingapp: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.walkingapp.free.lucky.step.reward'
    },
    funsteps: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.funsteps.money.reward.free'
    },
    //#endregion k" step 系列

    //#region k" tube 系列
    happytube: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.happytube.money.reward.free&pli=1'
    },
    joytube: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.joytube.money.reward.free'
    },
    funtube: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.funtube.money.reward.free'
    },
    //#endregion k" tube 系列

    //#region k" 答题 系列
    richquiz: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.richquiz.money.reward.free'
    },
    funscholar: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.funscholar.lucky.reward.money'
    },
    joyquiz: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.joyquiz.lucky.reward.money'
    },
    //#endregion k" 答题 系列

    //#region k" 天气 系列
    weather: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.weather.panda.tool'
    },
    //#endregion k" weather 系列

    //#region k" walk 系列
    happywalk: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.happywalk.free.lucky.step'
    },
    //#endregion k" walk 系列

    // pt
    luckycoinpusher: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.sunsetstropics.gamepusher'
    },
    funwalk: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.funwalk.lucky.step'
    },

    walksup: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=zerolab.app.walksup'
    },

    fruitjourney: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=com.fruitjourney.free.game'
    },
    luckywalker: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=uuc.lucky.stepfun'
    },
    bebamais: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=sgwt.health.drinkmore'
    },
    stepup: {
      APPLE_URL: '',
      GOOGLE_URL: 'https://play.google.com/store/apps/details?id=uuc.step.stepup'
    }
  };
  //#endregion

  //#region 其他
  /** 需要使用base64编码的资源后缀(根据项目自行扩充) */
  this.RES_BASE64_EXTNAME_SET = new Set(['.png', '.jpg', '.webp', '.mp3', '.bin', '.wav', '.dbbin', '.mp4', '.plist', '.PNG', '.JPG', '.fnt', '.ttf', '.TTF', '.woff', '.woff2']);
  /** 需要html分包的平台 */
  this.SPLIT_BUILD_AD = ['Facebook'];
  //#endregion
}

module.exports = Constant;
