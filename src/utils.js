const fs = require('fs');
const path = require('path');
const GI = require('./build/global.js');

/** 压缩包 */
const zipper = require('zip-local');
/** 代码混淆 */
const uglify = require('uglify-es');
/** css代码混淆 */
const cleancsS = require('clean-css');

/**
 * 得到文件夹下指定格式文件名称列表(去掉后缀名).
 * @param {string} root 路径
 * @param {string} extname 扩展名
 */
function getFileList(root, extname) {
  let files = fs.readdirSync(root);
  return files.filter(file => path.extname(file) === extname).map(file => file.substring(0, file.indexOf('.')));
}

/**
 * 检测指定文件的大小是否超过了指定的size
 * @param {string} path 文件路径
 * @param {string} size 限制的大小，单位是M
 */
function isOverSize(path, size) {
  const stat = fs.statSync(path);
  let fileSize = (stat.size / (1024 * 1024)).toFixed(2);
  if (fileSize >= size) {
    return true;
  }
}

/**
 * 根据键值对存储数据
 * @param {string} key
 * @param {strign} value
 */
function setStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * 根据键值对获取数据
 * @param {string} key
 */
function getStorage(key) {
  return JSON.parse(window.localStorage.getItem(key));
}

/** 清空缓存 */
function clearStorage(key) {
  window.localStorage.removeItem(key);
}

/**
 * 清理html文件中link标签、script标签
 * @param {string} url html文件路径
 */
function clearHtml(url) {
  const html = getFileContent(url);
  return html.replace(/<link rel="stylesheet".*\/>/gs, '').replace(/<script.*<\/script>/gs, '');
}

/**
 * 递归获取路径下所有子文件路径
 * @param {string} url 文件夹路径
 */
function getAllChildFiles(url) {
  let children = [];

  function getChild(filePath) {
    let files = fs.readdirSync(filePath);

    files.forEach(function (item, index) {
      let fPath = path.join(filePath, item);
      let stat = fs.statSync(fPath);

      if (stat.isDirectory()) {
        getChild(fPath);
      }

      if (stat.isFile()) {
        children.push(fPath);
      }
    });
  }

  getChild(url);
  return children;
}

/**
 * 获取文件的内容字符串，特定的后缀名返回base64格式编码的字符串，否则返回文件文件内容字符串。
 * @param {string} url 文件路径
 */
function getFileContent(url) {
  const file = fs.readFileSync(url);
  return GI.cs.RES_BASE64_EXTNAME_SET.has(path.extname(url)) ? file.toString('base64') : file.toString();
}

/**
 * 将内容写入script标签并返回标签字符串形式
 * @param {string} file js文件内容
 * @param {string} minify 是否需要混淆压缩
 */
function writeScriptTag(file, minify = true) {
  const js = minify ? uglify.minify(file).code : file;
  return `<script type="text/javascript">${js}</script>`;
}

/**
 * 获取引用指定js文件的script标签字符串形式
 * @param {string} url 文件路径
 */
function getScriptTag(url) {
  return `<script type="text/javascript" src='${url}'></script>`;
}

/**
 * 将内容写入style标签并返回标签字符串形式
 * @param {string} file css文件内容
 * @param {string} minify 是否需要混淆压缩
 */
function writeStyleTag(file, minify = true) {
  const css = minify ? new cleancsS().minify(file).styles : file;
  return `<style>${css}</style>`;
}

/**
 * 获取指定文件路径的link标签字符串形式
 * @param {string} url 文件路径
 */
function getLinkTag(url) {
  return `<link href='${url}'></link>`;
}

/**
 * 把script标签写入html文件的body标签底部并返回写入后的html字符串形式，不会修改原本html的内容
 * @param {string} tag script标签的字符串形式
 * @param {string} html html文件的字符串形式
 */
function writeScriptToHtml(tag, html) {
  const _html = html;
  return _html.replace('</body>', `${tag}\n</body>`);
}

/**
 * 把script标签写入html文件的body标签顶部并返回写入后的html字符串形式，不会修改原本html的内容
 * @param {string} tag script标签的字符串形式
 * @param {string} html html文件的字符串形式
 */
function writeScriptToHtmlUS(tag, html) {
  const _html = html;
  return _html.replace('<body>', `<body>\n${tag}\n`);
}

/**
 * 把style标签写入html文件并返回写入后的html字符串形式，不会修改原本html的内容
 * @param {string} tag style标签的字符串形式
 * @param {string} html html文件的字符串形式
 */
function writeStyleToHtml(tag, html) {
  const _html = html;
  return _html.replace('</head>', `${tag}\n</head>`);
}

/**
 * 根据传入路径递归创建文件
 * @param {string} url 路径
 */
function recursiveMkdir(url) {
  // 将路径转换为当前操作系统特定的格式
  const normalizedPath = path.normalize(url);

  // 使用递归选项创建目录
  if (!fs.existsSync(normalizedPath)) {
    fs.mkdirSync(normalizedPath, { recursive: true });
  }
}

/**
 * 根据传入路径递归删除文件夹
 * @param {string} filePath 文件路径
 */
async function recursiveRmdir(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) resolve();
    fs.stat(filePath, function (err, stat) {
      if (err) reject(err);
      if (stat.isFile()) {
        fs.unlink(filePath, function (err) {
          if (err) reject(err);
          // Editor.log('rmfile,dir:',filePath)
          resolve();
        });
      } else {
        fs.readdir(filePath, function (err, dirs) {
          if (err) reject(err);
          dirs = dirs.map(dir => path.join(filePath, dir));
          dirs = dirs.map(dir => recursiveRmdir(dir));
          Promise.all(dirs).then(() => {
            // Editor.log('rmdir,dir:',filePath)
            fs.rmdir(filePath, resolve);
          });
        });
      }
    });
  });
}

/**
 * 确保写入文件，如果文件不存在则创建
 * @param {string} filePath 文件路径
 * @param {string} content 内容
 */
function ensureWriteFileSync(filePath, content) {
  const dir = path.dirname(filePath);

  recursiveMkdir(dir);

  // 写入文件
  fs.writeFileSync(filePath, content);
}

module.exports = {
  getFileList,
  isOverSize,
  setStorage,
  getStorage,
  clearStorage,
  clearHtml,
  getFileContent,
  getAllChildFiles,
  writeScriptTag,
  getScriptTag,
  writeStyleTag,
  getLinkTag,
  writeScriptToHtml,
  writeScriptToHtmlUS,
  writeStyleToHtml,
  recursiveMkdir,
  recursiveRmdir,
  ensureWriteFileSync
};
