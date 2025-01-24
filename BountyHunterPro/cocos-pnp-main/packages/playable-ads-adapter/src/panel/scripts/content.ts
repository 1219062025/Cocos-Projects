import { Component, computed, onMounted, reactive, ref, unref } from "vue";
import { readFileSync } from "fs-extra";
import path from "path";
import store from "../store/default";
import { clearStorage, getStorage, setStorage } from "@/extensions/utils";
import { builder3x } from "@/extensions/builder/3x";
const Electron = require("electron");
const { BrowserWindow } = require("@electron/remote");

const component: Component = {
  template: readFileSync(
    path.join(__dirname, "../panel/template/content.html"),
    "utf-8"
  ),
  setup() {
    //#region ---------------ref-----------------

    const {
      config,
      tips,
      progress,
      isPackage,
      buildPlatform,
      exportChannels,
      products,
      orientations,
      languagesOptions,
      mtg_languagesOptions,
    } = store;

    //#endregion

    //#region ---------------created-----------------
    const text = ref("");

    function log(content: any) {
      if (typeof content === "object") {
        text.value = JSON.stringify(content, null, 2);
      } else {
        text.value = content;
      }
    }
    loadConfig();
    //#endregion

    //#region ---------------computeds-----------------

    /** 是否需要展示支持语言选择 */
    const showLanguagesOptions = computed(() => {
      const exportChannels = config.value.exportChannels;
      return exportChannels.has("Tiktok");
    });

    /** 是否需要展示MTG支持语言选择 */
    const showMTGLanguagesOptions = computed(() => {
      const exportChannels = config.value.exportChannels;
      return exportChannels.has("Mintegral");
    });

    /** 是否需要展示替换产品URL */
    const showReplaceUrl = computed(() => {
      const exportChannels = config.value.exportChannels;
      return exportChannels.has("Unity");
    });

    //#endregion

    //#region ---------------methods-----------------

    /** 选择构建平台 */
    function onCheckBuildPlatform(event: any) {
      const checkbox = event.target as HTMLElement;
      const isChecked = event.target.value as boolean;

      config.value.buildPlatform = isChecked ? checkbox.id : "";

      saveConfig();
    }

    /** 选择渠道 */
    function onCheckPlatforms(event: any) {
      const checkbox = event.target as HTMLElement;
      const isChecked = event.target.value as boolean;

      isChecked
        ? config.value.exportChannels.add(checkbox.id)
        : config.value.exportChannels.delete(checkbox.id);

      saveConfig();
    }

    /** 点击方向复选框触发 */
    function onCheckOrientation(event: any) {
      const checkbox = event.target as HTMLElement;
      const isChecked = event.target.value;

      config.value.orientation = isChecked ? checkbox.id : "";

      console.log(config.value.orientation);

      saveConfig();
    }

    /** 点击支持语言复选框触发 */
    function onCheckLanguages(event: any) {
      const checkbox = event.target;
      const isChecked = event.target.value;

      isChecked
        ? config.value.tiktok_languages.add(checkbox.id)
        : config.value.tiktok_languages.delete(checkbox.id);

      saveConfig();
    }

    /** 点击支持语言复选框触发 */
    function onCheckMTGLanguages(event: any) {
      const checkbox = event.target;
      const isChecked = event.target.value;

      isChecked
        ? config.value.mtg_languages.add(checkbox.id)
        : config.value.mtg_languages.delete(checkbox.id);

      saveConfig();
    }

    /** 点击产品模板复选框触发 */
    function onCheckProduct(event: any) {
      const checkbox = event.target;
      const isChecked = event.target.value;

      config.value.product = isChecked ? checkbox.id : "";

      saveConfig();
    }

    /** 点击替换产品URL复选框触发 */
    function onCheckReplaceUrl(event: any) {
      const isChecked = event.target.value;

      config.value.replaceUrl = isChecked;
      saveConfig();
    }

    /** 更新文本框 */
    function onInputChange(event: any) {
      const input = event.target;
      switch (input.id) {
        case "in-url":
          config.value.input = input.value;
          break;
        case "out-url":
          config.value.output = input.value;
          break;
        default:
          break;
      }
      saveConfig();
    }

    /** 点击选择文件夹按钮触发 */
    async function onSelectFolder(event: any) {
      const btn = event.target;
      const result = await Editor.Dialog.select({
        type: "directory",
        path: Editor.Project.path,
        button: "选择",
      });

      if (result.filePaths && result.filePaths[0]) {
        switch (btn.id) {
          case "in-btn":
            config.value.input = result.filePaths[0];
            break;
          case "out-btn":
            config.value.output = result.filePaths[0];
            break;
          default:
            break;
        }
      }

      saveConfig();
    }

    /** 点击打开路径按钮触发 */
    function onOpenResourceWin(event: any) {
      console.log(config.value.input, config.value.output);

      const btn = event.target;

      switch (btn.id) {
        case "in-btn":
          Electron.shell.showItemInFolder(config.value.input);
          break;
        case "out-btn":
          Electron.shell.showItemInFolder(config.value.output);
          break;
        default:
          break;
      }
    }

    /** 开始打包 */
    function onClickBuild(event: any) {
      console.log(config.value);
      if (config.value.exportChannels.size == 0) {
        Editor.Dialog.error("请选择渠道！", {
          title: "警告",
        });
        return;
      }

      if (!config.value.product) {
        Editor.Dialog.error("请选择产品模板！", {
          title: "警告",
        });
        return;
      }

      if (!config.value.orientation) {
        Editor.Dialog.error("请选择屏幕方向！", {
          title: "警告",
        });
        return;
      }

      config.value.skipBuild =
        event.target.id === "buildAdapterBtn" ? false : true;

      isPackage.value = true;
      builder3x(config.value);
    }

    /** 获取缓存中的配置 */
    function loadConfig() {
      const _config = getStorage(Editor.Project.name + "_config");
      if (_config) {
        _config.exportChannels = new Set(_config.exportChannels);
        _config.tiktok_languages = new Set(_config.tiktok_languages);
        _config.mtg_languages = new Set(_config.mtg_languages);

        for (const key in config.value) {
          if (Object.prototype.hasOwnProperty.call(config.value, key)) {
            config.value[key as keyof typeof config.value] = _config[
              key
            ] as never;
          }
        }
      }
    }

    /** 存储当前面板配置到本地 */
    function saveConfig() {
      const _config = {
        ...config.value,
        exportChannels: Array.from(config.value.exportChannels),
        tiktok_languages: Array.from(config.value.tiktok_languages),
        mtg_languages: Array.from(config.value.mtg_languages),
      };

      setStorage(Editor.Project.name + "_config", _config);
    }

    /** 清空缓存配置 */
    function removeConfig() {
      clearStorage(Editor.Project.name + "_config");

      // 窗口刷新，cocos编辑器基于electron，所以调用electron内置模块的方法刷新窗口。详情见：https://www.electronjs.org/zh/docs/latest/api/web-contents#contentsreload
      BrowserWindow.getFocusedWindow().reload();

      Editor.Dialog.info("清空配置缓存成功，面板窗口已刷新", {
        title: "打包试玩工具",
      });
    }

    //#endregion

    //#region ---------------setup return-----------------
    return {
      text,
      showLanguagesOptions,
      showMTGLanguagesOptions,
      showReplaceUrl,
      config,
      tips,
      progress,
      isPackage,
      buildPlatform,
      exportChannels,
      products,
      orientations,
      languagesOptions,
      mtg_languagesOptions,
      removeConfig,
      onCheckBuildPlatform,
      onCheckPlatforms,
      onCheckOrientation,
      onCheckLanguages,
      onCheckMTGLanguages,
      // onCheckTemplate,
      // onAllSelected,
      onCheckProduct,
      onCheckReplaceUrl,
      onInputChange,
      onSelectFolder,
      onOpenResourceWin,
      onClickBuild,
    };
    //#endregion
  },
};

export default component;
