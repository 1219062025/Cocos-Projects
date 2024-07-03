const builder = require('./src/build/build.js');
const utils = require('./src/utils.js');

module.exports = {
  load() {
    builder.init();
  },

  unload() {
    builder.destroy();
  },

  messages: {
    'open-build-panel': function (event, ...args) {
      Editor.Panel.open('ad-build');
    }
  }
};
