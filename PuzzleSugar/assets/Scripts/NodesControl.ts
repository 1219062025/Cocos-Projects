import CellAreaControl from './CellAreaControl';
import { InitiaRowCount, InitiaColCount, InitiaTileCount, Tile, Category, TileType } from './Config/Game';
import { InRange, flat } from './CommonScripts/Utils';
import TileControl from './TileControl';
import EventManager from './CommonScripts/EventManager';

export default class NodesControl {
  static CellArea: CellAreaControl;

  private static _NodesControl: NodesControl;
  public static get NodesControl() {
    if (this._NodesControl === null) {
      this._NodesControl = new NodesControl(this.CellArea);
    }
    return this._NodesControl;
  }

  /** 存储被标记过的TileNode的队列 */
  MarkersQueue: cc.Node[] = [];

  constructor(CellArea: CellAreaControl) {
    NodesControl.CellArea = CellArea;
  }

  /** 从传入的起点TileNode开始标记满足消除条件的所有TileNode后进行消除 */
  MarkersWithEliminate(TileNode: cc.Node) {
    const Tile = TileNode.getComponent(TileControl);
    const TileInfo = TileType.get(Tile.type);
    if (TileInfo.category === Category.BaseTile) {
      this.MarkersBaseEliminate(TileNode);
    } else if (TileInfo.category === Category.HorizontalTile) {
      this.MarkersRayEliminate(TileNode, TileInfo.category);
    } else if (TileInfo.category === Category.VerticalTile) {
      this.MarkersRayEliminate(TileNode, TileInfo.category);
    } else if (TileInfo.category === Category.ColorTile) {
      this.MarkersAlikeEliminate(TileNode);
    }
    this.Eliminate();
  }

  /** 触摸BaseTile Node时标记满足消除条件的TileNode */
  MarkersBaseEliminate(TileNode: cc.Node) {
    const Tile = TileNode.getComponent(TileControl);
    this.DFSTileNode(TileNode, Tile.type);
  }

  /** 触摸HorizontalTile Node、VerticalTile Node时标记满足消除条件的TileNode */
  MarkersRayEliminate(TileNode: cc.Node, direction: Category.HorizontalTile | Category.VerticalTile) {
    /** 增量 */
    let inc = 1;
    const { row, col } = TileNode.getComponent(TileControl);
    const CellArea = NodesControl.CellArea;
    this.MarkersQueue.push(TileNode);

    /** 检查水平方向的匹配情况 */
    if (direction === Category.HorizontalTile) {
      // 只要不是说两个方向都超出边界那就继续检查匹配情况，至于某个方向超出边界后如何处理的问题放到循环体内部搞定
      while (InRange(col - inc, 0, InitiaColCount - 1) || InRange(col + inc, 0, InitiaColCount - 1)) {
        // 只要负方向没超出边界就一直循环
        if (InRange(col - inc, 0, InitiaColCount - 1)) {
          const CurrentTileNode = CellArea.TileNodes[row][col - inc];
          CurrentTileNode.getComponent(TileControl).isTraversal = true;
          this.MarkersQueue.push(CurrentTileNode);
        }
        // 同上
        if (InRange(col + inc, 0, InitiaColCount - 1)) {
          const CurrentTileNode = CellArea.TileNodes[row][col + inc];
          CurrentTileNode.getComponent(TileControl).isTraversal = true;
          this.MarkersQueue.push(CurrentTileNode);
        }
        inc++;
      }
    }
    /** 检查垂直方向的匹配情况 */
    if (direction === Category.VerticalTile) {
      while (InRange(row - inc, 0, InitiaRowCount - 1) || InRange(row + inc, 0, InitiaRowCount - 1)) {
        if (InRange(row - inc, 0, InitiaRowCount - 1)) {
          const CurrentTileNode = CellArea.TileNodes[row - inc][col];
          CurrentTileNode.getComponent(TileControl).isTraversal = true;
          this.MarkersQueue.push(CurrentTileNode);
        }
        if (InRange(row + inc, 0, InitiaRowCount - 1)) {
          const CurrentTileNode = CellArea.TileNodes[row + inc][col];
          CurrentTileNode.getComponent(TileControl).isTraversal = true;
          this.MarkersQueue.push(CurrentTileNode);
        }
        inc++;
      }
    }
  }

  /** 触摸ColorTile Node时标记满足消除条件的TileNode */
  MarkersAlikeEliminate(TileNode: cc.Node) {
    const Tile = TileNode.getComponent(TileControl);
    const CellArea = NodesControl.CellArea;
    this.MarkersQueue.push(TileNode);

    const ExistentAllType: number[] = [];
    /** 场上所有的TileNode Type */
    CellArea.TileNodeMap.forEach(CurrentTileNode => {
      const CurrentTile = CurrentTileNode.getComponent(TileControl);
      const CurrentTileInfo = TileType.get(CurrentTile.type);
      if (CurrentTileInfo.category === Category.BaseTile) {
        ExistentAllType.push(CurrentTile.type);
      }
    });

    /** 去重 */
    const ExistentType = Array.from(new Set([...ExistentAllType]));

    /** 随机取得一种类型的BaseTile */
    const TargetType = ExistentType[Math.floor(Math.random() * ExistentType.length)];

    CellArea.TileNodeMap.forEach(CurrentTileNode => {
      const CurrentTile = CurrentTileNode.getComponent(TileControl);
      if (CurrentTile.type === TargetType) {
        CurrentTile.isTraversal = true;
        this.MarkersQueue.push(CurrentTileNode);
      }
    });
  }

  /** 深度优先遍历从起点开始所有连接在一起的TileNode */
  DFSTileNode(StartTileNode: cc.Node, TraversalType: number) {
    const CellArea = NodesControl.CellArea;
    const StartTile = StartTileNode.getComponent(TileControl);

    // 不是目标type的TileNode
    if (StartTile.type !== TraversalType) return;
    // 被遍历过的就不再遍历
    if (StartTile.isTraversal) return;
    const { row, col } = StartTile;
    StartTile.isTraversal = true;
    this.MarkersQueue.push(StartTileNode);
    // 按上、右、下、左的顺序深度优先递归遍历
    if (row > 0) {
      this.DFSTileNode(CellArea.TileNodes[row - 1][col], TraversalType);
    }
    if (col < InitiaColCount - 1) {
      this.DFSTileNode(CellArea.TileNodes[row][col + 1], TraversalType);
    }
    if (row < InitiaRowCount - 1) {
      this.DFSTileNode(CellArea.TileNodes[row + 1][col], TraversalType);
    }
    if (col > 0) {
      this.DFSTileNode(CellArea.TileNodes[row][col - 1], TraversalType);
    }
    /** 不满足消除条件，重置起点TileNode状态 */
    if (this.MarkersQueue.length === 1) {
      StartTile.isTraversal = false;
      StartTile.Shake();
      this.MarkersQueue.shift();
    }
  }

  /** 消除 */
  async Eliminate() {
    const CellArea = NodesControl.CellArea;
    if (this.MarkersQueue.length) {
      /** 被消除的TileNode */
      const EliminatedNodes = [];
      while (this.MarkersQueue.length) {
        const TileNode = this.MarkersQueue.shift();
        const Tile = TileNode.getComponent(TileControl);
        CellArea.TileNodes[Tile.row][Tile.col] = null;
        CellArea.TileNodeMap.delete(Tile.id);
        EliminatedNodes.push(TileNode);
        Tile.Remove();
      }
      EventManager.emit('Eliminated');
      await this.Collapse(EliminatedNodes);
      await this.FillBlank();
    }
    CellArea.inAction = false;
  }

  /** TileNode被消除时，其上所有TileNode往下落，总体逻辑就是：先找到被消除TileNode所处列最低的落点，然后从自己开始往上遍历将所有TileNode下落 */
  Collapse(matchNodes: cc.Node[]) {
    const CellArea = NodesControl.CellArea;
    const FallToPromises: Promise<void>[] = [];
    matchNodes.forEach(TileNode => {
      const Tile = TileNode.getComponent(TileControl);
      /** 在执行Collapse，所有匹配消除的TileNode都已经从TileNodes里面Remove掉了，如果这里发现还不为null的话。
       * 意味着这一列已经完成了Collapse操作，此时这个位置是原本上层的TileNode下落后填补的。那就不需要再往下走了
       */
      if (CellArea.TileNodes[Tile.row][Tile.col] !== null) return;

      /** 当前TileNode所处列应该下落到的最低点的行数 */
      let collapseRow = Tile.row;
      while (collapseRow + 1 <= InitiaRowCount - 1) {
        if (CellArea.TileNodes[collapseRow + 1][Tile.col] !== null && CellArea.TileNodes[collapseRow][Tile.col] === null) {
          break;
        }
        collapseRow++;
      }

      /** 用来遍历上层的TileNode */
      let riseRow = Tile.row;
      while (--riseRow >= 0) {
        // 如果找到了不为null的TileNode，也就意味着这个TileNode需要下落到当前最低点的行数
        if (CellArea.TileNodes[riseRow][Tile.col] !== null) {
          const CollapseTileNode = CellArea.TileNodes[riseRow][Tile.col];
          const CollapseTile = CollapseTileNode.getComponent(TileControl);

          // 播放下落动画
          FallToPromises.push(CollapseTile.FallTo(collapseRow, Tile.col));
          // 下落完成后改变行数
          CollapseTile.row = collapseRow;
          // 将下落前所处的位置，置null
          CellArea.TileNodes[riseRow][Tile.col] = null;
          // 然后设置到新的位置
          CellArea.TileNodes[collapseRow][Tile.col] = CollapseTileNode;
          // 最低点行数得往上一行了
          collapseRow--;
        }
      }
    });
    return Promise.all(FallToPromises);
  }

  /** 完成消除操作后填充空白 */
  FillBlank() {
    const CellArea = NodesControl.CellArea;
    const GenerateTileNodes: number[][] = [];
    CellArea.TileNodes.forEach((rowTileNodes, row) => {
      rowTileNodes.forEach((TileNode, col) => {
        if (GenerateTileNodes[row] === undefined) GenerateTileNodes[row] = [];
        if (TileNode !== null) {
          GenerateTileNodes[row][col] = 0;
        } else {
          let type = -Infinity;
          if (Math.random() < 0.95) {
            type = Math.floor(Math.random() * 6 + 1);
          } else {
            type = Math.floor(Math.random() * 3 + 7);
          }
          GenerateTileNodes[row][col] = type;
        }
      });
    });
    return CellArea.GenerateTiles(GenerateTileNodes);
  }
}
