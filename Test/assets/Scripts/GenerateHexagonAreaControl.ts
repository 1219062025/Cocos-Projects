import FixedCellControl from './FixedCellControl';
import DragableBlocControl from './DragableBlockControl';
import FixedCellAreaControl from './FixedCellAreaControl';
import DragableBlockAreaControl from './DragableBlockAreaControl';
import { calculateBoundingBox, centerChildren } from './Utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GenerateHexagonCellAreaControl extends cc.Component {
  @property({ type: cc.Prefab, tooltip: '六边形节点的预制体' })
  hexagonPrefab: cc.Prefab = null;

  @property({ type: [cc.String], tooltip: '字符串类型数组: 每一个元素映射了每一行的六边形数量以及排布。1代表这个位置有六边形，0则相反。奇数行会自动往左偏移一定位置进行贴合' })
  rowHexagonCountString: string[] = [];

  @property({ tooltip: '是否是固定的六边形格子' })
  isFixedCell: boolean = false;

  /** 每个新创建出来的六边形，不管格子还是固定可拖动的方块都需要一个id */
  id = 0;

  /** 生成出来的格子或者方块用wrap节点包裹起来，然后将wrap节点设置到挂载了脚本组件的节点的中点位置 */
  wrap = new cc.Node('wrap');

  /** 六边形节点的宽度 */
  width = 0;

  /** 可拖动六边形随机颜色 */
  randomSpriteNum = Math.ceil(Math.random() * 12);

  onLoad() {
    this.generateArea();
  }

  /** 生成格子区域 */
  generateArea() {
    this.rowHexagonCountString.forEach((rowHexagons, row) => {
      for (let i = 0; i < rowHexagons.length; i++) {
        if (rowHexagons[i] === '1') {
          this.isFixedCell ? this.generateFixedCell(i, row) : this.generateDraggableBlock(i, row);
        }
      }
    });

    this.SetAreaCenter();
  }

  /** 生成固定格子 */
  generateFixedCell(i: number, row: number) {
    const hexagonNode = cc.instantiate(this.hexagonPrefab);
    // 需要减去一点黄色边框才能更好的贴合
    this.width = hexagonNode.width - 18;
    // 为每一个格子设置唯一id，该id只在它所属的wrap节点内唯一，用来检测碰撞距离
    hexagonNode.getComponent(FixedCellControl).id = this.id++;
    this.SetHexagonPosition(i, row, hexagonNode);
    this.node.getComponent(FixedCellAreaControl).count++;
    this.wrap.addChild(hexagonNode);
  }

  /** 生成可拖动方块 */
  generateDraggableBlock(i: number, row: number) {
    /** 随机选择一个六边形颜色 */
    const hexagonNode = cc.instantiate(this.hexagonPrefab);
    // 可拖动方块就不需要减去一点边框了
    this.width = hexagonNode.width;
    // 为每一个方块设置唯一id，该id只在它所属的wrap节点内唯一，用来检测碰撞距离
    hexagonNode.getComponent(DragableBlocControl).id = this.id++;
    // 如果是可拖动的六边形格子，那么赋予其一种颜色
    cc.loader.loadRes(`hexagon_${this.randomSpriteNum}`, cc.SpriteFrame, (err, res) => {
      hexagonNode.getComponent(cc.Sprite).spriteFrame = res;
    });
    this.SetHexagonPosition(i, row, hexagonNode);
    this.node.getComponent(DragableBlockAreaControl).count++;
    this.wrap.addChild(hexagonNode);
  }

  /** 设置生成出来的每一个方块应该在哪个位置 */
  SetHexagonPosition(i: number, row: number, hexagonNode: cc.Node) {
    // 计算每个六边形格子x轴的位置
    const evenRowOffsetX = i * this.width; // 偶数行的六边形格子的x轴
    const oddRowOffsetX = i * this.width + this.width / 2; // 奇数行的六边形格子的x轴
    hexagonNode.x = row % 2 ? evenRowOffsetX : oddRowOffsetX;

    // 计算每个六边形y轴的位置
    const RowOffsetY = cc
      .v2(0, Math.sin(240 * ((2 * Math.PI) / 360)))
      .mul(this.width)
      .mag();
    hexagonNode.y = -row * RowOffsetY;
  }

  /** 生成的所有格子按照生成出来的布局居中于父节点 */
  SetAreaCenter() {
    const { width: wrapWidth, height: wrapHeight } = calculateBoundingBox(this.wrap);
    this.wrap.width = wrapWidth;
    this.wrap.height = wrapHeight;
    this.node.width = wrapWidth;
    this.node.height = wrapHeight;
    centerChildren(this.wrap);
    centerChildren(this.node);
    this.wrap.setPosition(cc.v2(0, 0));
    this.node.addChild(this.wrap);
  }
}
