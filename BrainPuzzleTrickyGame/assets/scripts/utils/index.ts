/**
 * 等待一段时间
 * @param {number} delay 等待时间
 * @param {boolean} ms 单位是否是毫秒
 */
export function wait(delay: number, ms: boolean = false) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms ? delay : delay * 1000)
  );
}
