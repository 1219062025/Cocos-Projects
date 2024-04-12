const { ccclass, property } = cc._decorator;
import { GameAreaWidth, GameAreaHeight, TileWidth, TileHeight, InitiaRowCount, InitiaColCount, SwapSite, TouchPos } from './Config/Game';
import TileControl from './TileControl';
import Level from './Config/Level';
import { InRange, flat, debounce } from './Common/Utils';
import EventManager from './Common/EventManager';

@ccclass
export default class CellAreaControl extends cc.Component {
  @property(cc.Prefab)
  TilePrefab: cc.Prefab = null;

  /** 所有TileNode */
  TileNodes: cc.Node[][] = [];
  /** 所有TileNode根据id的映射*/
  TileNodeMap: Map<number, cc.Node> = new Map([]);
  /** 存储要进行交换的TileNode */
  SwapSite: SwapSite = new SwapSite();
  /** 存储触摸相关信息 */
  TouchPos: TouchPos = new TouchPos();
  /** 是否通过了交换申请，处于交换动作中 */
  inSwap: boolean = false;
  /** 匹配消除的数组中所有节点的行、列 */
  MatchNodePos: number[][] = [];
  FillBlankNodePos: number[][] = [];
  isOpen: boolean = true;

  /** 初始化 */
  Init() {
    this.onFallToTween();
    this.GenerateTiles(Level.Level1);
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  /** 触摸开始 */
  onTouchStart(event: cc.Event.EventTouch) {
    if (!this.isOpen) return;
    // 查找触摸位置处有没有节点，有的话拿到它进行后续操作
    const TileNode = flat<cc.Node>(this.TileNodes).find(TileNode => {
      return this.TouchTileNodeArea(event, TileNode);
    });
    if (TileNode) {
      // 存储触摸开始的位置
      this.TouchPos.BeginTouch(event.getLocation());
      // 存储申请交换的TileNode
      this.SwapSite.apply = TileNode;
      // 可以开始监听触摸移动了
      this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }
    event.stopPropagation();
  }

  /** 触摸移动中 */
  async onTouchMove(event: cc.Event.EventTouch) {
    if (!this.isOpen) return;
    const tagetVector = this.TouchPos.TouchMove(event.getLocation());
    if (tagetVector) {
      /** 是否通过了交换申请 */
      const applySuccessful = this.ApplySwap(tagetVector);
      if (applySuccessful) {
        this.isOpen = false;
        const { apply, target } = this.SwapSite;
        const applyTile = apply.getComponent(TileControl);
        const targetTile = target.getComponent(TileControl);
        // 交换位置
        await this.Swap(apply, target, tagetVector);
        // 检查消除
        const isEliminated = await this.InspectAndEliminate([
          [applyTile.row, applyTile.col],
          [targetTile.row, targetTile.col]
        ]);
        if (isEliminated) return;
        await this.Swap(apply, target, tagetVector.neg());
        this.isOpen = true;
        this.Reset();
      }
    }
  }

  /** 触摸结束后 */
  onTouchEnd(event: cc.Event.EventTouch) {
    this.Reset();
  }

  /** 申请进行交换，如果通过的话做一些预处理 */
  ApplySwap(tagetVector: cc.Vec2): boolean {
    const Tile = this.SwapSite.apply.getComponent(TileControl);
    const targetRow = Tile.row - tagetVector.y;
    const targetCol = Tile.col + tagetVector.x;
    // 判断交换的目标行、列会不会超出边界
    if (!InRange(targetRow, 0, InitiaRowCount - 1) || !InRange(targetCol, 0, InitiaColCount - 1)) {
      this.isOpen = true;
      this.Reset();
      return false;
    }
    // 存储交换目标的TileNode和指向其的单位向量
    this.SwapSite.tagetVector = tagetVector;
    this.SwapSite.target = this.TileNodes[targetRow][targetCol];
    return true;
  }

  /** 交换 */
  async Swap(from: cc.Node, to: cc.Node, tagetVector: cc.Vec2) {
    const fromTile = from.getComponent(TileControl);
    const toTile = to.getComponent(TileControl);
    await Promise.all([fromTile.SwapTo(tagetVector), toTile.SwapTo(tagetVector.neg())]);
    this.SwapNodeInMap(from, to);
  }

  /** 检查指定行、列能否产生消除，如果可以则进行消除操作 */
  async InspectAndEliminate(PosArray: number[][]) {
    /** 匹配消除的节点数组 */
    let matchNodes: cc.Node[] = [];
    for (let [row, col] of PosArray) {
      const horizontalMatch = this.Inspect({ row, col }, 'horizontal');
      const verticalMatch = this.Inspect({ row, col }, 'vertical');
      matchNodes = matchNodes.concat(horizontalMatch, verticalMatch);
    }
    /** 如果matchNodes数组是空的意味着没有达成消除的条件 */
    if (matchNodes.length === 0) return false;
    this.Eliminate(matchNodes);
    const CollapseNodes = await this.Collapse(matchNodes);
    const FillBlankNodePos = await this.FillBlank();
    const EditNodePos = [...CollapseNodes, ...FillBlankNodePos];
    if (EditNodePos.length > 0) {
      const intervalId = setInterval(async () => {
        if (this.isOpen) {
          clearInterval(intervalId);
          await this.InspectAndEliminate(EditNodePos);
        }
      });
    }
    return true;
  }

  /** 检查是否可以产生消除 */
  Inspect({ row, col }: { row: number; col: number }, direction: 'horizontal' | 'vertical') {
    /** 增量 */
    let inc = 1;
    /** 匹配的TileNode数组 */
    const matchNodes = [];
    /** 当前位置的TileNode */
    const currentTileNode = this.TileNodes[row][col];
    const currentTile = currentTileNode.getComponent(TileControl);
    /** 自身肯定是匹配的 */
    matchNodes.push(currentTileNode);
    /** 负方向是否需要继续匹配 */
    let NegMatch = true;
    /** 正方向是否需要继续匹配 */
    let PosMatch = true;

    /** 检查水平方向的匹配情况 */
    if (direction === 'horizontal') {
      // 只要不是说两个方向都超出边界那就继续检查匹配情况，至于某个方向超出边界后如何处理的问题放到循环体内部搞定
      while (InRange(col - inc, 0, InitiaColCount - 1) || InRange(col + inc, 0, InitiaColCount - 1)) {
        // 只要负方向没超出边界并且有匹配的元素就一直循环
        if (NegMatch && InRange(col - inc, 0, InitiaColCount - 1)) {
          const isMatch = this.TileNodes[row][col - inc].getComponent(TileControl).type === currentTile.type;
          isMatch ? matchNodes.push(this.TileNodes[row][col - inc]) : (NegMatch = false);
        }
        // 同上
        if (PosMatch && InRange(col + inc, 0, InitiaColCount - 1)) {
          const isMatch = this.TileNodes[row][col + inc].getComponent(TileControl).type === currentTile.type;
          isMatch ? matchNodes.push(this.TileNodes[row][col + inc]) : (PosMatch = false);
        }
        inc++;
      }
    }

    /** 检查垂直方向的匹配情况 */
    if (direction === 'vertical') {
      while (InRange(row - inc, 0, InitiaRowCount - 1) || InRange(row + inc, 0, InitiaRowCount - 1)) {
        if (NegMatch && InRange(row - inc, 0, InitiaRowCount - 1)) {
          const isMatch = this.TileNodes[row - inc][col].getComponent(TileControl).type === currentTile.type;
          isMatch ? matchNodes.push(this.TileNodes[row - inc][col]) : (NegMatch = false);
        }
        if (PosMatch && InRange(row + inc, 0, InitiaRowCount - 1)) {
          const isMatch = this.TileNodes[row + inc][col].getComponent(TileControl).type === currentTile.type;
          isMatch ? matchNodes.push(this.TileNodes[row + inc][col]) : (PosMatch = false);
        }
        inc++;
      }
    }
    return matchNodes.length >= 3 ? matchNodes : [];
  }

  /** 消除 */
  Eliminate(matchNodes: cc.Node[]) {
    this.MatchNodePos = [];
    matchNodes.forEach((TileNode, index) => {
      const Tile = TileNode.getComponent(TileControl);
      Tile.Remove();
      this.TileNodes[Tile.row][Tile.col] = null;
      this.MatchNodePos.push([Tile.row, Tile.col]);
    });
  }

  /** TileNode被消除时，其上所有TileNode往下落，总体逻辑就是：先找到被消除TileNode所处列最低的落点，然后从自己开始往上遍历将所有TileNode下落 */
  async Collapse(matchNodes: cc.Node[]) {
    const CollapseNodes: number[][] = [];
    const FallToPromises: Promise<void>[] = [];
    matchNodes.forEach(TileNode => {
      const Tile = TileNode.getComponent(TileControl);
      /** 在执行Collapse，所有匹配消除的TileNode都已经从TileNodes里面Remove掉了，如果这里发现还不为null的话。
       * 意味着这一列已经完成了Collapse操作，此时这个位置是原本上层的TileNode下落后填补的。那就不需要再往下走了
       */
      if (this.TileNodes[Tile.row][Tile.col] !== null) return;

      /** 当前TileNode所处列应该下落到的最低点的行数 */
      let collapseRow = Tile.row;
      while (collapseRow + 1 <= InitiaRowCount - 1) {
        if (this.TileNodes[collapseRow + 1][Tile.col] !== null && this.TileNodes[collapseRow][Tile.col] === null) {
          break;
        }
        collapseRow++;
      }

      /** 用来遍历上层的TileNode */
      let riseRow = Tile.row;
      while (--riseRow >= 0) {
        // 如果找到了不为null的TileNode，也就意味着这个TileNode需要下落到当前最低点的行数
        if (this.TileNodes[riseRow][Tile.col] !== null) {
          const CollapseTileNode = this.TileNodes[riseRow][Tile.col];
          const CollapseTile = CollapseTileNode.getComponent(TileControl);

          // 播放下落动画
          FallToPromises.push(CollapseTile.FallTo(collapseRow, Tile.col));
          // 下落完成后改变行数
          CollapseTile.row = collapseRow;
          // 将下落前所处的位置，置null
          this.TileNodes[riseRow][Tile.col] = null;
          // 然后设置到新的位置
          this.TileNodes[collapseRow][Tile.col] = CollapseTileNode;
          // 存储被修改过的节点行、列
          CollapseNodes.push([collapseRow, Tile.col]);
          // 最低点行数得往上一行了
          collapseRow--;
        }
      }
    });
    await Promise.all(FallToPromises);
    return CollapseNodes;
  }

  /** 完成消除操作后填充空白 */
  async FillBlank() {
    const GenerateTileNodes: number[][] = [];
    const FillBlankNodePos: number[][] = [];
    this.TileNodes.forEach((rowTileNodes, row) => {
      rowTileNodes.forEach((TileNode, col) => {
        if (GenerateTileNodes[row] === undefined) GenerateTileNodes[row] = [];
        if (TileNode !== null) {
          GenerateTileNodes[row][col] = 0;
        } else {
          GenerateTileNodes[row][col] = Math.floor(Math.random() * 3 + 1);
          // 存储被修改过的节点行、列
          FillBlankNodePos.push([row, col]);
        }
      });
    });
    await Promise.all(this.GenerateTiles(GenerateTileNodes));
    return FillBlankNodePos;
  }

  /** 重置状态 */
  Reset() {
    this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.SwapSite.clear();
    this.TouchPos.clear();
  }

  /** 监听此时是否有元素处于FallTo缓动动画中 */
  onFallToTween() {
    let falltoCount = 0;
    EventManager.on(
      'SignIn',
      () => {
        falltoCount++;
        this.isOpen = false;
      },
      this
    );
    EventManager.on(
      'SignOut',
      ([row, col]) => {
        if (--falltoCount === 0) {
          this.isOpen = true;
        }
      },
      this
    );
  }

  /** 交换两个TileNode在映射中的位置 */
  SwapNodeInMap(from: cc.Node, to: cc.Node) {
    const fromTile = from.getComponent(TileControl);
    const toTile = to.getComponent(TileControl);
    const { row: fromRow, col: fromCol } = fromTile;
    const { row: toRow, col: toCol } = toTile;
    this.TileNodes[fromRow][fromCol] = to;
    this.TileNodes[toRow][toCol] = from;
    fromTile.row = toRow;
    fromTile.col = toCol;
    toTile.row = fromRow;
    toTile.col = fromCol;
  }

  /** 根据传入的二维number类型数组生成Tile */
  GenerateTiles(Map: number[][]): Promise<void>[] {
    const FallToPromises: Promise<void>[] = [];
    // if (Map.length > InitiaRowCount) return '超出行数，不予生成';
    Map.forEach((rowTiles, row) => {
      rowTiles.forEach((type, col) => {
        // if (col + 1 > InitiaColCount) return '超出列数，不予生成';
        // type为0意味着这个位置不应该生成Tile
        if (type === 0) return;
        const TileNode = cc.instantiate(this.TilePrefab);
        const Tile = TileNode.getComponent(TileControl);
        Tile.Init(type, row, col, this.node);
        FallToPromises.push(Tile.FallTo(row, col, true));
        if (this.TileNodes[row] === undefined) this.TileNodes[row] = [];
        this.TileNodes[row][col] = TileNode;
        this.TileNodeMap.set(Tile.id, TileNode);
      });
    });
    return FallToPromises;
  }

  /** 判断触摸位置是否在某个TileNode节点区域内 */
  TouchTileNodeArea(event: cc.Event.EventTouch, node: cc.Node) {
    if (node === null) return;
    // 获取触摸点在世界坐标系中的位置
    const touchPos = event.getLocation();
    // 获取节点在世界坐标系中的包围盒
    const boundingBox = node.getBoundingBoxToWorld();
    // 判断触摸点是否在节点的区域内
    if (boundingBox.contains(touchPos)) return true;
  }

  /** 获取指定行、列的TileNode的位置 */
  GetTilePos(row, col): cc.Vec2 {
    const BeginX = this.node.x - this.node.width / 2 + TileWidth / 2;
    const BeginY = this.node.y + this.node.height / 2 - TileHeight / 2;
    const targetX = BeginX + col * TileWidth;
    const targetY = BeginY - row * TileHeight;
    return cc.v2(targetX, targetY);
  }

  /** 打印当前节点布局 */
  LogMap() {
    let map = '';
    this.TileNodes.forEach((rowTileNodes, row) => {
      rowTileNodes.forEach((TileNode, col) => {
        const Tab = TileNode ? TileNode.getComponent(TileControl).type : 'n';
        map += `${Tab}${col < InitiaColCount - 1 ? ' ' : '\n'}`;
      });
    });
    console.log(map);
  }
}
