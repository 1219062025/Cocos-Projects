const { ccclass, property } = cc._decorator;

@ccclass
export default class DrawControl extends cc.Component {
  /** 路径信息的JSON资源 */
  @property({ type: [cc.JsonAsset] })
  pathJson: cc.JsonAsset[] = [];

  @property({ type: cc.Node, tooltip: '结束弹窗' })
  pop: cc.Node = null;

  pathJsonIndex: number = 0;

  /** 铅笔节点 */
  @property(cc.Node)
  pencil: cc.Node = null;

  /** 形状绘画组件 */
  @property(cc.Graphics)
  shapeCtx: cc.Graphics = null;

  /** 线段绘画组件 */
  @property(cc.Graphics)
  lineCtx: cc.Graphics = null;

  @property(cc.ProgressBar)
  progress: cc.ProgressBar = null;

  /** 手指引导 */
  @property(cc.Node)
  finger: cc.Node = null;

  /** 路径 */
  path: gi.Path = null;

  /** 所有点 */
  points: gi.Point[] = [];

  /** 所有点的Map形式，用以筛选掉相同坐标的点 */
  pointsMap: Map<string, gi.Point> = new Map([]);

  /** 触摸移动到下一个触摸点的最小触摸距离 */
  minDistance: number = Infinity;
  /** 触摸移动到下一个触摸点的最大触摸距离 */
  maxDistance: number = 0;

  /** 目标点 */
  targetPoints: Set<gi.Point> = new Set([]);

  /** 已经经过了的目标点 */
  visitedTargetPoints: Set<gi.Point> = new Set([]);

  /** 已经经过了的点 */
  visitedPoints: Set<gi.Point> = new Set([]);

  /** 已经画过的线 */
  visitedLine: Map<string, gi.Line> = new Map([]);

  /** 起点 */
  startPoint: gi.Point = null;

  /** 当前画线了多少长度 */
  drawLength: number = 0;

  /** 是否试玩结束 */
  isComplete: boolean = false;

  /** 当前画着的路径点所在的贝塞尔曲线 */
  curBezier: gi.Bezier = null;

  /** 每段贝塞尔曲线包含的点映射 */
  bezierPointsMap: Map<string, gi.Point[]> = new Map([]);

  _curPoint: gi.Point = null;
  /** 当前选中的路径点 */
  get curPoint() {
    return this._curPoint;
  }
  set curPoint(value) {
    this._curPoint = value;
    if (value !== null) {
      this.curBezier = value.value.bezier;
      const pointsCount = this.points.length;
      const curIndex = this._curPoint.index;
      const preIndex = this._curPoint.index === 0 ? pointsCount - 1 : curIndex - 1;
      const nextIndex = (this._curPoint.index + 1) % pointsCount;
      this.prePoint = this.points[preIndex];
      this.nextPoint = this.points[nextIndex];
    }
  }
  /** 上一个路径点 */
  prePoint: gi.Point = null;
  /** 下一个路径点 */
  nextPoint: gi.Point = null;
  /** 指向上一个路径点的向量 */
  get toPreVec() {
    if (!this.prePoint) return null;
    const preVec = cc.v2(this.prePoint.value.x, this.prePoint.value.y);
    const curVec = cc.v2(this.curPoint.value.x, this.curPoint.value.y);
    return preVec.sub(curVec);
  }
  /** 指向下一个路径点的向量 */
  get toNextVec() {
    if (!this.nextPoint) return null;
    const nextVec = cc.v2(this.nextPoint.value.x, this.nextPoint.value.y);
    const curVec = cc.v2(this.curPoint.value.x, this.curPoint.value.y);
    return nextVec.sub(curVec);
  }

  onLoad() {
    if (!this.pathJson.length) return;
    this.initCtx();
    this.initShapePath(this.pathJson[this.pathJsonIndex++]);
    const canvas = cc.Canvas.instance.node;
    canvas.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }

  onTouchStart(event: cc.Event.EventTouch) {
    if (!this.curPoint && !this.isComplete) {
      const touchPos = this.node.convertToNodeSpaceAR(event.getLocation());

      this.curPoint = this.getNearestPoint(touchPos);
      this.startPoint = this.curPoint;
      this.visitedTargetPoints.add(this.startPoint);
      this.visitedPoints.add(this.startPoint);

      this.pencil.setPosition(this.curPoint.value.x, this.curPoint.value.y);
      this.pencil.active = true;

      this.finger.active = false;
    }
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (this.curPoint && !this.isComplete) {
      /** 触点在上一次事件时的位置对象 */
      const preTouch = this.node.convertToNodeSpaceAR(event.getPreviousLocation());
      /** 触点位置 */
      const curTouch = this.node.convertToNodeSpaceAR(event.getLocation());
      /** 触摸移动方向上的下一个路径点 */
      const nextPoints = this.getMoveNextPoint(curTouch.sub(preTouch));

      const moveNextPoint = nextPoints[0] || null;

      if (this.visitedTargetPoints.size === this.targetPoints.size && this.points.length - this.visitedPoints.size < 10) {
        this.nextLevel();
        // console.log('通关');
        return;
      }

      if (this.isFail()) {
        // console.log('失败');
        this.isComplete = true;
        this.pop.active = true;
        (cc.tween(this.pop) as cc.Tween).to(1, { opacity: 255 }).start();
      }

      if (moveNextPoint) {
        if (!this.isVisitedTargetPoint(moveNextPoint) && !this.isVisitedPoint(moveNextPoint)) {
          // -------------画线以及处理画线后相关的状态更改---------------
          this.draw(this.curPoint, moveNextPoint);
          this.visitedPoints.add(moveNextPoint);
          if (this.targetPoints.has(moveNextPoint)) this.visitedTargetPoints.add(moveNextPoint);
          this.curPoint = moveNextPoint;
        }
      }
    }
  }

  isFail() {
    for (let i = 0; i < this.points.length; i++) {
      if (i !== this.curPoint.index) {
        const point = this.points[i];
        const direction = cc.v2(point.value.x - this.curPoint.value.x, point.value.y - this.curPoint.value.y);
        const distance = direction.mag();
        if (distance < this.maxDistance && this.isDirectionMatching(direction, direction) && !this.visitedPoints.has(point) && !this.visitedTargetPoints.has(point)) {
          /**
           * 如果当前点是目标点，下一个选择不检查
           * 如果当前点不是目标点，但下一个选择是目标点不检查
           * 其他都需要检查是否处于相同的贝塞尔曲线
           */
          if (!this.targetPoints.has(this.curPoint) && !this.targetPoints.has(point)) {
            if (this.curBezier.str !== point.value.bezier.str) continue;
          }
          return false;
        }
      }
    }
    return true;
  }

  /** 画线 */
  draw(from: gi.Point, to: gi.Point, isErase?: boolean) {
    this.lineCtx.moveTo(from.value.x, from.value.y);
    this.lineCtx.lineTo(to.value.x, to.value.y);
    this.lineCtx.stroke();
    this.pencil.setPosition(to.value.x, to.value.y);
    if (!isErase) {
      this.drawLength += to.value.length;
      this.progress.progress = this.drawLength / this.path.length;
    }
  }

  /** 擦除 */
  erase(eraseid: string) {
    const eraseLine = this.visitedLine.get(eraseid);
    if (!eraseLine) return;
    this.drawLength -= eraseLine.to.value.length;
    this.progress.progress = this.drawLength / this.path.length;

    this.lineCtx.clear();
    this.visitedLine.forEach((line, id) => {
      if (id !== eraseid) {
        this.draw(line.from, line.to, true);
      }
    });
  }

  /** 是否是已经访问过了的目标点 */
  isVisitedTargetPoint(point: gi.Point) {
    return this.visitedTargetPoints.has(point);
  }

  /** 是否是已经访问过了的点 */
  isVisitedPoint(point: gi.Point) {
    return this.visitedPoints.has(point);
  }

  /** 是否是目标点 */
  isTargetPoint(point: gi.Point) {
    return this.targetPoints.has(point);
  }

  /** 获取触摸移动方向上的下一个路径点, toMoveVec为触点从上一次事件时指向当前位置的向量，指向触摸移动方向 */
  getMoveNextPoint(toMoveVec: cc.Vec2) {
    /** 两向量夹角的余弦值。两向量归一化后的点乘为其夹角的余弦值：Cos(x) = AVec · BVec
     *  再根据余弦函数的曲线图可推算出两向量方向的关系如下:
     *  Cos(x) === 1时，完全一致；
     *  0 < Cos(x) < 1时，基本一致；
     *  Cos(x) === 0时，垂直；
     *  -1 < Cos(x) < 0时，基本相反；
     *  Cos(x) === -1时，完全相反；
     */

    let pointIndexs: number[] = [];

    for (let i = 0; i < this.points.length; i++) {
      if (i !== this.curPoint.index) {
        const point = this.points[i];
        const direction = cc.v2(point.value.x - this.curPoint.value.x, point.value.y - this.curPoint.value.y);
        const distance = direction.mag();

        if (distance < this.maxDistance && this.isDirectionMatching(toMoveVec, direction)) {
          /**
           * 如果当前点是目标点，下一个选择不检查
           * 如果当前点不是目标点，但下一个选择是目标点不检查
           * 其他都需要检查是否处于相同的贝塞尔曲线
           */
          if (!this.targetPoints.has(this.curPoint) && !this.targetPoints.has(point)) {
            if (this.curBezier.str !== point.value.bezier.str) continue;
          }
          pointIndexs.push(i);
        }
      }
    }

    // 过滤掉不可访问的点
    const points =
      pointIndexs
        .filter(index => {
          return !this.visitedPoints.has(this.points[index]);
        })
        .map(index => this.points[index]) || [];

    // 找出距离最近的
    points.sort((a, b) => {
      const directionA = cc.v2(a.value.x - this.curPoint.value.x, a.value.y - this.curPoint.value.y);
      const distanceA = directionA.mag();
      const directionB = cc.v2(b.value.x - this.curPoint.value.x, b.value.y - this.curPoint.value.y);
      const distanceB = directionB.mag();

      if (distanceA < distanceB) {
        return -1;
      } else if (distanceA > distanceB) {
        return 1;
      } else {
        return 0;
      }
    });

    return points;
  }

  isDirectionMatching(toMoveVec: cc.Vec2, direction: cc.Vec2): boolean {
    const dotProduct = toMoveVec.normalize().dot(direction.normalize());
    return dotProduct > 0.4; // 判断方向是否一致
  }

  /** 下一关或者结束游戏 */
  nextLevel() {
    const pathJson = this.pathJson[this.pathJsonIndex];
    if (pathJson) {
      this.pencil.active = false;
      this.progress.progress = 0;
      this.path = null;
      this.points = [];
      this.targetPoints.clear();
      this.visitedTargetPoints.clear();
      this.visitedPoints.clear();
      this.visitedLine.clear();
      this.startPoint = null;
      this.drawLength = 0;
      this.curPoint = null;

      this.shapeCtx.clear();
      this.lineCtx.clear();
      this.initShapePath(pathJson);
      this.pathJsonIndex++;
    } else {
      this.isComplete = true;
      this.pop.active = true;
      (cc.tween(this.pop) as cc.Tween).to(1, { opacity: 255 }).start();
    }
  }

  /** 初始化绘画组件 */
  initCtx() {
    if (!this.shapeCtx || !this.lineCtx) {
      throw new Error('缺少绘画组件');
    }
    this.lineCtx.lineJoin = this.shapeCtx.lineJoin = cc.Graphics.LineJoin.ROUND;
    this.lineCtx.lineCap = this.shapeCtx.lineCap = cc.Graphics.LineCap.ROUND;
    // this.lineCtx.lineWidth = this.shapeCtx.lineWidth = 1;
    this.lineCtx.lineWidth = this.shapeCtx.lineWidth = 40;
    this.shapeCtx.strokeColor = cc.color(190, 190, 190);
    this.lineCtx.strokeColor = cc.color(43, 94, 241);
  }

  /** 初始化路径 */
  initShapePath(pathJson: cc.JsonAsset) {
    if (!pathJson) {
      return;
    }

    this.path = pathJson.json;
    this.shapeCtx.clear();
    this.shapeCtx.moveTo(this.path.points[0].x, this.path.points[0].y);

    this.finger.active = true;
    this.finger.setPosition(this.path.points[0].x, this.path.points[0].y);

    this.path.points.forEach((pathPoint, index) => {
      const point = { value: pathPoint, index: this.points.length };

      this.maxDistance = Math.max(this.maxDistance, pathPoint.length);
      this.minDistance = pathPoint.length ? Math.min(this.minDistance, pathPoint.length) : this.minDistance;

      // 微分法分割出来的路径在接近目标点时会出现数值极其相近的情况，需要将数值跟目标点极其相近的点剔除掉。
      if (pathPoint.length !== 0 && index !== this.path.points.length - 1) {
        const prePathPoint = this.path.points[index - 1 < 0 ? this.path.points.length - 1 : index - 1];
        const nexPathtPoint = this.path.points[(index + 1) % this.path.points.length];
        const preDistance = cc.v2(prePathPoint.x, prePathPoint.y).sub(cc.v2(pathPoint.x, pathPoint.y)).len();
        const nextDistance = cc.v2(nexPathtPoint.x, nexPathtPoint.y).sub(cc.v2(pathPoint.x, pathPoint.y)).len();
        if (preDistance >= 0.0000001 && nextDistance >= 0.0000001) {
          this.points.push(point);
          this.shapeCtx.lineTo(pathPoint.x, pathPoint.y);
          this.shapeCtx.stroke();
          this.shapeCtx.moveTo(pathPoint.x, pathPoint.y);
        }
      } else {
        // 距上一个点距离为0意味着该点为目标点
        // if (!this.pointsMap.has(`${pathPoint.originX}_${pathPoint.originY}`)) {
        //   this.targetPoints.add(point);
        //   this.points.push(point);
        //   this.pointsMap.set(`${pathPoint.originX}_${pathPoint.originY}`, point);
        //   this.shapeCtx.lineTo(pathPoint.x, pathPoint.y);
        //   this.shapeCtx.stroke();
        //   this.shapeCtx.moveTo(pathPoint.x, pathPoint.y);
        // }

        this.targetPoints.add(point);
        this.points.push(point);
        this.shapeCtx.lineTo(pathPoint.x, pathPoint.y);
        this.shapeCtx.stroke();
        this.shapeCtx.moveTo(pathPoint.x, pathPoint.y);
      }

      if (!this.bezierPointsMap.has(point.value.bezier.str)) {
        this.bezierPointsMap.set(point.value.bezier.str, [point]);
      } else {
        this.bezierPointsMap.get(point.value.bezier.str).push(point);
      }
    });
    console.log(this.bezierPointsMap);

    this.maxDistance = this.maxDistance * 2;

    // 手指
    const fingerTween = cc.tween(this.finger) as cc.Tween;
    const fingetMoveLength = Math.floor(this.points.length / 2);
    for (let i = 0; i < fingetMoveLength; i++) {
      const point = this.points[i];
      const tween = cc.tween().to(0.03, { position: cc.v2(point.value.x, point.value.y) });
      fingerTween.then(tween);
    }
    fingerTween
      .to(0.5, { position: cc.v2(this.path.points[0].x, this.path.points[0].y) })
      .union()
      .repeatForever()
      .start();
  }

  /** 获取离触摸点最近的目标点 */
  getNearestPoint(pos: cc.Vec2) {
    let res: gi.Point = Array.from(this.targetPoints)[0];
    this.targetPoints.forEach(point => {
      const minDistance = cc.v2(res.value.x, res.value.y).sub(pos).len();
      const curDistance = cc.v2(point.value.x, point.value.y).sub(pos).len();
      if (curDistance < minDistance) res = point;
    });
    return res;
  }
}
