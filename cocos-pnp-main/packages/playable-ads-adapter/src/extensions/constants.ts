export const COCOS_EDITOR_EVENT: { [key: string]: Editor.ListenEvent } = {
  BEFORE_CHANGE_FILES: "before-change-files",
  BUILD_FINISHED: "build-finished",
  BUILD_START: "build-start",
};

/** 可玩广告插件名 playable-ads-adapter */
export const BUILDER_NAME = "playable-ads-adapter";

/** 查找自定义.adapterrc文件的相对路径，类似/.adapterrc */
export const ADAPTER_RC_PATH = "/.adapterrc";

/** 2x最终构建产物中project.json的相对路径，类似/settings/project.json */
export const SETTINGS_PROJECT_PATH = "/settings/project.json";
