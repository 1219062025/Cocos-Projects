import { join } from "path";
import { CheerioAPI, load } from "cheerio";
import {
  getAdapterRCJson,
  getBase64FromFile,
  getFileSize,
  getOriginPkgPath,
  getResourceMapper,
  readToPath,
  writeToPath,
} from "@/utils";
import { jszipCode } from "@/helpers/injects";
import { deflate } from "pako";
import { TRANSPARENT_GIF } from "@/constants";

type TOptions = {
  singleFilePath: string;
  injectsCode: {
    init: string;
    main: string;
  };
};

/** 将html文档中所有请求外部的style标签转化成内联style标签 */
const paddingStyleTags = ($: CheerioAPI) => {
  const { enableSplash = true } = getAdapterRCJson() || {};
  // Original package path
  const originPkgPath = getOriginPkgPath();

  // Convert external CSS files into inline tags
  $('link[type="text/css"]')
    .toArray()
    .forEach((item) => {
      const href = $(item).attr("href");
      if (!href) {
        return;
      }
      const cssStr = readToPath(join(originPkgPath, href), "utf-8");
      // Add some tags
      $(`<style>${cssStr}</style>`).appendTo("head");
    });
  // Hide progress bar, set the opacity to 0, and set the visibility to hidden
  if (!enableSplash) {
    $(
      `<style>#splash .progress-bar{opacity:0;visibility:hidden}</style>`
    ).appendTo("head");
  }

  $('link[type="text/css"]').remove();

  // Support for splash screen
  $("head")
    .find("style")
    .each((_index, elem) => {
      // Match css url
      const cssUrlReg = /url\("?'?.*"?'?\)/g;
      let styleTagStr = $(elem).html() || "";

      const matchStrList = styleTagStr.match(cssUrlReg);
      if (!matchStrList) return;

      matchStrList.forEach((str) => {
        // Match url
        const strReg = /"|'|url|\(|\)/g;
        const imgUrl = str.replace(strReg, "");
        const imgBase64 = enableSplash
          ? getBase64FromFile(join(originPkgPath, imgUrl))
          : TRANSPARENT_GIF;
        styleTagStr = styleTagStr.replace(cssUrlReg, `url(${imgBase64})`);
      });
      $(elem).html(styleTagStr).html();
    });
};

/** 将html文档中所有请求外部的script标签转化成内联script标签 */
const paddingScriptTags = ($: CheerioAPI) => {
  // Original package path
  const originPkgPath = getOriginPkgPath();

  let scriptTags = "";
  // 遍历文档html中所有请求外部资源的script标签，获取其请求外部资源的文件路径href；调用readToPath将href对应的文件转化成字符串，然后将该字符串直接塞入script标签中（内联）
  $('script[type="systemjs-importmap"]')
    .toArray()
    .forEach((item) => {
      const href = $(item).attr("src");
      if (!href) {
        return;
      }
      let scriptStr = readToPath(join(originPkgPath, href), "utf-8");
      // Add some tags
      scriptTags += `<script type="systemjs-importmap">${scriptStr}</script>`;
    });

  // Clear script tags in HTML
  $("head link").remove();
  $("body script").remove();

  // 追加内联script标签到body中
  $(scriptTags).appendTo("body");
};

/** 提取setting.json中的plugins.jsList属性到jsList中并返回jsList；并清空原来的plugins.jsList，其实就是将jsList（插件脚本）向外面提了一层 */
const getJsListFromSettingsJson = (
  data: string
): { jsList: string[]; settingsData: { [key: string]: any } } => {
  let jsonData = JSON.parse(data);
  jsonData.plugins = {
    jsList: [],
    ...jsonData.plugins,
  };
  const jsList = [...jsonData.plugins.jsList];
  jsonData.plugins.jsList = [];
  return {
    jsList,
    settingsData: jsonData,
  };
};

const getJsListFromSettingsJs = (
  data: string
): { jsList: string[]; settingsData: string } => {
  const originData = {
    jsList: [],
    settingsData: data,
  };

  // check jsList
  let settingsStrList = data.split("jsList:");
  if (settingsStrList.length < 2) {
    return originData;
  }

  // get jsList
  const settingsStr = settingsStrList.pop() || "";
  const regExp = /\[[^\]]*\]/;
  const jsListStrRegExp = regExp.exec(settingsStr);
  if (!jsListStrRegExp) {
    return originData;
  }
  const jsListStr = jsListStrRegExp[0];
  return {
    jsList: JSON.parse(jsListStr),
    settingsData: data.replace(jsListStr, "[]"),
  };
};

/** 尝试压缩并内联最终构建产物目录下的文件 */
const paddingAllResToMapped = async (options: {
  injectsCode: TOptions["injectsCode"];
  $: CheerioAPI;
}) => {
  const { isZip = true, enableSplash = true } = getAdapterRCJson() || {};

  const { injectsCode, $ } = options;
  // Original package path
  const originPkgPath = getOriginPkgPath();

  let pluginJsList: string[] = [];

  const { resMapper } = await getResourceMapper({
    dirPath: originPkgPath,
    rmHttp: true,
    mountCbFn: (objKey, data) => {
      if (objKey.indexOf("src/settings.json") !== -1) {
        // 3x的settings.json，获取jsList（插件脚本信息）
        const { jsList, settingsData } = getJsListFromSettingsJson(data);
        pluginJsList = jsList;

        // 取消启动插屏
        if (!enableSplash && settingsData?.splashScreen?.totalTime) {
          settingsData.splashScreen.totalTime = 0;
        }

        return JSON.stringify(settingsData);
      } else if (objKey.indexOf("src/settings.js") !== -1) {
        // 2x的settings.js，获取jsList（插件脚本信息）
        const { jsList, settingsData } = getJsListFromSettingsJs(data);
        pluginJsList = jsList;
        return settingsData;
      }

      return data;
    },
  });

  let resStr = JSON.stringify(resMapper);
  let compDiff = 0;

  // 如果开启了压缩，使用pako得到压缩后的base64格式的resMapper
  if (isZip) {
    const zip = deflate(resStr);
    // Uint8Array to base64
    const zipStr = Buffer.from(zip).toString("base64");
    console.log(
      "【Origin Pkg Size】",
      resStr.length,
      "【Compressed Pkg Size】",
      zipStr.length
    );
    if (zipStr.length < resStr.length) {
      compDiff = resStr.length - zipStr.length;
      console.log("【Compressed】", compDiff);
      resStr = zipStr;
    } else {
      console.log(
        "【Compressed】",
        "Compression is not recommended, the compressed file is too large"
      );
    }
  }

  if (compDiff > 0) {
    // 如果pako压缩有效，那么将__adapter_jszip_code__占位符注入body，以便内联压缩代码
    $(`<script data-id="jszip">${jszipCode}</script>`).appendTo("body");

    // 如果pako压缩有效，那么将压缩后的resMapper注入body，以便后续内联resMapper；根据data-id获取resMapper，并使用前面注入的压缩代码解压base64格式的resMapper，将其转化为字符串格式以便浏览器使用
    $(
      `<script data-id="adapter-zip-0">window.__adapter_zip__="${resStr}";</script>`
    ).appendTo("body");
  } else {
    // 如果pako压缩无效，那么将未压缩的resMapper直接内联到body
    $(
      `<script data-id="adapter-resource-0">window.__adapter_resource__=${resStr}</script>`
    ).appendTo("body");
  }

  // 内联插件脚本
  $(
    `<script data-id="adapter-plugins">window.__adapter_plugins__=${JSON.stringify(
      pluginJsList
    )}</script>`
  ).appendTo("body");
  $(`<script data-id="adapter-init">${injectsCode.init}</script>`).appendTo(
    "body"
  );
  $(`<script data-id="adapter-main">${injectsCode.main}</script>`).appendTo(
    "body"
  );

  return {
    resMapper,
    compDiff,
  };
};

export const genSingleFile = async (options: TOptions) => {
  const { singleFilePath, injectsCode } = options;
  /** 最终构建产物的绝对路径，类似E:\Project\Cocos-Projects\test3x\build\web-mobile */
  const originPkgPath = getOriginPkgPath();

  /** 最终构建产物index.html的绝对路径，类似E:\Project\Cocos-Projects\test3x\build\web-mobile\index.html */
  const htmlPath = join(originPkgPath, "/index.html");
  const htmlStr = readToPath(htmlPath, "utf-8");

  const $ = load(htmlStr);

  // Fill style files into HTML
  paddingStyleTags($);

  // Clear script tags in HTML
  paddingScriptTags($);

  // Embed resources into HTML
  const { resMapper, compDiff } = await paddingAllResToMapped({
    injectsCode,
    $,
  });

  /** 写入处理完的文档到singleFilePath */
  writeToPath(singleFilePath, $.html());

  console.info(
    `【Single file template successfully generated】 File size: ${
      getFileSize(singleFilePath) / 1024
    }kb`
  );

  return {
    /** resMapper是最终构建产物所有文件的文件相对路径与文件内容字符串形式的字典对象
     * 例如：{
     * "index.html": "<!DOCTYPE html>...",
     * "cocos-js/meshopt_decoder.wasm-ebbcb
     * 6df.js": "importScripts('meshopt_decoder.wasm-ebbcb6df.js');..."
     * }
     */
    resMapper,
    /** 有效压缩的大小（未压缩的大小-压缩后的大小） */
    compDiff,
  };
};
