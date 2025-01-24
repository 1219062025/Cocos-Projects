import { readdirSync, readFileSync, writeFileSync } from "fs";
import { extname } from "path";

export const getRealPath = (pathStr: string) => {
  let realPath = pathStr;
  // 适配window路径
  if (realPath.indexOf("\\") !== -1) {
    realPath = realPath.replace(/\\/g, "/");
  }

  return realPath;
};

export const readToPath = (filepath: string, encoding?: BufferEncoding) => {
  const fileBuffer = readFileSync(filepath);
  return fileBuffer.toString(encoding);
};

export const writeToPath = (
  filepath: string,
  data: string | NodeJS.ArrayBufferView
) => {
  writeFileSync(filepath, data);
};

/**
 * 得到文件夹下指定格式文件名称列表(去掉后缀名).
 * @param {string} root 路径
 * @param {string} ext 扩展名
 */
export const getFileNameList = (root: string, ext: string | string[]) => {
  let files = readdirSync(root);
  return files
    .filter((file) =>
      typeof ext === "string"
        ? extname(file) === ext
        : ext.includes(extname(file))
    )
    .map((file) => file.substring(0, file.indexOf(".")));
};

/** 根据键值对存储数据 */
export const setStorage = (key: string, value: any) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

/** 根据键值对获取数据 */
export const getStorage = (key: string) => {
  const item = window.localStorage.getItem(key);
  return item ? JSON.parse(item) : "";
};

/** 清空缓存 */
export const clearStorage = (key: string) => {
  window.localStorage.removeItem(key);
};
