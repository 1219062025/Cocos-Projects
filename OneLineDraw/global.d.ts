/** 全局命名空间 */
declare namespace gi {
  /** 路径 */
  interface Path {
    /** 路径总长度 */
    length: number;
    /** 点坐标 */
    points: PathPoint[];
    time: number;
  }

  /** 路径点 */
  interface PathPoint {
    id?: number;
    x: number;
    y: number;
    /** 上一个点到该店的距离，如果该点是一段路径的起点时为0，路径有多个控制点，每个控制点都看作到达下一个控制点前路径的起点 */
    length: number;
    time: number;
  }

  /** 点 */
  interface Point {
    value: PathPoint;
    index: number;
  }

  interface Line {
    id?: number;
    from: Point;
    to: Point;
  }
}
