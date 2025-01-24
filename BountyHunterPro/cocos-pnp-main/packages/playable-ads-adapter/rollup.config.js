import pkgJson from "./package.json";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import cocosPluginUpdater from "./plugins/cocos-plugin-updater";
import cocosPluginWorker from "./plugins/cocos-plugin-worker";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import isBuiltin from "is-builtin-module";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import alias from "@rollup/plugin-alias";
import del from "rollup-plugin-delete";

const appName = pkgJson.name;
const appVersion = pkgJson.version;
const outputDir = `../../../../test3x/extensions/${appName}`;
const builderVersion = process.env.BUILD_VERSION || "2x"; // 构建版本：2x 或 3x
const is2xBuilder = builderVersion === "2x";

export default {
  input: {
    main: `src/main${builderVersion}.ts`, // 根据版本选择不同的入口文件
    "panel/index": "src/panel/scripts/index.ts", // 打包面板
    ...(is2xBuilder ? {} : { hooks: `src/hooks.ts` }), // 3x版本才需要hooks
  },
  output: {
    dir: outputDir, // 输出目录
    format: "commonjs", // 使用CommonJS格式
  },
  plugins: [
    //TypeScript 编译
    typescript(),

    // CommonJS 转换
    commonjs(),

    // 代码压缩
    terser(),

    // 路径别名
    alias({
      entries: [
        { find: "@", replacement: __dirname + "/src" },
        { find: "~types", replacement: __dirname + "@types" },
      ],
    }),

    // JSON 文件支持
    json(),

    // 模块解析（处理不同版本的依赖关系）
    nodeResolve({
      preferBuiltins: is2xBuilder,
      ...(is2xBuilder
        ? {}
        : {
            resolveOnly: (module) =>
              module === "string_decoder" || !isBuiltin(module),
            exportConditions: ["node"],
          }),
    }),

    // 文件复制
    copy({
      targets: [
        {
          // 复制并处理package.json
          src: `assets/package-${builderVersion}.json`,
          dest: outputDir,
          rename: "package.json",
          transform: (contents) => {
            const tempPkgJson = JSON.parse(contents.toString("utf-8"));
            tempPkgJson.version = appVersion;
            return JSON.stringify(tempPkgJson, null, 2);
          },
        },
        // 复制i18n文件
        { src: "i18n/**/*", dest: `${outputDir}/i18n` },
        { src: "src/panel/template", dest: `${outputDir}/panel` },
        { src: "src/panel/style", dest: `${outputDir}/panel` },
        { src: "src/panel/products", dest: `${outputDir}/panel` },
      ],
      verbose: true,
    }),

    del({
      targets: `${outputDir}/*`, // 清空 dist 文件夹中的所有文件
      hook: "buildStart", // 在每次构建开始时清空文件夹
      force: true, // 强制删除
    }),

    // 自定义插件
    cocosPluginWorker(),
    cocosPluginUpdater({
      src: `${__dirname}/${outputDir}`,
      dest: `~/.CocosCreator/${
        is2xBuilder ? "packages" : "extensions"
      }/${appName}`,
    }),
  ],
  external: ["fs", "path", "os", "electron"], // 这些模块不打包
};
