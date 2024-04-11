/** 扁平化数组 */
export function flat<T>(array): T[] {
  return array.reduce((acc, curr) => {
    if (Array.isArray(curr)) {
      return acc.concat(flat(curr));
    } else {
      return acc.concat(curr);
    }
  }, []);
}

/** 判断传入的值是否在某个数字闭区间内 */
export function InRange(value: number, min: number, max: number) {
  return value >= min && value <= max;
}
