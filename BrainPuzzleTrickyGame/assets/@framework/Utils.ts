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
}

export default Utils.instance();
