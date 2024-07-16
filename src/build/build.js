const { ipcMain, dialog, shell } = require('electron');
const Constant = require('./constant.js');
const path = require('path');
const fs = require('fs');
const utils = require('../utils.js');
const GI = require('./global.js');

/** 压缩包 */
const zipper = require('zip-local');
/** 代码混淆 */
const uglify = require('uglify-es');
/** css代码混淆 */
const cleanCSS = require('clean-css');

/** 初始化 */
function init() {
  ipcMain.on('ad-build:build', run);
}
/** 销毁 */
function destroy() {
  ipcMain.off('ad-build:build', run);
}

//#region 核心-运行构建
/** 运行构建 */
async function run(event, args) {
  // 获取打包面板选择的配置信息
  GI.config = JSON.parse(args);
  // 初始化全局常量
  GI.cs = new Constant(GI.config);
  // 重置变量
  publicHtml = '';
  splitHtml = '';
  resjs = '';
  curProgress = 0;
  overSizeFileInfo = [];

  // 存在cocos2d-js-min.js的话才开始运行构建
  if (!fs.existsSync(path.join(GI.cs.BASE_PATH, 'cocos2d-js-min.js'))) {
    dialog.showErrorBox('警告', '指定的构建路径找不到cocos2d-js-min.js文件，如果确定已经构建过项目并且路径正确的话，检查是否正确的在构建的时候取消勾选MD5 Cache选项，这会导致cocos2d-js-min.js文件后附带MD5从而无法匹配字符串!');
    return;
  }

  /** 写入所有resjs */
  resjs = await getResJs();

  // 输出打包文件到指定路径前清空该路径下所有文件
  await utils.recursiveRmdir(path.join(GI.cs.OUTPUT_FLOLD));

  /** PA信息配置文件的script标签 */
  const _PAConfigScriptTag = getPAConfigScriptTag();

  await setProgress(10, '清空输出路径下所有文件');

  for (const url of GI.cs.AD_PLATFORMS) {
    /** 平台名称 */
    const adName = path.basename(url, '.js');
    /** 平台html文件内容 */
    let adHtml = getAdHtml(adName, url);
    /** PA配置信息script标签 */
    let PAConfigScriptTag = _PAConfigScriptTag;
    /** 打包后输出的文件夹根路径 ~projectPath/build/web-mobile/dist/ */
    let baseUrl = path.join(GI.cs.OUTPUT_FLOLD);
    /** 该平台打包后最终输出的文件夹路径 */
    let output = baseUrl;

    const incProgress = Math.floor(80 / GI.cs.AD_PLATFORMS.length / 2);
    await setProgress(curProgress + incProgress, `开始打包${adName}平台`);

    /** 每个平台都基于面板选择的模板打包 */
    if (GI.config.isTemplate) {
      GI.cs.PRODUCTLIST.forEach(async productIconUrl => {
        /** 模板的ICON图片的名称 */
        let productIconName = path.basename(productIconUrl, '.png');
        /** 模板的产品名称 */
        let productName = productIconName.substring(productIconName.indexOf('_') + 1);
        /** 模板的ICON图片的base64路径 */
        let productIconBase64 = utils.getFileContent(productIconUrl);

        // 设置该模板最终输出路径：~projectPath/build/web-mobile/dist/产品名称/平台名
        output = path.join(baseUrl, `${productIconName}`, adName);

        // Unity平台，面板如果勾选了替换商店URL则进行替换
        if (['Unity'].includes(adName) && GI.config.replaceUrl) {
          /** 产品名称去掉横杠并且全小写 */
          const productNameLowerCase = productIconName.split('-').join('').toLowerCase();
          /** 商店URL对象 */
          const url = GI.cs.TEMPLATE_STORE_URLS[productNameLowerCase];

          if (!url) return Editor.error('替换商店URL时找不到对应的URL，请确认URL是否已经正确填写!');

          PAConfigScriptTag = PAConfigScriptTag.replace('#APPLE_URL', url.APPLE_URL);
          PAConfigScriptTag = PAConfigScriptTag.replace('#GOOGLE_URL', url.GOOGLE_URL);
        }

        // 替换配置中的产品名称
        PAConfigScriptTag = PAConfigScriptTag.replace('#APP_NAME', productName);
        // 将ICON的base64地址填入模板中
        adHtml = adHtml.replace('#ICON', 'data:image/png;base64,' + productIconBase64);
        // 替换html的title
        adHtml = adHtml.replace('<title>Title</title>', `<title>${productName.split('-').join('')}</title>`);

        const options = { adName, adHtml, output, PAConfigScriptTag, zipName: `${productIconName}`, title: productName };
        packaging(options);
      });
    } else {
      adHtml = adHtml.replace('<title>Title</title>', `<title>${Editor.Project.name}</title>`);

      const options = { adName, adHtml, output, PAConfigScriptTag, zipName: Editor.Project.name, title: Editor.Project.name };
      packaging(options);
    }

    await setProgress(curProgress + incProgress, `打包${adName}平台完成`);
  }

  await setProgress(curProgress, '所有平台打包完成，准备验证...');

  await setProgress(92, '检查文件大小是否通过验证');
  if (overSizeFileInfo.length >= 1) {
    let content = '';
    for (let key in overSizeFileInfo) {
      const item = overSizeFileInfo[key];
      content = content + `限制的大小为${item.size}M:\n` + item.path + '\n';
    }
    dialog.showErrorBox('存在文件大小突破限制', content);
  }
  await setProgress(95, '打开打包输出路径...');

  shell.showItemInFolder(GI.cs.OUTPUT_FLOLD); // 打包成功后弹出资源管理器
  await setProgress(100, '完成');
}
//#endregion 核心-运行构建

//#region 平台单独处理
/**
 * 对不同平台单独进行打包处理
 * @param {string} options.adName 广告平台名称
 * @param {string} options.adHtml 广告平台html文件
 * @param {string} options.output 输出路径
 * @param {string} options.PAConfigScriptTag PA配置信息script标签
 * @param {string} options.zipName 压缩包的名字
 * @param {string} options.title index.html的title标签文本
 */
async function packaging(options) {
  utils.recursiveMkdir(options.output);

  switch (options.adName) {
    case 'Pangle':
      packagePangolin(options);
      break;
    case 'Tiktok':
      packageTiktok(options);
      break;
    case 'GDT':
      packageGDT(options);
      break;
    case 'Mintegral':
      packageMTG(options);
      break;
    case 'IronSource':
      packageIronSource(options);
      break;
    case 'Vungle':
      packageVungle(options);
      break;
    case 'Bigo':
      packageBigo(options);
      break;
    case 'Kwai':
      packageKwai(options);
      break;
    case 'AdWords':
      packageAdWords(options);
      break;
    case 'Facebook':
      packageFacebook(options);
      break;

    default:
      packageDefault(options);
      break;
  }
}

function packagePangolin(options) {
  // 将平台的html内容写入到输出路径的index.html文件中
  options.adHtml = options.adHtml.replace('<body>', `<body>\n${GI.cs.PANGLE}`);
  options.adHtml = utils.writeScriptToHtmlUS(options.PAConfigScriptTag, options.adHtml);
  fs.writeFileSync(path.join(options.output, 'index.html'), options.adHtml);

  collectOverSizeFileInfo(path.join(options.output, 'index.html'));

  // 将平台的配置文件内容写入到输出路径的config.json文件中
  let configFile = utils.getFileContent(GI.cs.PACKAGE_FILE[options.adName]);
  configFile = configFile.replace('999', JSON.stringify(GI.config.orientation));
  fs.writeFileSync(path.join(options.output, 'config.json'), configFile);

  zipper.sync
    .zip(options.output)
    .compress()
    .save(path.join(options.output, options.adName + '_头.zip'));
}

function packageTiktok(options) {
  // 将平台的html内容写入到输出路径的index.html文件中
  options.adHtml = options.adHtml.replace('<body>', `<body>\n${GI.cs.TIKTOK}`);
  options.adHtml = utils.writeScriptToHtmlUS(options.PAConfigScriptTag, options.adHtml);
  fs.writeFileSync(path.join(options.output, 'index.html'), options.adHtml);

  collectOverSizeFileInfo(path.join(options.output, 'index.html'));

  // 将平台的配置文件内容写入到输出路径的config.json文件中
  let configFile = utils.getFileContent(GI.cs.PACKAGE_FILE[options.adName]);
  configFile = configFile.replace('[]', JSON.stringify(GI.config.languages));
  configFile = configFile.replace('999', JSON.stringify(GI.config.orientation));
  fs.writeFileSync(path.join(options.output, 'config.json'), configFile);
  zipper.sync
    .zip(options.output)
    .compress()
    .save(path.join(options.output, options.adName + '_tiktok.zip'));
}

function packageGDT(options) {
  // 将平台的html内容写入到输出路径的index.html文件中
  options.adHtml = options.adHtml.replace('<body>', `<body>\n${GI.cs.GDT}`);
  options.adHtml = utils.writeScriptToHtmlUS(options.PAConfigScriptTag, options.adHtml);
  fs.writeFileSync(path.join(options.output, 'index.html'), options.adHtml);

  collectOverSizeFileInfo(path.join(options.output, 'index.html'));

  // 将平台的配置文件内容写入到输出路径的config.json文件中
  let configFile = utils.getFileContent(GI.cs.PACKAGE_FILE[options.adName]);
  configFile = configFile.replace('999', JSON.stringify(GI.config.orientation));
  fs.writeFileSync(path.join(options.output, 'config.json'), configFile);

  zipper.sync
    .zip(options.output)
    .compress()
    .save(path.join(options.output, options.adName + '_广点通.zip'));
}

function packageMTG(options) {
  // Mintegral平台需要为每种选择的语言都单独打包
  for (let i = 0; i < GI.config.mtg_languages.length; i++) {
    /** 语言代码缩写，例如en、pt */
    const ml = GI.config.mtg_languages[i];

    // 将平台的html内容写入到输出路径的`index_MTG_${ml}.html`文件中
    options.adHtml = options.adHtml.replace(`<title>${options.title}</title>`, `<title>${options.title}_${ml}</title>`);
    options.adHtml = utils.writeScriptToHtmlUS(options.PAConfigScriptTag, options.adHtml);
    fs.writeFileSync(path.join(options.output, `index_MTG_${ml}.html`), options.adHtml);

    collectOverSizeFileInfo(path.join(options.output, `index_MTG_${ml}.html`));

    zipper.sync
      .zip(path.join(options.output, `index_MTG_${ml}.html`))
      .compress()
      .save(path.join(options.output, `index_MTG_${ml}.zip`));
  }
}

function packageIronSource(options) {
  // 将平台的html内容写入到输出路径的index.html文件中
  options.adHtml = options.adHtml.replace('<body>', `<body>\n${GI.cs.IRONSOURCE}`);
  options.adHtml = utils.writeScriptToHtmlUS(options.PAConfigScriptTag, options.adHtml);
  fs.writeFileSync(path.join(options.output, 'index.html'), options.adHtml);

  collectOverSizeFileInfo(path.join(options.output, 'index.html'));
}

function packageVungle(options) {
  // 将平台的html内容写入到输出路径的ad.html文件中
  options.adHtml = utils.writeScriptToHtmlUS(options.PAConfigScriptTag, options.adHtml);
  fs.writeFileSync(path.join(options.output, 'ad.html'), options.adHtml);

  collectOverSizeFileInfo(path.join(options.output, 'ad.html'));

  // 将平台的配置文件内容写入到输出路径的index.html文件中
  let configFile = utils.getFileContent(GI.cs.PACKAGE_FILE[options.adName]);
  fs.writeFileSync(path.join(options.output, 'index.html'), configFile);

  zipper.sync
    .zip(options.output)
    .compress()
    .save(path.join(options.output, options.adName + '_Vungle.zip'));
}

function packageBigo(options) {
  // 将平台的html内容写入到输出路径的index.html文件中
  options.adHtml = options.adHtml.replace('<body>', `<body>\n${GI.cs.BIGO}`);
  options.adHtml = utils.writeScriptToHtmlUS(options.PAConfigScriptTag, options.adHtml);
  fs.writeFileSync(path.join(options.output, 'index.html'), options.adHtml);

  collectOverSizeFileInfo(path.join(options.output, 'index.html'));

  // 将平台的配置文件内容写入到输出路径的config.json文件中
  let configFile = utils.getFileContent(GI.cs.PACKAGE_FILE[options.adName]);
  fs.writeFileSync(path.join(options.output, 'config.json'), configFile);

  zipper.sync
    .zip(options.output)
    .compress()
    .save(path.join(options.output, options.adName + '_Bigo.zip'));
}

function packageKwai(options) {
  // 将平台的html内容写入到输出路径的index.html文件中
  options.adHtml = options.adHtml.replace('<head>', `${GI.cs.KWAI}\n</head>`);
  options.adHtml = utils.writeScriptToHtmlUS(options.PAConfigScriptTag, options.adHtml);
  fs.writeFileSync(path.join(options.output, 'index.html'), options.adHtml);

  collectOverSizeFileInfo(path.join(options.output, 'index.html'));

  // 将平台的配置文件内容写入到输出路径的config.json文件中
  let configFile = utils.getFileContent(GI.cs.PACKAGE_FILE[options.adName]);
  fs.writeFileSync(path.join(options.output, 'config.json'), configFile);

  zipper.sync
    .zip(options.output)
    .compress()
    .save(path.join(options.output, options.adName + '_Kwai.zip'));
}

function packageAdWords(options) {
  // 将平台的html内容写入到输出路径的index.html文件中
  options.adHtml = options.adHtml.replace('</title>', `</title>\n${'<meta name="ad.size" content="width=300,height=250">'}\n`);
  options.adHtml = utils.writeScriptToHtmlUS(options.PAConfigScriptTag, options.adHtml);
  fs.writeFileSync(path.join(options.output, 'index.html'), options.adHtml);

  collectOverSizeFileInfo(path.join(options.output, 'index.html'));

  zipper.sync
    .zip(options.output)
    .compress()
    .save(path.join(options.output, options.adName + '_AdWords.zip'));
}

function packageFacebook(options) {
  // 将平台的html内容写入到输出路径的index.html文件中
  options.adHtml = utils.writeScriptToHtmlUS(options.PAConfigScriptTag, options.adHtml);
  fs.writeFileSync(path.join(options.output, 'index.html'), options.adHtml);

  collectOverSizeFileInfo(path.join(options.output, 'index.html'), 2);

  // 将分割出去的文件都放入文件夹中后面压缩到一起
  fs.writeFileSync(path.join(options.output, 'res.js'), resjs);

  GI.cs.INPUT_JS_FILES.forEach(url => {
    const file = utils.getFileContent(url);
    fs.writeFileSync(path.join(options.output, path.basename(url)), uglify.minify(file).code);
  });

  zipper.sync
    .zip(options.output)
    .compress()
    .save(path.join(options.output, options.adName + '_Facebook.zip'));
}

function packageDefault(options) {
  // 将平台的html内容写入到输出路径的index.html文件中
  options.adHtml = utils.writeScriptToHtmlUS(options.PAConfigScriptTag, options.adHtml);
  fs.writeFileSync(path.join(options.output, 'index.html'), options.adHtml);

  collectOverSizeFileInfo(path.join(options.output, 'index.html'));
}

//#endregion 平台单独处理

//#region 辅助函数
/** 根据平台返回对应的html模板 */
function getAdHtml(adName, url) {
  /** 获取平台自定义代码 */
  const file = utils.getFileContent(url);
  const scriptTag = utils.writeScriptTag(file);

  if (GI.cs.SPLIT_BUILD_AD.includes(adName)) {
    return utils.writeScriptToHtml(scriptTag, getSplitHtml());
  } else {
    return utils.writeScriptToHtml(scriptTag, getPublicHtml());
  }
}

/** 默认html模板 */
var publicHtml = '';
/** 获取默认html，也就是所有css代码、js代码都经过混淆后直接放入html里面。html体积大，一般没要求都用默认html就行 */
function getPublicHtml() {
  if (publicHtml) return publicHtml;
  let _html = utils.clearHtml(GI.cs.INPUT_HTML_FILE);

  // 写入lib文件夹下css文件到html
  GI.cs.INPUT_CSS_FILES.forEach(url => {
    const file = utils.getFileContent(url);
    const styleTag = utils.writeStyleTag(file);
    _html = utils.writeStyleToHtml(styleTag, _html);
  });

  // 写入cocos引擎的一些文件
  GI.cs.INPUT_JS_FILES.forEach(url => {
    const file = utils.getFileContent(url);
    const scriptTag = utils.writeScriptTag(file);
    _html = utils.writeStyleToHtml(scriptTag, _html);
  });

  // 写入res.js到html
  const scriptTag = utils.writeScriptTag(resjs);
  publicHtml = _html = utils.writeScriptToHtml(scriptTag, _html);
  return publicHtml;
}

/** 分割html模板 */
var splitHtml = '';
/** 获取分割html，也就是将部分css代码、js代码通过link、scripte标签引用的格式放入html里面。html体积小。像是facebook平台要求html小的时候就用得上 */
function getSplitHtml() {
  if (splitHtml) return splitHtml;
  let _html = utils.clearHtml(GI.cs.INPUT_HTML_FILE);

  // 写入lib文件夹下css文件到html
  GI.cs.INPUT_CSS_FILES.forEach(url => {
    const file = utils.getFileContent(url);
    const styleTag = utils.writeStyleTag(file);
    _html = utils.writeStyleToHtml(styleTag, _html);
  });

  // 写入cocos引擎的一些文件
  GI.cs.INPUT_JS_FILES.forEach(url => {
    const scriptTag = utils.getScriptTag(`./${path.basename(url)}`);
    _html = utils.writeScriptToHtml(scriptTag, _html);
  });

  // 写入res.js的script标签到html
  const scriptTag = utils.getScriptTag('./res.js');
  splitHtml = _html = utils.writeScriptToHtml(scriptTag, _html);
  return splitHtml;
}

/** 获取PA信息配置文件的script标签 */
function getPAConfigScriptTag() {
  /** 获取平台自定义代码 */
  const file = utils.getFileContent(GI.cs.CONFIGJS);
  const scriptTag = utils.writeScriptTag(file);
  return scriptTag;
}

/** 文件大小超过了指定size的文件信息 */
var overSizeFileInfo = [];
/**
 * 检测指定文件是否超过size，如果是则将信息收集起来
 * @param {string} path 文件路径
 * @param {string} size 限制的大小，单位是M
 */
function collectOverSizeFileInfo(path, size = 4.9) {
  if (utils.isOverSize(path, size)) overSizeFileInfo.push({ path, size });
}

/** 所有res路径下的资源整合后得到的字符串形式 */
var resjs = '';
/**
 * 将所有res路径下的资源整合
 */
async function getResJs() {
  if (resjs !== '') return resjs;
  // 读取并写入到一个对象中
  let resObject = {};
  let storePath = {};
  utils.getAllChildFiles(GI.cs.RES_PATH).forEach((path, index) => {
    // 注意,存储时删除BASE_PATH前置
    if (Editor.isWin32) {
      storePath = path.replace(GI.cs.BASE_PATH + '\\', '').replace(/\\/g, '/');
    } else if (Editor.isDarwin) {
      storePath = path.replace(new RegExp(`^${GI.cs.BASE_PATH}/`), '');
    }
    resObject[storePath] = utils.getFileContent(path);
  });

  resjs = `window.res=${JSON.stringify(resObject)}`;
  return resjs;
}

/** 当前打包进度 */
var curProgress = 0;
/**
 * 设置进度
 * @param {number} progress 要设置进度为多少
 * @param {string} tips 控制台打印信息
 */
async function setProgress(progress, tips) {
  curProgress = progress;
  Editor.log(curProgress, tips);
  return new Promise(resolve => {
    Editor.Ipc.sendToPanel('ad-build', 'get-progress', { progress, tips }, (error, args) => {
      resolve();
    });
  });
}
//#endregion

module.exports = {
  init,
  destroy,
  run
};
