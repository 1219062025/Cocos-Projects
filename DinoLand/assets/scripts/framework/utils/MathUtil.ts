import { toDegree, v2, Vec2, Vec3 } from 'cc';

export class MathUtil {
  /**
   * 角度转弧度
   */
  public static deg2Rad: number = Math.PI / 180;

  /**
   * 弧度转角度
   */
  public static rad2Deg: number = 180 / Math.PI;

  /**
   * 获得随机方向
   */
  public static sign(x: number) {
    if (x > 0) {
      return 1;
    }
    if (x < 0) {
      return -1;
    }
    return 0;
  }

  /** 随时间变化进度值 */
  public static progress(start: number, end: number, t: number) {
    return start + (end - start) * t;
  }

  /**
   * 插值
   * @param numStart
   * @param numEnd
   * @param t
   */
  public static lerp(numStart: number, numEnd: number, t: number): number {
    if (t > 1) t = 1;
    else if (t < 0) t = 0;
    return numStart * (1 - t) + numEnd * t;
  }

  /**
   *
   * @param angle1 角度插值
   * @param angle2
   * @param t
   */
  public static lerpAngle(current: number, target: number, t: number): number {
    current %= 360;
    target %= 360;

    var dAngle: number = target - current;

    if (dAngle > 180) target = current - (360 - dAngle);
    else if (dAngle < -180) target = current + (360 + dAngle);

    return ((MathUtil.lerp(current, target, t) % 360) + 360) % 360;
  }

  /**
   * 按一定的速度从一个角度转向令一个角度
   * @param current
   * @param target
   * @param speed
   */
  public static angleTowards(current: number, target: number, speed: number): number {
    current %= 360;
    target %= 360;

    var dAngle: number = target - current;

    if (dAngle > 180) target = current - (360 - dAngle);
    else if (dAngle < -180) target = current + (360 + dAngle);

    var dir = target - current;

    if (speed > Math.abs(dir)) {
      return target;
    }

    return (((current + speed * Math.sign(dir)) % 360) + 360) % 360;
  }

  public static clamp(value: number, minLimit: number, maxLimit: number) {
    if (value < minLimit) {
      return minLimit;
    }

    if (value > maxLimit) {
      return maxLimit;
    }

    return value;
  }

  /**
   * 获得一个值的概率
   * @param value
   */
  public static probability(value: number) {
    return Math.random() < value;
  }

  /**
   * 判断某个点是否在扇形内
   * @param degree 扇形的弧度(角度)
   * @param radius 扇形的半径
   * @param startPos 角色所在的位置 扇形的圆心
   * @param forward 角色朝向 标准向量
   * @param targetPos 待判定的点位置
   * @return { "hit":boolean, "distance":number} [是否命中, 距离]
   */
  public static isPointFanShaped(degree: number, radius: number, startPos: Vec3, forward: Vec3, targetPos: Vec3): { hit: boolean; distance: number } {
    let _startPos: Vec2 = v2(startPos.x, startPos.z);
    let _forward: Vec2 = v2(forward.x, forward.z);
    let _targetPos: Vec2 = v2(targetPos.x, targetPos.z);

    let distance: number = Vec2.distance(_targetPos, _startPos);

    // 点到圆心距离大于半径 一定不在扇形范围内
    if (distance > radius) return { 'hit': false, 'distance': distance };

    // 圆心到检测点 OP向量
    let op: Vec2 = v2();
    Vec2.subtract(op, _targetPos, _startPos);

    // 在forward方向投影长度OP
    let projectionLength: number = Vec2.dot(_forward, op);
    if (projectionLength <= 0) return { 'hit': false, 'distance': distance };

    // 夹角度数
    let curDegree: number = toDegree(Math.cos(projectionLength / distance)) * 2;

    let hit: boolean = false;

    // 因为浮点有误差 两位以内看成相等的边界值情况
    if (Math.abs(curDegree - degree) < 0.01) hit = true;
    if (curDegree <= degree) hit = true;

    return { 'hit': hit, 'distance': distance };
  }

  /**
   * 两个整数间随机随机数
   * @min: 最小数
   * @max: 最大数
   */
  public static random(min: number, max: number): number {
    return Math.round(Math.random() * (max - min) + min);
  }
  /**
   * 两个整数间随机随机数,包含min和max
   * @min: 最小数
   * @max: 最大数
   */
  public static RandomNumBoth(Min: number, Max: number) {
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range); //四舍五入
    return num;
  }

  /**
   * 从probList概率表中抽取一个概率返回抽中的probList索引
   */
  public static randomProbability(probList: number[]): number {
    if (null == probList) probList = [];

    let sumProb: number = 0;

    for (let i = 0; i < probList.length; i++) {
      sumProb += probList[i];
    }

    for (let i = 0; i < probList.length; i++) {
      let randomValue: number = MathUtil.RandomNumBoth(0, sumProb);

      if (randomValue < probList[i]) {
        return i;
      } else {
        sumProb = sumProb - probList[i];
      }
    }

    let maxProbIndex = -1;
    let maxProbValue = 0;

    for (let i = 0; i < probList.length; i++) {
      if (maxProbValue < probList[i]) {
        maxProbValue = probList[i];
        maxProbIndex = i;
      }
    }

    return maxProbIndex;
  }

  //----------------------------------------------------------------
  // 随机打乱数组
  //----------------------------------------------------------------
  public static randArray(array: any) {
    for (let i = 0; i < array.length; i++) {
      let iRand = parseInt((array.length * Math.random()).toString());
      let temp = array[i];
      array[i] = array[iRand];
      array[iRand] = temp;
    }

    return array;
  }

  /**
   * 检测一个点是否在圆内
   * centerX centerY radius 圆心以及半径
   * x y需要判断的x y 坐标
   */
  // public static pointIsInRound(centerX: number, centerY: number, radius: number, x: number, y: number): boolean {
  //   return MathUtil.pow(centerX - x) + MathUtil.pow(centerY - y) < MathUtil.pow(radius);
  // }

  /**
   * 二分法从数组中找数据 indexOf
   */
  public static binary(find: number, arr: Array<number>, low: number, high: number): number {
    if (low <= high) {
      if (arr[low] == find) return low;
      if (arr[high] == find) return high;
      var mid = Math.ceil((high + low) / 2);
      if (arr[mid] == find) {
        return mid;
      } else if (arr[mid] > find) {
        return MathUtil.binary(find, arr, low, mid - 1);
      } else {
        return MathUtil.binary(find, arr, mid + 1, high);
      }
    }
    return -1;
  }
  /**
   * 获取字符串实际长度
   */
  public static getStrRealLength(str: string): number {
    var jmz = { GetLength: null };
    jmz.GetLength = function (str) {
      return Number(str.replace(/[\u0391-\uFFE5]/g, 'aa').length); //先把中文替换成两个字节的英文，在计算长度
    };
    return jmz.GetLength(str);
  }
}
