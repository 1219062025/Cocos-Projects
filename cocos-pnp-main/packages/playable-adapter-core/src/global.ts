import { TAdapterRC } from "./typings";
import { getRealPath } from "./utils/file-system/resource";

export const mountGlobalVars = (options: {
  buildFolderPath: string;
  adapterBuildConfig?: TAdapterRC | null;
}) => {
  if (
    global.__playable_ads_adapter_global__ &&
    global.__playable_ads_adapter_global__.isMount
  ) {
    return;
  }
  global.__playable_ads_adapter_global__ = {
    isMount: true,
    buildFolderPath: options.buildFolderPath,
    buildConfig: options.adapterBuildConfig ?? null,
  };
};

export const unmountGlobalVars = () => {
  global.__playable_ads_adapter_global__ = {
    isMount: false,
    buildFolderPath: "",
    buildConfig: null,
  };
};

/** 获取.adapterrc配置选项，默认有一个选项buildPlatform（默认值为web-mobile） */
export const getGlobalBuildConfig = () => {
  return global.__playable_ads_adapter_global__.buildConfig;
};

/** 获取cocos构建输出绝对路径，类似E:\Project\Cocos-Projects\ProjectName\build */
export const getGlobalProjectBuildPath = () => {
  const buildPath = getRealPath(
    global.__playable_ads_adapter_global__.buildFolderPath
  );
  return buildPath;
};
