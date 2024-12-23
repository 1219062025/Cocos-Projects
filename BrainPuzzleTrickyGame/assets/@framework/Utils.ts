import InstanceBase from "./common/InstanceBase";

class Utils extends InstanceBase {
  constructor() {
    super();
  }

  /** 判断两个数组是否存在交集 */
  hasIntersection(array1: string[], array2: string[]): boolean {
    return array1.some((tag) => array2.includes(tag));
  }

  /**
   * 删除数组中的某个元素（按值删除）
   * @param array 原数组
   * @param value 要删除的元素值
   */
  removeElement<T>(array: T[], value: T): void {
    const index = array.indexOf(value);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  /**
   * 防抖函数
   * @param func 要执行的函数
   * @param wait 等待时间
   * @returns 返回一个新的函数
   */
  debounce(func: Function, wait: number): Function {
    let timeout: number | null = null;
    return function () {
      const context = this;
      const args = arguments;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }

  /**
   * 等待一段时间
   * @param {number} delay 等待时间
   * @param {boolean} ms 单位是否是毫秒
   */
  wait(delay: number, ms: boolean = false) {
    return new Promise((resolve) =>
      setTimeout(resolve, ms ? delay : delay * 1000)
    );
  }
}

export default Utils.instance();
