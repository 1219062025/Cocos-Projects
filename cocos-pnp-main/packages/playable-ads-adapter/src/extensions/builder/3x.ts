import { shell } from "electron";
import { IBuildTaskOption, Platform } from "~types/packages/builder/@types";
import { run } from "node-cmd";
import { ADAPTER_RC_PATH, BUILDER_NAME } from "@/extensions/constants";
import {
  checkOSPlatform,
  getAdapterConfig,
  getRCSkipBuild,
  getRealPath,
  writeToPath,
} from "@/extensions/utils";
import { exec3xAdapter } from "playable-adapter-core";
import workPath from "../worker/3x?worker";
import { join } from "path";

const setupWorker = (
  params: { buildFolderPath: string; adapterBuildConfig: TAdapterRC },
  successCb: Function,
  failCb: Function
) => {
  const { Worker } = require("worker_threads");

  console.log("尝试开启Worker子线程适配");
  const worker = new Worker(workPath, {
    workerData: params,
  });
  worker.on("message", ({ finished, msg, event }: TWorkerMsg) => {
    if (event === "adapter:finished") {
      finished ? successCb() : failCb(msg);
      return;
    }
    // 处理消息 adapter:log 和 adapter:info
    console[event.split(":")[1] as ConsoleMethodName](msg);
  });
};

const runBuilder = (buildPlatform: TPlatform) => {
  return new Promise<void>((resolve, reject) => {
    let cocosBuilderPath = Editor.App.path;
    const platform = checkOSPlatform();
    if (platform === "MAC") {
      cocosBuilderPath = cocosBuilderPath.replace(
        "/Resources/app.asar",
        "/MacOS/CocosCreator"
      );
    } else if (platform === "WINDOWS") {
      cocosBuilderPath = getRealPath(cocosBuilderPath).replace(
        "/resources/app.asar",
        "/CocosCreator.exe"
      );
    } else {
      reject(`不支持${platform}平台构建`);
    }

    const command = `${cocosBuilderPath} --project ${Editor.Project.path} --build "platform=${buildPlatform};"`;

    const processRef = run(command, (err, data, stderr) => {
      resolve();
    });
    // 输出执行构建命令时的日志
    processRef.stdout.on("data", (data: string) => {
      console.log(data);
    });
  });
};

export const initBuildStartEvent = async (
  options: Partial<IBuildTaskOption>
) => {
  const isSkipBuild = getRCSkipBuild();
  console.log(
    `${BUILDER_NAME} ${isSkipBuild ? "跳过预构建处理" : "进行预构建处理"}`
  );
};

export const initBuildFinishedEvent = (options: Partial<IBuildTaskOption>) => {
  return new Promise(async (resolve, reject) => {
    const { projectRootPath, projectBuildPath, adapterBuildConfig } =
      getAdapterConfig();

    /** cocos构建输出绝对路径，类似 E:\Project\Cocos-Projects\ProjectName\build */
    const buildFolderPath = join(projectRootPath, projectBuildPath);

    console.info(`${BUILDER_NAME} 开始适配，导出平台 ${options.platform}`);

    const start = new Date().getTime();

    const handleExportFinished = () => {
      const end = new Date().getTime();
      console.log(
        `${BUILDER_NAME} 适配完成，共耗时${((end - start) / 1000).toFixed(0)}秒`
      );
      Editor.Message.send(BUILDER_NAME, "package-finished");
      resolve(true);
    };
    const handleExportError = (err: string) => {
      console.error("适配失败");
      reject(err);
    };

    const params = {
      buildFolderPath,
      adapterBuildConfig: {
        ...adapterBuildConfig,
        buildPlatform: options.platform!,
      },
    };

    try {
      setupWorker(params, handleExportFinished, handleExportError);
    } catch (error) {
      console.log("error：", error);
      console.log("Worker子线程适配失败，将开启主线程适配；");

      await exec3xAdapter(params, {
        mode: "serial",
      });
      handleExportFinished();
    }
  });
};

/** 根据面板选项 写入.adapterrc配置 */
export const writeConfigToAdapterRC = (config: TPanelAdapterRC) => {
  const adapterrc = {
    buildPlatform: config.buildPlatform,
    skipBuild: config.skipBuild,
    exportChannels: Array.from(config.exportChannels),
    orientation: config.orientation,
    enableSplash: config.enableSplash,
    isZip: config.isZip,
    tinify: config.tinify,
    tinifyApiKey: config.tinifyApiKey,
  };
  const adapterrcPath = join(Editor.Project.path, ADAPTER_RC_PATH);
  writeToPath(adapterrcPath, JSON.stringify(adapterrc));
};

export const builder3x = async (config: TPanelAdapterRC) => {
  try {
    writeConfigToAdapterRC(config);

    // 初始化 start
    const { buildPlatform, projectRootPath, projectBuildPath } =
      getAdapterConfig();
    // 初始化 end
    console.log(`开始构建项目，导出${buildPlatform}包`);

    // 重置适配进度条为0
    Editor.Message.send(
      BUILDER_NAME,
      "on-progress",
      0,
      `开始构建项目，导出${buildPlatform}包`
    );

    const isSkipBuild = getRCSkipBuild();
    const buildPath = join(projectRootPath, projectBuildPath);

    await initBuildStartEvent({
      platform: buildPlatform,
    });
    if (!isSkipBuild) {
      await runBuilder(buildPlatform);
    }
    Editor.Message.send(
      BUILDER_NAME,
      "on-progress",
      20,
      !isSkipBuild ? "构建完成，开始适配" : "跳过构建，开始适配"
    );

    await initBuildFinishedEvent({
      platform: buildPlatform,
    });
    shell.openPath(buildPath);
    console.log("构建完成");
  } catch (error) {
    console.error(error);
  }
};
