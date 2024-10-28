interface SwipeOptions {
  /** 滑动方向 */
  direction: number | number[];
  /** 滑动阈值 */
  threshold?: number;
}

export default class Swipe {
  static Direction = {
    /** 上滑 */
    UP: 1,
    /** 右滑 */
    RIGHT: 2,
    /** 下滑 */
    BOTTOM: 3,
    /** 左滑 */
    LEFT: 4
  };

  /**
   * 监听节点上的滑动操作，会覆盖节点上的TOUCH_START、TOUCH_END、TOUCH_CANCEL事件
   * @param node 需要监听的节点
   * @param options.direction 滑动方向，传入number或者number[]，值参考gi.Swipe.Direction
   * @param options.threshold 滑动阈值，传入number，默认50
   * @param callback 回调函数，接收参数：滑动起始点位置，结束点位置，此次滑动的方向（参考gi.Swipe.Direction）
   * @param target 调用回调函数this值
   */
  static on(node: cc.Node, options: SwipeOptions, callback: Function, target?: any) {
    let touchStartPos: cc.Vec2;
    let touchEndPos: cc.Vec2;

    node.on(
      cc.Node.EventType.TOUCH_START,
      (e: cc.Event.EventTouch) => {
        touchStartPos = e.getLocation();
      },
      this
    );

    node.on(
      cc.Node.EventType.TOUCH_END,
      (e: cc.Event.EventTouch) => {
        touchEndPos = e.getLocation();
        this.handleSwipe(node, touchStartPos, touchEndPos, options, callback, target);
      },
      this
    );

    node.on(
      cc.Node.EventType.TOUCH_CANCEL,
      (e: cc.Event.EventTouch) => {
        touchEndPos = e.getLocation();
        this.handleSwipe(node, touchStartPos, touchEndPos, options, callback, target);
      },
      this
    );
  }

  /**
   * 监听一次节点上的滑动操作，详情参考gi.Swipe.on
   */
  static once(node: cc.Node, options: SwipeOptions, callback: Function, target?: any) {
    let touchStartPos: cc.Vec2;
    let touchEndPos: cc.Vec2;

    node.on(
      cc.Node.EventType.TOUCH_START,
      (e: cc.Event.EventTouch) => {
        touchStartPos = e.getLocation();
      },
      this
    );

    node.on(
      cc.Node.EventType.TOUCH_END,
      (e: cc.Event.EventTouch) => {
        touchEndPos = e.getLocation();
        this.handleSwipe(node, touchStartPos, touchEndPos, options, callback, target, true);
      },
      this
    );

    node.on(
      cc.Node.EventType.TOUCH_CANCEL,
      (e: cc.Event.EventTouch) => {
        touchEndPos = e.getLocation();
        this.handleSwipe(node, touchStartPos, touchEndPos, options, callback, target, true);
      },
      this
    );
  }

  /** 取消监听节点滑动 */
  static off(node: cc.Node) {
    node.off(cc.Node.EventType.TOUCH_START);
    node.off(cc.Node.EventType.TOUCH_END);
    node.off(cc.Node.EventType.TOUCH_CANCEL);
  }

  /** 处理滑动 */
  private static handleSwipe(node: cc.Node, touchStartPos: cc.Vec2, touchEndPos: cc.Vec2, options: SwipeOptions, callback: Function, target: Object, isOnce?: boolean) {
    const threshold: number = options.threshold || 30;
    const direction: number[] = typeof options.direction === 'number' ? [options.direction] : options.direction;

    if (!touchStartPos || !touchEndPos || !direction || !node) {
      return;
    }

    const deltaX = touchEndPos.x - touchStartPos.x;
    const deltaY = touchEndPos.y - touchStartPos.y;

    // 水平滑动
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 滑动没到阈值，无效
      if (Math.abs(deltaX) <= threshold) return;

      if (deltaX > 0 && direction.includes(gi.Swipe.Direction.RIGHT)) {
        // 右滑
        callback.call(target || null, touchStartPos, touchEndPos, gi.Swipe.Direction.RIGHT);
        if (isOnce) this.off(node);
        return;
      } else if (deltaX < 0 && direction.includes(gi.Swipe.Direction.LEFT)) {
        // 左滑
        callback.call(target || null, touchStartPos, touchEndPos, gi.Swipe.Direction.LEFT);
        if (isOnce) this.off(node);
        return;
      }
    }

    // 垂直滑动
    if (Math.abs(deltaX) <= Math.abs(deltaY)) {
      // 滑动没到阈值，无效
      if (Math.abs(deltaY) <= threshold) return;

      if (deltaY > 0 && direction.includes(gi.Swipe.Direction.UP)) {
        // 上滑
        callback.call(target || null, touchStartPos, touchEndPos, gi.Swipe.Direction.UP);
        if (isOnce) this.off(node);
        return;
      } else if (deltaY < 0 && direction.includes(gi.Swipe.Direction.BOTTOM)) {
        // 下滑
        callback.call(target || null, touchStartPos, touchEndPos, gi.Swipe.Direction.BOTTOM);
        if (isOnce) this.off(node);
        return;
      }
    }

    // 重置触摸位置
    touchStartPos = null;
    touchEndPos = null;
  }
}
