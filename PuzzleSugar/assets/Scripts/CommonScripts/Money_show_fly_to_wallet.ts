import { DotsEnum } from './DotsEnum';
import EventManager from './EventManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MoneyShowFlyToWallet extends cc.Component {
  @property(cc.Node)
  startPoint: cc.Node = null;

  @property(cc.Node)
  endPoint: cc.Node = null;

  @property(cc.Prefab)
  coinPrefab: cc.Prefab = null;

  coinPool: cc.NodePool = null;

  onLoad() {
    this.coinPool = new cc.NodePool();
    // 初始化金币节点池
    this.initCoinPool();
    // 监听事件
    // EventManager.once(CustomEventTypeV3.MoneyShowAndFlyToWallet, this.playAnim, this)
    EventManager.on(DotsEnum.DestoryDotsEvent, this.playAnim, this);
  }

  initCoinPool(count: number = 20) {
    // 向节点池中添加金币20枚
    for (let i = 0; i < count; i++) {
      let coin = cc.instantiate(this.coinPrefab);
      this.coinPool.put(coin);
    }
  }

  // 按钮调用该函数
  playAnim() {
    // 生成10到15的随机数
    // let randomCount = Math.random() * 20 + 15;
    let randomCount = 20;
    // 获取开始点和结束点在父节点坐标系中的坐标
    // let stPos = this.startPoint.getPosition();
    let stPos = this.startPoint.parent.convertToWorldSpaceAR(new cc.Vec2(this.startPoint.x, this.startPoint.y));
    // let edPos = this.endPoint.getPosition();
    let edPos = this.endPoint.parent.convertToWorldSpaceAR(new cc.Vec2(this.endPoint.x, this.endPoint.y));

    // 播放金币飞入钱包的动画
    this.playCoinFlyAnim(randomCount, stPos, edPos);
  }

  playCoinFlyAnim(count: number, stPos: cc.Vec2, edPos: cc.Vec2, r: number = 130) {
    // 确保当前节点池有足够的金币
    // size():获取当前缓冲池的可用对象数量
    const poolSize = this.coinPool.size();
    const reCreateCoinCount = poolSize > count ? 0 : count - poolSize;
    // 金币对象池中没有足够的金币，则需要创建剩下所需金币
    this.initCoinPool(reCreateCoinCount);

    // 生成圆，并且对圆上的点进行排序
    let points = this.getCirclePoints(r, stPos, count);
    let coinNodeList = points.map(pos => {
      let coin = this.coinPool.get();
      coin.setPosition(stPos);
      this.node.addChild(coin);
      return {
        node: coin,
        stPos: stPos,
        mdPos: pos,
        edPos: edPos,
        // sub():返回两个向量的差值 ， mag():返回向量的长度
        dis: (pos as any).sub(edPos).mag()
      };
    });
    // 排序
    coinNodeList = coinNodeList.sort((a, b) => {
      if (a.dis - b.dis > 0) return 1;
      if (a.dis - b.dis < 0) return -1;
      return 0;
    });

    // 执行金币落袋的动画
    coinNodeList.forEach((item, idx) => {
      item.node.runAction(
        cc.sequence(
          cc.moveTo(0.3, item.mdPos),
          cc.delayTime(idx * 0.01),
          cc.moveTo(0.5, item.edPos),
          cc.callFunc(() => {
            this.coinPool.put(item.node);
          })
        )
      );
    });
  }

  /**
   * 以某点为圆心，生成圆周上等分点的坐标
   *
   * @param {number} r 半径
   * @param {cc.Vec2} pos 圆心坐标
   * @param {number} count 等分点数量
   * @param {number} [randomScope=80] 等分点的随机波动范围
   * @returns {cc.Vec2[]} 返回等分点坐标
   */
  getCirclePoints(r: number, pos: cc.Vec2, count: number, randomScope: number = 60): cc.Vec2[] {
    let points = [];
    //     ↓   角度转弧度：2π / 360  = π / 180 ≈ 0.0174rad, 即: 度数 * (π / 180） = 弧度
    let radians = (Math.PI / 180) * Math.round(360 / count); //360/8=45
    for (let i = 0; i < count; i++) {
      // 为什么是sin求x而不是con求x？
      let x = pos.x + r * Math.sin(radians * i);
      let y = pos.y + r * Math.cos(radians * i);
      points.unshift(cc.v3(x + Math.random() * randomScope, y + Math.random() * randomScope, 0));
    }
    return points;
  }
}
