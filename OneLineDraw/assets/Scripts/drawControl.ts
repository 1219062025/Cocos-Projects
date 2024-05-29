const { ccclass, property } = cc._decorator;

@ccclass
export default class DrawControl extends cc.Component {
  /** 路径信息的JSON资源 */
  @property({ type: [cc.JsonAsset] })
  pathJson: cc.JsonAsset[] = [];

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

  /** 路径 */
  path: gi.Path = null;

  /** 所有点 */
  points: gi.Point[] = [];

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

  drawLength: number = 0;

  isComplete: boolean = false;

  _curPoint: gi.Point = null;
  /** 当前选中的路径点 */
  get curPoint() {
    return this._curPoint;
  }
  set curPoint(value) {
    this._curPoint = value;
    if (value !== null) {
      const pointsCount = this.points.length;
      const curIndex = this._curPoint.index;
      const preIndex = this._curPoint.index === 0 ? pointsCount - 1 : curIndex - 1;
      const nextIndex = (this._curPoint.index + 1) % pointsCount;
      this.prePoint = this.points[preIndex];
      this.nextPoint = this.points[nextIndex];
    }
  }
  prePoint: gi.Point = null;
  nextPoint: gi.Point = null;
  get toPreVec() {
    if (!this.prePoint) return null;
    const preVec = cc.v2(this.prePoint.value.x, this.prePoint.value.y);
    const curVec = cc.v2(this.curPoint.value.x, this.curPoint.value.y);
    return preVec.sub(curVec);
  }
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

      this.pencil.setPosition(this.curPoint.value.x, this.curPoint.value.y);
      this.pencil.active = true;
    }
  }

  onTouchMove(event: cc.Event.EventTouch) {
    if (this.curPoint && !this.isComplete) {
      /** 触点在上一次事件时的位置对象 */
      const preTouch = this.node.convertToNodeSpaceAR(event.getPreviousLocation());
      /** 触点位置 */
      const curTouch = this.node.convertToNodeSpaceAR(event.getLocation());
      /** 触摸移动方向上的下一个路径点 */
      const moveNextPoint = this.getMoveNextPoint(curTouch.sub(preTouch));
      if (moveNextPoint) {
        if (this.startPoint === moveNextPoint && this.visitedTargetPoints.size === this.targetPoints.size) {
          this.nextLevel();
          return;
        }
        if (!this.isVisitedTargetPoint(moveNextPoint) && !this.isVisitedPoint(moveNextPoint)) {
          // -------------画线以及处理画线后相关的状态更改---------------
          if (this.isTargetPoint(moveNextPoint)) this.visitedTargetPoints.add(moveNextPoint);
          const id = `${this.curPoint.index}->${moveNextPoint.index}`;
          this.draw(this.curPoint, moveNextPoint);
          this.visitedPoints.add(moveNextPoint);
          this.visitedLine.set(id, { to: moveNextPoint, from: this.curPoint });
          this.curPoint = moveNextPoint;
        } else if (!this.isVisitedTargetPoint(moveNextPoint) && !this.isVisitedTargetPoint(this.curPoint) && this.isVisitedPoint(moveNextPoint)) {
          // -----------擦除以及处理擦除后相关的状态更改-------------
          const id = `${moveNextPoint.index}->${this.curPoint.index}`;
          this.erase(id);
          this.visitedPoints.delete(this.curPoint);
          this.visitedLine.delete(id);
          this.curPoint = moveNextPoint;
        }
      }
    }
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
    const cosPre = toMoveVec.normalize().dot(this.toPreVec.normalize());
    const cosNext = toMoveVec.normalize().dot(this.toNextVec.normalize());
    if (Math.max(cosPre, cosNext) > 0.6) {
      return cosPre > cosNext ? this.prePoint : this.nextPoint;
    } else {
      return null;
    }
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
      // @ts-ignore
      linkToStore();
    }
  }

  /** 初始化绘画组件 */
  initCtx() {
    if (!this.shapeCtx || !this.lineCtx) {
      throw new Error('缺少绘画组件');
    }
    this.lineCtx.lineJoin = this.shapeCtx.lineJoin = cc.Graphics.LineJoin.ROUND;
    this.lineCtx.lineCap = this.shapeCtx.lineCap = cc.Graphics.LineCap.ROUND;
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
    console.log(this.path);

    this.path.points.forEach((pathPoint, index) => {
      const point = { value: pathPoint, index: this.points.length };
      if (pathPoint.length === 0) {
        this.targetPoints.add(point);
        // this.createTag(point);
      }

      this.points.push(point);
      this.shapeCtx.lineTo(pathPoint.x, pathPoint.y);
      this.shapeCtx.stroke();
      this.shapeCtx.moveTo(pathPoint.x, pathPoint.y);

      // 微分法分割出来的路径在接近目标点时会出现数值极其相近的情况，需要将数值跟目标点极其相近的点清除掉。
      if (pathPoint.length !== 0) {
        const prePathPoint = this.path.points[index - 1 < 0 ? this.path.points.length - 1 : index - 1];
        const nexPathtPoint = this.path.points[(index + 1) % this.path.points.length];
        const preDistance = cc.v2(prePathPoint.x, prePathPoint.y).sub(cc.v2(pathPoint.x, pathPoint.y)).len();
        const nextDistance = cc.v2(nexPathtPoint.x, nexPathtPoint.y).sub(cc.v2(pathPoint.x, pathPoint.y)).len();
        if (preDistance < 0.0000001 || nextDistance < 0.0000001) {
          this.points.pop();
        }
      }
    });
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

  createTag(point: gi.Point) {
    const node = new cc.Node('tag');
    const label = node.addComponent(cc.Label);
    label.string = `${point.index}`;
    label.fontSize = 46;
    node.color = cc.Color.RED;
    node.setParent(this.node);
    node.setPosition(point.value.x, point.value.y);
  }
}
