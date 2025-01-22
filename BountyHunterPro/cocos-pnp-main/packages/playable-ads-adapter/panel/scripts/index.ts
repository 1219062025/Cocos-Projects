import { readFileSync } from "fs-extra";
import { join } from "path";
import { createApp, App } from "vue";
import contentComponent from "./content";
const panelDataMap = new WeakMap<any, App>();

module.exports = Editor.Panel.define({
  template: readFileSync(
    join(__dirname, "../panel/template/index.html"),
    "utf-8"
  ),
  style: readFileSync(join(__dirname, "../panel/style/index.css"), "utf-8"),
  $: {
    app: "#app",
  },
  methods: {},
  ready() {
    if (this.$.app) {
      const app = createApp({});
      app.config.compilerOptions.isCustomElement = (tag) =>
        tag.startsWith("ui-");

      // 注册vue组件
      app.component("content", contentComponent);

      app.mount(this.$.app);
      panelDataMap.set(this, app);
    }
  },
  beforeClose() {},
  close() {
    const app = panelDataMap.get(this);
    if (app) {
      app.unmount();
    }
  },
});
