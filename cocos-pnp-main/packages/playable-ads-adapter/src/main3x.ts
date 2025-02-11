import { BUILDER_NAME } from "@/extensions/constants";

export const methods: { [key: string]: (...opts: unknown[]) => unknown } = {
  openPanel() {
    Editor.Panel.open(BUILDER_NAME);
  },
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {
  console.log(`${BUILDER_NAME} is loaded`);
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() {
  console.log(`${BUILDER_NAME} is unloaded`);
}
