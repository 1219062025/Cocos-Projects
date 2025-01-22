import { Component, computed, onMounted, reactive, ref, unref } from "vue";
import { readFileSync } from "fs-extra";
import path from "path";
import utils from "../utils";
import store from "../store/default";
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
      adPlatforms,
      products,
      orientationOptions,
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

    /** 是否展示方向选择 */
    const showOrientationOptions = computed(() => {
      const adPlatforms = config.value.adPlatforms;
      return (
        adPlatforms.has("Tiktok") ||
        adPlatforms.has("Pangle") ||
        adPlatforms.has("GDT")
      );
    });

    /** 是否需要展示支持语言选择 */
    const showLanguagesOptions = computed(() => {
      const adPlatforms = config.value.adPlatforms;
      return adPlatforms.has("Tiktok");
    });

    /** 是否需要展示MTG支持语言选择 */
    const showMTGLanguagesOptions = computed(() => {
      const adPlatforms = config.value.adPlatforms;
      return adPlatforms.has("Mintegral");
    });

    /** 是否需要展示模板选择列表 */
    const showProductOptions = computed(() => {
      return config.value.isTemplate;
    });

    /** 是否需要展示替换产品URL */
    const showReplaceUrl = computed(() => {
      const adPlatforms = config.value.adPlatforms;
      return adPlatforms.has("Unity");
    });

    //#endregion

    //#region ---------------methods-----------------

    /** 选择平台 */
    function onCheckPlatForms(event: any) {
      const checkbox = event.target as HTMLElement;
      const isChecked = event.target.value as boolean;

      isChecked
        ? config.value.adPlatforms.add(checkbox.id)
        : config.value.adPlatforms.delete(checkbox.id);

      saveConfig();
    }

    /** 点击方向复选框触发 */
    function onCheckOrientation(event: any) {
      const checkbox = event.target as HTMLElement;
      const isChecked = event.target.value as boolean;

      if (checkbox.id === "Landscape") {
        orientationOptions.value.Landscape.checked = isChecked;
      } else if (checkbox.id === "Portrait") {
        orientationOptions.value.Portrait.checked = isChecked;
      }

      /** 竖屏是否选择 */
      const portraitChecked = orientationOptions.value.Portrait.checked;
      /** 横屏是否选择 */
      const landscapeChecked = orientationOptions.value.Landscape.checked;

      if (landscapeChecked && portraitChecked) {
        config.value.orientation = 0;
      } else if (!landscapeChecked && portraitChecked) {
        config.value.orientation = 1;
      } else if (landscapeChecked && !portraitChecked) {
        config.value.orientation = 2;
      } else if (!landscapeChecked && !portraitChecked) {
        Editor.Dialog.error("请选择方向");
        config.value.orientation = 0;
        return;
      }

      saveConfig();
    }

    /** 点击支持语言复选框触发 */
    function onCheckLanguages(event: any) {
      const checkbox = event.target;
      const isChecked = event.target.value;

      isChecked
        ? config.value.languages.add(checkbox.id)
        : config.value.languages.delete(checkbox.id);

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

    /** 点击基于模板复选框触发 */
    function onCheckTemplate(event: any) {
      const isChecked = event.target.value;

      config.value.isTemplate = isChecked;

      saveConfig();
    }

    /** 点击全选复选框触发 */
    function onAllSelected(event: any) {
      const isChecked = (config.value.allSelected = event.target.value);

      config.value.products = isChecked
        ? new Set(products.value.slice())
        : new Set([]);

      saveConfig();
    }

    /** 点击单个产品复选框触发 */
    function onCheckProduct(event: any) {
      const checkbox = event.target;
      const isChecked = event.target.value;

      isChecked
        ? config.value.products.add(checkbox.id)
        : config.value.products.delete(checkbox.id);

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
      if (config.value.adPlatforms.size == 0) {
        Editor.Dialog.error("请选择广告平台！", {
          title: "警告",
        });
        return;
      }

      if (config.value.isTemplate && config.value.products.size == 0) {
        Editor.Dialog.error("请选择产品模板！", {
          title: "警告",
        });
        return;
      }

      isPackage.value = true;
      // build();
    }

    /** 获取缓存中的配置 */
    function loadConfig() {
      const _config = utils.getStorage(Editor.Project.name + "_config");
      if (_config) {
        _config.adPlatforms = new Set(_config.adPlatforms);
        _config.languages = new Set(_config.languages);
        _config.mtg_languages = new Set(_config.mtg_languages);
        _config.products = new Set(_config.products);

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
        adPlatforms: Array.from(config.value.adPlatforms),
        languages: Array.from(config.value.languages),
        mtg_languages: Array.from(config.value.mtg_languages),
        products: Array.from(config.value.products),
      };

      utils.setStorage(Editor.Project.name + "_config", _config);
    }

    /** 清空缓存配置 */
    function removeConfig() {
      utils.clearStorage(Editor.Project.name + "_config");

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
      showOrientationOptions,
      showLanguagesOptions,
      showMTGLanguagesOptions,
      showProductOptions,
      showReplaceUrl,
      config,
      tips,
      progress,
      isPackage,
      adPlatforms,
      products,
      orientationOptions,
      languagesOptions,
      mtg_languagesOptions,
      removeConfig,
      onCheckPlatForms,
      onCheckOrientation,
      onCheckLanguages,
      onCheckMTGLanguages,
      onCheckTemplate,
      onAllSelected,
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
