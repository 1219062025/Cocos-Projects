import { readdirSync, statSync } from "fs";
import { lookup } from "mime-types";
import path, { extname } from "path";
import {
  REPLACE_SYMBOL,
  TO_STRING_EXTNAME,
  TO_SKIP_EXTNAME,
  ADAPTER_FETCH,
} from "@/constants";
import { getAllFilesFormDir, readToPath, writeToPath } from "./base";
import { removeXMLHttpRequest } from "../extends";

type TResourceData = { [key: string]: string };

type TResZipInfo = {
  key: string;
  ratio: number;
};

export const getRealPath = (pathStr: string) => {
  let realPath = pathStr;
  // To adapt paths for Windows, use backslashes (\) as separators.
  if (realPath.indexOf("\\") !== -1) {
    realPath = realPath.replace(/\\/g, "/");
  }

  return realPath;
};

// Replace global variables.
export const replaceGlobalSymbol = (dirPath: string, replaceText: string) => {
  const fileList = readdirSync(dirPath);
  fileList.forEach((file) => {
    const absPath = path.join(dirPath, file);
    const statInfo = statSync(absPath);
    // If it is a directory, recursively search downward for files.
    if (statInfo.isDirectory()) {
      replaceGlobalSymbol(absPath, replaceText);
    } else if (statInfo.isFile() && path.extname(file) === ".js") {
      let dataStr = readToPath(absPath, "utf-8");
      if (dataStr.indexOf(REPLACE_SYMBOL) !== -1) {
        dataStr = dataStr.replaceAll(REPLACE_SYMBOL, replaceText);
        writeToPath(absPath, dataStr);
      }
    }
  });
};

// Determine if the image type is supported for upload: supported `true`, not supported `false`.
export const checkImgType = (name: string) => {
  let extname = lookup(name);
  if (typeof extname === "boolean") {
    return false;
  }
  return /(gif|jpg|jpeg|png|webp|image)/i.test(extname);
};

export const getBase64FromFile = (filePath: string) => {
  let data = readToPath(filePath, "base64");
  return `data:${lookup(filePath)};base64,${data}`;
};

/** 获取目标文件的字符串形式，如果是精灵sprite则转成base64 */
export const getTargetResData = (filePath: string) => {
  let resData: string = "";
  const fileExtname = extname(filePath);

  if (!fileExtname) {
    return "";
  }

  if (TO_STRING_EXTNAME.includes(fileExtname)) {
    resData = readToPath(filePath, "utf-8");
  } else {
    resData = getBase64FromFile(filePath);
  }

  return resData;
};

export const getResourceMapper = async (options: {
  dirPath: string;
  skipFiles?: Array<string>;
  mountCbFn?: (objKey: string, data: string) => string; // single file mount callback function
  unmountCbFn?: (objKey: string, data: string) => void; // single file unmount callback function
  rmHttp?: boolean;
}) => {
  const {
    dirPath,
    rmHttp = false,
    unmountCbFn,
    mountCbFn,
    skipFiles = [],
  } = options;

  let resMapper: TResourceData = {};

  /** 指定目录及其所有子目录中的所有文件绝对路径字符串数组 */
  const resFiles = getAllFilesFormDir(dirPath);
  for (let index = 0; index < resFiles.length; index++) {
    /** 文件绝对路径，类似E:\Project\Cocos-Projects\test3x\build\web-mobile\index.html */
    const filePath = resFiles[index];
    /** 文件扩展名 */
    const fileExtname = extname(filePath);

    // 删除不必要处理的扩展名文件
    if (TO_SKIP_EXTNAME.includes(fileExtname)) {
      continue;
    }

    // 根据传入的skipFiles删除不必要的文件
    if (skipFiles.length > 0 && skipFiles.includes(filePath)) {
      continue;
    }

    // 先得到指定目录dirPath的绝对路径的反斜杠格式，类似E:/Project/Cocos-Projects/test3x/build/web-mobile/
    const readPkgPath = getRealPath(`${dirPath}/`);
    // 得到文件相对于指定目录dirPath的绝对路径的反斜杠格式，类似index.html、cocos-js/meshopt_decoder.wasm-ebbcb6df.js
    const objKey = getRealPath(filePath).replace(readPkgPath, "");

    /** 文件的字符串形式 */
    let data = getTargetResData(filePath);
    if (mountCbFn) {
      // 对settings.json进行处理
      data = mountCbFn(objKey, data);
    }

    if (rmHttp && fileExtname === ".js") {
      data = removeXMLHttpRequest(data);
    }

    resMapper[objKey] = data;

    unmountCbFn && unmountCbFn(objKey, data);
  }

  return {
    resMapper,
  };
};
