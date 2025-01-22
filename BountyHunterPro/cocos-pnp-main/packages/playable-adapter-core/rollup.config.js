// 引入必要的 rollup 插件
import commonjs from "@rollup/plugin-commonjs"; // 将 CommonJS 模块转换为 ES6
import { nodeResolve } from "@rollup/plugin-node-resolve"; // 解析 node_modules 中的依赖
import json from "@rollup/plugin-json"; // 支持导入 JSON 文件
import isBuiltin from "is-builtin-module"; // 检查是否为 内置模块
import replace from "@rollup/plugin-replace"; // 字符串替换插件
import typescript from "@rollup/plugin-typescript"; // TypeScript 支持
import terser from "@rollup/plugin-terser"; // 代码压缩
import alias from "@rollup/plugin-alias"; // 路径别名
import dts from "rollup-plugin-dts"; // 生成 .d.ts 类型声明文件
import { minify } from "uglify-js"; // JS 代码压缩工具
import { readFileSync } from "fs"; // 文件读取

// 工具函数：读取并压缩 JS 文件内容
const getJSCode = (jsPath) => {
  return JSON.stringify(
    minify(readFileSync(__dirname + jsPath).toString("utf-8")).code
  );
};

// Rollup 配置导出（包含两个构建任务）
export default [
  // 任务1：构建主要的 JS 文件
  {
    input: "src/index.ts", // 入口文件
    output: {
      file: `dist/playable-adapter-core.js`, // 输出文件
      format: "commonjs", // 输出格式为 CommonJS
    },
    plugins: [
      typescript(), // 处理 TypeScript
      json(), // 处理 JSON
      commonjs(), // 处理 CommonJS 模块
      nodeResolve({
        preferBuiltins: false, // 不优先使用 Node.js 内置模块
        resolveOnly: (module) =>
          module === "string_decoder" || !isBuiltin(module), // 只解析非内置模块和 string_decoder
        exportConditions: ["node"], // 使用 node 环境的导出条件
      }),
      terser(), // 压缩代码
      alias({
        // 设置路径别名
        entries: [{ find: "@", replacement: __dirname + "/src" }],
      }),
      replace({
        // 替换代码中的特定字符串
        preventAssignment: true, // 防止替换赋值语句
        values: {
          // 注入不同版本的适配器代码
          __adapter_init_2x_code__: () => getJSCode("/injects/2x/init.js"), // 2.x 初始化代码
          __adapter_main_2x_code__: () => getJSCode("/injects/2x/main.js"), // 2.x 主要代码
          __adapter_init_3x_code__: () => getJSCode("/injects/3x/init.js"), // 3.x 初始化代码
          __adapter_main_3x_code__: () => getJSCode("/injects/3x/main.js"), // 3.x 主要代码
          __adapter_jszip_code__: () => getJSCode("/injects/libs/pako.js"), // 压缩库代码
        },
      }),
    ],
    external: ["fs", "path"], // 排除 Node.js 内置模块
  },
  // 任务2：生成 TypeScript 类型声明文件
  {
    input: `src/index.ts`, // 入口文件
    output: {
      file: `dist/playable-adapter-core.d.ts`, // 输出类型声明文件
    },
    plugins: [
      alias({
        // 设置路径别名
        entries: [{ find: "@", replacement: __dirname + "/src" }],
      }),
      dts(), // 生成类型声明文件
    ],
  },
];
