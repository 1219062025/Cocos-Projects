const fs = require('fs');
const path = require('path');
const utils = Editor.require('packages://ad-build/src/utils.js');
const { dialog, shell } = require('electron').remote;

Editor.Panel.extend({
  // 挂载css文件
  style: fs.readFileSync(Editor.url('packages://ad-build/src/build/panel/index.css', 'utf8')),

  // 挂载html文件
  template: fs.readFileSync(Editor.url('packages://ad-build/src/build/panel/index.html', 'utf8')),

  ready() {
    /** 使用vue2，cocos官方挂载写法 */
    this.plugins = new window.Vue({
      /** 挂载节点 */
      el: this.shadowRoot,

      /** 面板数据 */
      data: function () {
        return {
          /** 打包进度 */
          progress: 0,
          /** 打包信息提示 */
          tips: '',
          /** 是否处于打包中 */
          isPackage: false,
          /** 广告平台列表 */
          adPlatforms: [],
          /** 方向列表 */
          orientationOptions: {
            Portrait: { value: 1, checked: true },
            Landscape: { value: 1, checked: true }
          },
          /** Tikok支持语言列表 */
          languagesOptions: [
            { label: '英语', abbr: 'en' },
            { label: '巴西', abbr: 'pt' },
            { label: '印度', abbr: 'in' },
            { label: '印尼语', abbr: 'id' },
            { label: '印地语', abbr: 'hi' },
            { label: '越南语', abbr: 'vi' },
            { label: '菲律宾语', abbr: 'fil' },
            { label: '土耳其语', abbr: 'tr' },
            { label: '尼日利亚', abbr: 'ng' },
            { label: '韩语', abbr: 'ko' },
            { label: '西班牙语', abbr: 'es' },
            { label: '俄语', abbr: 'ru' },
            { label: '泰语', abbr: 'th' },
            { label: '马来语', abbr: 'ms' },
            { label: '阿拉伯语', abbr: 'ar' },
            { label: '繁体中文', abbr: 'zh-Hant' },
            { label: '日语', abbr: 'ja' },
            { label: '德语', abbr: 'de' },
            { label: '法语', abbr: 'fr' },
            { label: '台湾', abbr: 'tw' },
            { label: '墨西哥', abbr: 'mx' }
          ],
          /** MTG支持语言列表 */
          mtg_languagesOptions: [
            { label: '英语', abbr: 'en' },
            { label: '葡萄牙语', abbr: 'pt' },
            { label: '印度', abbr: 'in' },
            { label: '印尼语', abbr: 'id' },
            { label: '印地语', abbr: 'hi' },
            { label: '越南语', abbr: 'vi' },
            { label: '菲律宾语', abbr: 'fil' },
            { label: '土耳其语', abbr: 'tr' },
            { label: '尼日利亚', abbr: 'ng' },
            { label: '韩语', abbr: 'ko' },
            { label: '西班牙语', abbr: 'es' },
            { label: '俄语', abbr: 'ru' },
            { label: '泰语', abbr: 'th' },
            { label: '马来语', abbr: 'ms' },
            { label: '阿拉伯语', abbr: 'ar' },
            { label: '繁体中文', abbr: 'zh-Hant' },
            { label: '日语', abbr: 'ja' },
            { label: '德语', abbr: 'de' },
            { label: '法语', abbr: 'fr' },
            { label: '台湾', abbr: 'tw' },
            { label: '墨西哥', abbr: 'mx' }
          ],
          /** 产品列表 */
          productList: [],

          /** 专门设置set专门用来操作数据，操作结束后赋值到config中对应的数据引发视图更新，set不触发vue的视图更新；用set是因为比数组好操作更简洁 */
          setInstance: {
            adPlatforms: new Set([]),
            languages: new Set([]),
            mtg_languages: new Set([]),
            productList: new Set([])
          },

          /** 试玩广告配置 */
          config: {
            /** 配置-广告平台列表 */
            adPlatforms: ['Applovin', 'IronSource', 'Tiktok', 'Unity', 'Mintegral'],
            /** 配置-方向 */
            orientation: 0,
            /** 配置-Tikok支持语言 */
            languages: ['en'],
            /** 配置-MTG支持语言 */
            mtg_languages: ['en'],
            /** 配置-是否基于模板打包 */
            isTemplate: true,
            /** 配置-产品列表 */
            productList: [],
            /** 配置-是否全选模板 */
            allSelected: false,
            /** 配置-是否需要替换对应产品的URL */
            replaceUrl: true,
            /** 配置-项目构建后的路径 */
            input: path.join(Editor.Project.path, 'build', 'web-mobile'),
            /** 配置-项目打包后的输出路径 */
            output: path.join(Editor.Project.path, 'build', 'web-mobile', 'dist')
          }
        };
      },

      /** 计算属性 */
      computed: {
        /** 是否需要展示方向选择 */
        showOrientationOptions() {
          const adPlatforms = this.config.adPlatforms;
          return adPlatforms.includes('Tiktok') || adPlatforms.includes('Pangle') || adPlatforms.includes('GDT');
        },
        /** 是否需要展示支持语言选择 */
        showLanguagesOptions() {
          const adPlatforms = this.config.adPlatforms;
          return adPlatforms.includes('Tiktok');
        },
        /** 是否需要展示MTG支持语言选择 */
        showMTGLanguagesOptions() {
          const adPlatforms = this.config.adPlatforms;
          return adPlatforms.includes('Mintegral');
        },
        /** 是否需要展示模板选择列表 */
        showProductOptions() {
          return this.config.isTemplate;
        },
        /** 是否需要展示替换产品URL */
        showReplaceUrl() {
          const adPlatforms = this.config.adPlatforms;
          return adPlatforms.includes('Unity');
        }
      },

      /** 面板数据加载完成后 */
      created() {
        this.loadConfig();

        this.adPlatforms = utils.getFileList(Editor.url('packages://ad-build/adPlatforms'), '.js');

        this.productList = utils.getFileList(Editor.url('packages://ad-build/products'), '.png');
      },

      /** 面板挂载的方法 */
      methods: {
        loadConfig() {
          const _config = this.getConfig();
          if (_config) this.config = _config;

          this.config.adPlatforms.forEach(item => {
            this.setInstance.adPlatforms.add(item);
          });

          this.config.languages.forEach(item => {
            this.setInstance.languages.add(item);
          });

          this.config.mtg_languages.forEach(item => {
            this.setInstance.mtg_languages.add(item);
          });

          this.config.productList.forEach(item => {
            this.setInstance.productList.add(item);
          });
        },
        /** 点击广告平台复选框触发 */
        onCheckPlatForms(e) {
          const checkbox = e.currentTarget;
          /** 广告平台列表 */
          const adPlatformsSet = this.setInstance.adPlatforms;

          checkbox.checked ? adPlatformsSet.add(checkbox.id) : adPlatformsSet.delete(checkbox.id);

          this.config.adPlatforms = Array.from(adPlatformsSet);
          this.saveConfig();
        },
        /** 点击方向复选框触发 */
        onCheckOrientation(e) {
          /** 选择的复选框 */
          const checkbox = e.currentTarget;
          this.orientationOptions[checkbox.id].checked = checkbox.checked;
          /** 竖屏是否选择 */
          const portraitChecked = this.orientationOptions.Portrait.checked;
          /** 横屏是否选择 */
          const landscapeChecked = this.orientationOptions.Landscape.checked;

          if (landscapeChecked && portraitChecked) {
            this.config.orientation = 0;
          } else if (!landscapeChecked && portraitChecked) {
            this.config.orientation = 1;
          } else if (landscapeChecked && !portraitChecked) {
            this.config.orientation = 2;
          } else if (!landscapeChecked && !portraitChecked) {
            dialog.showErrorBox('警告', '请选择方向');
            this.config.orientation = 0;
            return;
          }
          this.saveConfig();
        },
        /** 点击支持语言复选框触发 */
        onCheckLanguages(e) {
          const checkbox = e.currentTarget;
          /** 语言 */
          const languagesSet = this.setInstance.languages;

          checkbox.checked ? languagesSet.add(checkbox.id) : languagesSet.delete(checkbox.id);

          this.config.languages = Array.from(languagesSet);
          this.saveConfig();
        },
        /** 点击MTG支持语言复选框触发 */
        onCheckMTGLanguages(e) {
          const checkbox = e.currentTarget;
          /** 语言 */
          const mtg_languagesSet = this.setInstance.mtg_languages;

          checkbox.checked ? mtg_languagesSet.add(checkbox.id) : mtg_languagesSet.delete(checkbox.id);

          this.config.mtg_languages = Array.from(mtg_languagesSet);
          this.saveConfig();
        },
        /** 点击模板复选框触发 */
        onCheckTemplate(e) {
          const checkbox = e.currentTarget;

          this.config.isTemplate = checkbox.checked;
          this.saveConfig();
        },
        /** 点击全选复选框触发 */
        onAllSelected(e) {
          const checkbox = e.currentTarget;

          this.setInstance.productList = checkbox.checked ? new Set(this.productList.slice()) : new Set([]);

          this.config.productList = Array.from(this.setInstance.productList);
          this.config.allSelected = checkbox.checked;
          this.saveConfig();
        },
        /** 点击产品复选框触发 */
        onCheckProduct(e) {
          const checkbox = e.currentTarget;

          const productListSet = this.setInstance.productList;
          checkbox.checked ? productListSet.add(checkbox.id) : productListSet.delete(checkbox.id);

          /** 设置全选框 */
          this.config.allSelected = productListSet.size === this.productList.length;
          this.config.productList = Array.from(productListSet);
          this.saveConfig();
        },
        /** 点击替换产品URL复选框触发 */
        onCheckReplaceUrl(e) {
          const checkbox = e.currentTarget;

          this.config.replaceUrl = checkbox.checked;
          this.saveConfig();
        },
        /** 点击选择文件夹按钮触发 */
        onSelectFolder(e) {
          const btn = e.currentTarget;
          const result = dialog.showOpenDialog({
            buttonLabel: '选择',
            properties: ['openDirectory', 'createDirectory']
          });
          if (!result) return;

          switch (btn.id) {
            case 'in-btn':
              this.config.input = result[0];
              break;
            case 'out-btn':
              this.config.output = result[0];
              break;
            default:
              break;
          }
          this.saveConfig();
        },
        /** 点击打开路径按钮触发 */
        onOpenResourceWin(e) {
          const btn = e.currentTarget;

          switch (btn.id) {
            case 'in-btn':
              shell.showItemInFolder(this.config.input);
              break;
            case 'out-btn':
              shell.showItemInFolder(this.config.output);
              break;
            default:
              break;
          }
        },
        /** 更新文本框 */
        onInputChange(e) {
          let input = e.currentTarget;
          switch (input.id) {
            case 'in-url':
              this.config.input = input.value;
              break;
            case 'out-url':
              this.config.output = input.value;
              break;
            default:
              break;
          }
          this.saveConfig();
        },
        /** 打包 */
        onClickBuild(e) {
          const config = this.config;
          if (config.adPlatforms.length == 0) {
            dialog.showErrorBox('警告', '请选择广告平台!');
            return;
          }
          if (config.isTemplate && config.productList.length == 0) {
            dialog.showErrorBox('警告', '请选择产品模板!');
            return;
          }

          Editor.Ipc.sendToMain('ad-build:build', JSON.stringify(config));
          this.isPackage = true;
        },
        /** 获取缓存中的配置 */
        getConfig() {
          return utils.getStorage(Editor.Project.name + '_build_config');
        },
        /** 将当前配置缓存起来 */
        saveConfig() {
          utils.setStorage(Editor.Project.name + '_build_config', this.config);
        },
        /** 移除缓存下来的配置 */
        removeConfig() {
          utils.clearStorage(Editor.Project.name + '_build_config');
        },
        /** 打印当前配置信息 */
        logConfig() {
          for (const key in config) {
            if (Object.hasOwnProperty.call(config, key)) {
              const element = config[key];
              Editor.log(`${key}：${element}`);
            }
          }
        }
      }
    });
  },
  messages: {
    'get-progress'(event, args) {
      if (event.reply) {
        event.reply(null);
      }
      this.plugins.progress = Number(args.progress);
      this.plugins.tips = args.tips;
    }
  }
});
