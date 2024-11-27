const fs = require("fs");
const path = require("path");

const level = 50;

function onBeforeBuildFinish(options, callback) {
  let buildResults = options.buildResults;

  let assets = buildResults.getAssetUuids();
  for (let i = 0; i < assets.length; ++i) {
    let asset = assets[i];

    // 删除其他关卡预制体依赖的图片纹理资源
    if (buildResults.getAssetType(asset) === cc.js._getClassId(cc.Prefab)) {
      const assetUrl = Editor.assetdb.uuidToUrl(asset);

      const prefabRegex = new RegExp(
        `db:\/\/assets\/resources\/level\/LevelPrefab(?!${level})(\\d+).prefab`
      );
      const spriteRegex = new RegExp(
        `db:\/\/assets\/sprites\/level\/Sprites\/Level(?!${level})(\\d+)_Sprites\/.*`
      );
      const spineRegex = new RegExp(
        `db:\/\/assets\/sprites\/level\/SpineAnim\/Level(?!${level})(\\d+)_Spine\/.*`
      );
      if (prefabRegex.test(assetUrl)) {
        let depends = buildResults.getDependencies(asset);

        for (let j = 0; j < depends.length; j++) {
          let uuid = depends[j];
          let dependUrl = Editor.assetdb.uuidToUrl(uuid);

          if (!spriteRegex.test(dependUrl) && !spineRegex.test(dependUrl))
            continue;

          const nativePath = buildResults.getNativeAssetPath(uuid);
          if (!nativePath) continue;

          fs.unlink(nativePath, (err) => {
            if (err) {
              Editor.log("文件删除失败:", err);
            }
          });
        }
      }
    }

    // 删除其他关卡的语言配置json资源
    if (buildResults.getAssetType(asset) === cc.js._getClassId(cc.JsonAsset)) {
      const assetUrl = Editor.assetdb.uuidToUrl(asset);

      const tipsRegex = new RegExp(
        `db:\/\/assets\/resources\/configs\/TipsLanguage\/level_tips_(?!${level})(\\d+).json`
      );

      const levelRegex = new RegExp(
        `db:\/\/assets\/resources\/configs\/LevelLanguage\/level_(?!${level})(\\d+).json`
      );

      if (!tipsRegex.test(assetUrl) && !levelRegex.test(assetUrl)) continue;

      const url = `../../build/web-mobile/res/import`;

      deleteJsonFilesInDir(url, asset, ".json");
    }
  }
  callback();
}

/** 递归删除指定目录下指定扩展名的文件 */
function deleteJsonFilesInDir(dir, targetFileName, ext) {
  const absoluteDir = path.resolve(__dirname, dir);
  try {
    // 读取目录内容
    fs.readdir(absoluteDir, (err, files) => {
      // Editor.log(files);
      for (const file of files) {
        const filePath = path.join(absoluteDir, file);
        fs.stat(filePath, (err, stats) => {
          if (stats.isDirectory()) {
            // 如果是目录，递归调用
            deleteJsonFilesInDir(filePath, targetFileName, ext);
          } else if (
            stats.isFile() &&
            path.basename(file, ext) === targetFileName &&
            path.extname(file) === ext
          ) {
            // 如果是 .json 文件，删除
            fs.unlink(filePath, (err) => {});
          }
        });
      }
    });
  } catch (err) {
    Editor.error("删除文件时发生错误:", err);
  }
}

module.exports = {
  load() {
    Editor.Builder.on("before-change-files", onBeforeBuildFinish);
  },

  unload() {
    Editor.Builder.removeListener("before-change-files", onBeforeBuildFinish);
  },
};
