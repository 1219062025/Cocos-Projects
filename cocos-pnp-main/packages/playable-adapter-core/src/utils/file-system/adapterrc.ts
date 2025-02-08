import path from "path";
import { TAdapterRC, TChannel, TChannelRC } from "@/typings";
import { getGlobalBuildConfig, getGlobalProjectBuildPath } from "@/global";

/** 获取.adapterrc配置选项，默认有一个选项buildPlatform（默认值为web-mobile） */
export const getAdapterRCJson = (): TAdapterRC | null => {
  return getGlobalBuildConfig();
};

/** 获取最终构建产物的绝对路径，类似E:\Project\Cocos-Projects\ProjectName\build\web-mobile */
export const getOriginPkgPath = () => {
  let configJson: Partial<TAdapterRC> = getAdapterRCJson() || {};
  const buildPlatform = configJson.buildPlatform || "web-mobile";

  return path.join(getGlobalProjectBuildPath(), buildPlatform!);
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
