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
