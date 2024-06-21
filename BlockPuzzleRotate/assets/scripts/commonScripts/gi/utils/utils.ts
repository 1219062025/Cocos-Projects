export default class Utils {
  /** 扁平化数组 */
  static flat<T>(array): T[] {
    return array.reduce((acc, curr) => {
      if (Array.isArray(curr)) {
        return acc.concat(this.flat(curr));
      } else {
        return acc.concat(curr);
      }
    }, []);
  }

  /** 判断传入的值是否在某个数字闭区间内 */
  static inRange(value: number, min: number, max: number) {
    return value >= min && value <= max;
  }

  /** 防抖 */
  static debounce(func, delay) {
    let timerId;

    return function (...args) {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  /** 将节点所有的子节点按照原本的布局居中于该节点 */
  static centerChildren(node: cc.Node) {
    let children = node.children;
    let parentPosition = node.getPosition();

    // 计算所有子节点的平均位置
    let totalX = 0;
    let totalY = 0;

    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      let childPosition = child.getPosition();
      totalX += childPosition.x;
      totalY += childPosition.y;
    }

    let averageX = totalX / children.length;
    let averageY = totalY / children.length;

    // 将所有子节点重新定位到父节点的中心位置
    let offsetX = parentPosition.x - averageX;
    let offsetY = parentPosition.y - averageY;

    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      let childPosition = child.getPosition();
      child.setPosition(childPosition.x + offsetX, childPosition.y + offsetY);
    }
  }

  /** 获取节点能够包容所有子节点的最小矩形的宽、高 */
  static calculateBoundingBox(node: cc.Node) {
    // 获取节点的世界包围框
    let bounds = node.getBoundingBoxToWorld();

    node.children.forEach(children => {
      const ChildrenBoundingBox = children.getBoundingBoxToWorld();
      bounds.union(bounds, ChildrenBoundingBox);
    });

    return bounds;
  }
}
