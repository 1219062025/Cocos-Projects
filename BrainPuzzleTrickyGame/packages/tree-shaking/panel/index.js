const fs = require("fs");
const path = require("path");

Editor.Panel.extend({
  // 挂载css文件
  style: fs.readFileSync(
    Editor.url("packages://tree-shaking/panel/index.css", "utf8")
  ),

  // 挂载html文件
  template: fs.readFileSync(
    Editor.url("packages://tree-shaking/panel/index.html", "utf8")
  ),

  ready() {
    this.plugins = new window.Vue({
      /** 挂载节点 */
      el: this.shadowRoot,

      data: function () {
        return {
          level: 1,
        };
      },

      created() {
        const levelInputJson = window.localStorage.getItem("level");

        if (levelInputJson) {
          this.level = JSON.parse(levelInputJson);
          Editor.Ipc.sendToMain("tree-shaking:set-level", this.level);
        }
      },

      methods: {
        onInputChange(e) {
          let input = e.currentTarget;

          this.level = input.value;
        },

        save() {
          window.localStorage.setItem("level", JSON.stringify(this.level));
          Editor.Ipc.sendToMain("tree-shaking:set-level", this.level);
        },
      },
    });
  },

  messages: {
    "save-level": function (event) {
      const levelInputJson = window.localStorage.getItem("level");

      if (levelInputJson) {
        Editor.Ipc.sendToMain(
          "tree-shaking:set-level",
          JSON.parse(levelInputJson)
        );
      }
    },
  },
});
