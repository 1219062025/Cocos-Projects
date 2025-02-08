import { ADAPTER_RC_PATH } from "@/extensions/constants";
import { existsSync } from "fs";
import { join } from "path";
import { readToPath } from "./base";

/** 读取.adapterrc文件，获取配置json对象信息 */
export const readAdapterRCFile = (): TAdapterRC | null => {
  const projectRootPath = Editor.Project.path;
  const adapterRCJsonPath = `${projectRootPath}${ADAPTER_RC_PATH}`;
  if (existsSync(adapterRCJsonPath)) {
    return <TAdapterRC>JSON.parse(readToPath(adapterRCJsonPath));
  }

  return null;
};

/** 获取渠道适配选项 */
export const getAdapterConfig = () => {
  const projectRootPath = Editor.Project.path;
  const projectBuildPath = "/build";
  const adapterBuildConfig = readAdapterRCFile();
  let buildPlatform: TPlatform =
    adapterBuildConfig?.buildPlatform ?? "web-mobile";

  return {
    /** cocos项目绝对路径，类似E:\Project\Cocos-Projects\ProjectName */
    projectRootPath,
    /** cocos构建输出相对路径，类似/build */
    projectBuildPath,
    /** cocos构建输出目标平台，类似web-mobile */
    buildPlatform,
    /** 最终构建产物的绝对路径，类似E:\Project\Cocos-Projects\ProjectName\build\web-mobile */
    originPkgPath: join(projectRootPath, projectBuildPath, buildPlatform),
    /** .adapterrc配置选项，默认有一个选项buildPlatform（默认值为web-mobile） */
    adapterBuildConfig,
  };
};

/** 获取.adapterrc配置选项，默认有一个选项buildPlatform（默认值为web-mobile） */
export const getAdapterRCJson = (): TAdapterRC | null => {
  return readAdapterRCFile();
};

/** 获取.adapterrc配置选项中渠道选项 */
export const getChannelRCJson = (channel: TChannel): TChannelRC | null => {
  const adapterRCJson = getAdapterRCJson();
  if (
    !adapterRCJson ||
    !adapterRCJson.injectOptions ||
    !adapterRCJson.injectOptions[channel]
  ) {
    return null;
  }

  return adapterRCJson.injectOptions[channel];
};

/** 获取.adapterrc配置选项中是否跳过构建选项 */
export const getRCSkipBuild = (): boolean => {
  const adapterRCJson = getAdapterRCJson();
  if (!adapterRCJson) {
    return false;
  }

  return adapterRCJson.skipBuild ?? false;
};

/** 获取.adapterrc配置选项中是否开启Tinify压缩图片选项 */
export const getRCTinify = (): { tinify: boolean; tinifyApiKey: string } => {
  const adapterRCJson = getAdapterRCJson();
  if (!adapterRCJson) {
    return {
      tinify: false,
      tinifyApiKey: "",
    };
  }

  return {
    tinify: !!adapterRCJson.tinify,
    tinifyApiKey: adapterRCJson.tinifyApiKey || "",
  };
};

/** 获取.adapterrc配置选项中渠道SDK选项 */
export const getChannelRCSdkScript = (channel: TChannel): string => {
  const channelRCJson = getChannelRCJson(channel);
  return !channelRCJson || !channelRCJson.sdkScript
    ? ""
    : channelRCJson.sdkScript;
};
