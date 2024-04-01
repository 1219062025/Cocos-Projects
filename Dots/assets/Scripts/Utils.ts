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

/** 默认触发一次的节流函数 */
export function throttle(func, wait) {
  let lastTime = 0;
  let firstTime = true;

  return function (...args) {
    const now = Date.now();

    if (firstTime || now - lastTime >= wait) {
      func.apply(this, args);
      lastTime = now;
      firstTime = false;
    }
  };
}
