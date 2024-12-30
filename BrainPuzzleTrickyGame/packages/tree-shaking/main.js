const fs = require("fs");
const path = require("path");

// 关于自定义项目构建流程的相关文档：https://docs.cocos.com/creator/2.3/manual/zh/publish/custom-project-build-template.html

/** 需要构建的关卡，除了这个关卡外其他关卡的预制体、图片纹理、相关json配置都要删除掉以压缩包体积 */
var level = 0;

/** 构建开始时触发，确保level是有效值 */
async function onStartBuild(options, callback) {
  if (level === 0) {
    Editor.Panel.open("tree-shaking");
    Editor.Ipc.sendToPanel("tree-shaking", "save-level");
  }
  callback();
}

/** 在构建结束之前触发，此时除了计算文件 MD5、生成 settings.js、原生平台的加密脚本以外，大部分构建操作都已执行完毕。在这里删除其他关卡的图片纹理、语言json配置 */
async function onBeforeBuildFinish(options, callback) {
  if (level === 0) {
    Editor.error(
      "[tree-shaking] 未设置需要构建的关卡，无法进行构建后摇树；请在扩展->tree-shaking->open设置需要构建的关卡"
    );
  }

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
        `db:\/\/assets\/resources\/configs\/GuideLanguage\/level_tips_(?!${level})(\\d+).json`
      );

      const levelRegex = new RegExp(
        `db:\/\/assets\/resources\/configs\/VoiceLanguage\/level_(?!${level})(\\d+).json`
      );

      if (!tipsRegex.test(assetUrl) && !levelRegex.test(assetUrl)) continue;

      const url = `../../build${level}/web-mobile/res/import`;

      deleteJsonFilesInDir(url, asset, ".json");
    }
  }
  callback();
}

/** 构建完全结束时触发，根据setting.js文件找到其他关卡预制体资源的json文件所在目录并进行删除；删除project.js文件下其他关卡的脚本代码以压缩project.js体积 */
function onBuildFinish(options, callback) {
  if (level === 0) {
    callback();
  }

  customProject();
  customSetting();

  callback();
}

/** 自定义project.js */
function customProject() {
  const url = `../../build${level}/web-mobile/src/project.js`;
  const projectUrl = path.resolve(__dirname, url);

  const strRegex = new RegExp(
    `n\\.levelContext(?!${level})\\d+=(\\{.*?\\}),cc\\._RF\\.pop()`,
    "g"
  );

  // const strRegex1 = new RegExp(`LevelContext(?!${level})\\d+:\\[.*?\\],`, "g");

  // 读取文件内容
  fs.readFile(projectUrl, "utf8", (err, data) => {
    if (err) {
      Editor.error("Error reading the file:", err);
      return;
    }

    // 使用正则删除匹配的字符
    let updatedContent = data.replace(strRegex, (match, p1) => {
      // 将捕获组 p1（即 {.*?} 部分）替换成{}
      return match.replace(p1, "{}");
    });

    // 将更新后的内容覆盖写入原文件
    fs.writeFile(projectUrl, updatedContent, "utf8", (writeErr) => {
      if (writeErr) {
        Editor.error("Error writing to the file:", writeErr);
        return;
      }

      Editor.log("File successfully updated!");
    });
  });
}

/** 自定义setting.js */
function customSetting() {
  const url = `../../build${level}/web-mobile/src/settings.js`;
  const settingUrl = path.resolve(__dirname, url);
  // 获取构建完成后setting.js文件里面的window._CCSettings对象
  // 如果不清楚window._CCSettings对象的结构，打开test目录下的settings.js。
  const ccSetting = extractCCSettings(settingUrl);

  // ccSetting.rawAssets.assets下，预制体的key能转化成数字。
  const rawAssetkeys = Object.keys(ccSetting.rawAssets.assets);
  // ccSetting.packedAssets下，key值即是构建后的json文件名，也是最核心的。
  const packedAssetkeys = Object.keys(ccSetting.packedAssets);

  for (let i = 0; i < rawAssetkeys.length; i++) {
    const rawkey = rawAssetkeys[i];
    // 尝试转化为数字，如果是预制体，那key是能转成数字的
    const targetNum = Number(rawkey);

    if (Number.isNaN(targetNum)) continue;

    const rawAsset = ccSetting.rawAssets.assets[rawkey];

    // 不清楚是不是所有的资源映射都是数组，但至少预制体的是，所以检查是不是数组，以防万一
    if (!Array.isArray(rawAsset)) continue;

    const pathRegex = new RegExp(`level/LevelPrefab(?!${level})(\\d+).prefab`);

    // 项目中除了关卡预制体还会有其他的预制体资源，所以这里通过正则进一步缩小预制体范围
    if (!pathRegex.test(rawAsset[0])) continue;

    // 来到这里就代表 targetNum 这个key值是我们要清理的关卡预制体的key
    // 由于ccSetting.packedAssets下的key是资源构建后的文件名，value是这个资源所依赖的其他资源数组，并且这个数组里面会包括前面ccSetting.rawAssets.assets下的key（也就是包括targetNum）。
    // 所以现在就是遍历ccSetting.packedAssets，检查有没有哪个value数组包括了targetNum，而这个value的key就是最后要删除的json资源的文件名
    for (let j = 0; j < packedAssetkeys.length; j++) {
      const packedKey = packedAssetkeys[j];
      const packedAsset = ccSetting.packedAssets[packedKey];

      if (!Array.isArray(packedAsset)) continue;

      const hasTargetNum = packedAsset.find((item) => {
        return item === targetNum;
      });

      if (hasTargetNum) {
        const url = `../../build${level}/web-mobile/res/import`;

        deleteJsonFilesInDir(url, packedKey, ".json");
      }
    }
  }
}

/** 递归删除指定目录下指定扩展名的文件 */
function deleteJsonFilesInDir(dir, targetFileName, ext) {
  const absoluteDir = path.resolve(__dirname, dir);
  try {
    // 读取目录内容
    fs.readdir(absoluteDir, (err, files) => {
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

/** 获取构建完成后setting.js文件里面的window._CCSettings对象 */
function extractCCSettings(filePath) {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.error(`文件 "${filePath}" 不存在`);
      return null;
    }

    // 读取文件内容
    const fileContent = fs.readFileSync(filePath, "utf8");

    // 使用正则提取 window._CCSettings 对象的内容
    const match = fileContent.match(/window\._CCSettings=({.*?});/);

    if (match && match[1]) {
      // 使用 eval 将匹配到的对象内容转换为 JavaScript 对象
      const _CCSettings = eval(`(${match[1]})`);
      return _CCSettings;
    } else {
      console.error("未找到 window._CCSettings 对象");
      return null;
    }
  } catch (error) {
    console.error("读取或解析文件时出错:", error.message);
    return null;
  }
}

module.exports = {
  load() {
    Editor.Builder.on("build-start", onStartBuild);
    Editor.Builder.on("before-change-files", onBeforeBuildFinish);
    Editor.Builder.on("build-finished", onBuildFinish);
  },

  unload() {
    Editor.Builder.removeListener("build-start", onStartBuild);
    Editor.Builder.removeListener("before-change-files", onBeforeBuildFinish);
    Editor.Builder.removeListener("build-finished", onBuildFinish);
  },

  messages: {
    "open-panel": function (event, ...args) {
      Editor.Panel.open("tree-shaking");
    },
    "set-level": function (event, ...args) {
      const _level = Number.parseInt(args[0]);

      if (_level >= 1 && _level <= Number.MAX_VALUE) {
        level = _level;
        Editor.log(
          `已经设置当前需要构建的关卡为第${level}关，项目构建后会自动清理其他关卡的资源以压缩包体积`
        );
      } else {
        Editor.log("输入的数字无效");
      }
    },
  },
};
