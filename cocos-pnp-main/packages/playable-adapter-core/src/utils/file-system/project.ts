import path from "path";
import { getGlobalProjectBuildPath } from "@/global";

export const get2xSingleFilePath = () => {
  return path.join(getGlobalProjectBuildPath(), "/single-file-2x.html");
};

/** 生成模板单文件html的路径，类似E:\Project\Cocos-Projects\test3x\build\single-file-3x.html */
export const get3xSingleFilePath = () => {
  return path.join(getGlobalProjectBuildPath(), "/single-file-3x.html");
};
