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
  static debounce(func: Function, delay: number) {
    let timerId;

    return function (...args) {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  /** 节流 */
  static throttle(func: Function, wait: number) {
    let lastTime = 0;

    return function (...args: any[]) {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        func.apply(this, args);
      }
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

  /**
   * 节点振动
   * @param node 振动的节点，如果不填则是屏幕振动
   * @param amplitude 振动幅度
   * @param frequency 振动频率
   * @param duration 振动用时
   */
  static shake(options?: { node?: cc.Node; amplitude?: number; frequency?: number; duration?: number }) {
    return new Promise(resolve => {
      const node = (options && options.node) || cc.Camera.main.node;
      const amplitude = (options && options.amplitude) || 20;
      const frequency = (options && options.frequency) || 0.05;
      const duration = (options && options.duration) || 2;

      const originalPosition = node.position.clone();
      const shakesNum = Math.floor(duration / frequency);

      let tweenSequence = cc.tween(node) as cc.Tween;

      for (let i = 0; i < shakesNum; i++) {
        const offsetX = (Math.random() - 0.5) * amplitude;
        const offsetY = (Math.random() - 0.5) * amplitude;
        const shakeAction = cc.tween().by(frequency, { position: cc.v2(offsetX, offsetY) }) as cc.Tween;
        tweenSequence = tweenSequence.then(shakeAction);
      }

      tweenSequence
        .call(() => {
          node.position = originalPosition; // 重置节点位置
          resolve(true);
        })
        .start();
    });
  }
}
