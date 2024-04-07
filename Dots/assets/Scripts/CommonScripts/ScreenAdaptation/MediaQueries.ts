import EventManager from '../EventManager';
import ScreenManager from './ScreenManager';

const { ccclass, property, executeInEditMode } = cc._decorator;

const Feature = {
  Orientation: 0,
  MinWidth: 1,
  MinHeight: 2,
  MaxWidth: 3,
  MaxHeight: 4
};

enum OrientationType {
  portrait,
  landscape
}

@ccclass
@executeInEditMode
export default class MediaQueries extends cc.Component {
  //#region 媒体查询配置
  @property({ displayName: '查询设备方向', tooltip: '勾选之后将在设备方向满足条件时执行查询' })
  hasOrientation: boolean = false;
  @property({
    type: cc.Enum(OrientationType),
    displayName: '方向',
    tooltip: '设备方向为该值时查询。\nportrait：竖向\nlandscape：横向',
    visible() {
      return this.hasOrientation;
    }
  })
  Orientation = OrientationType.portrait;

  @property({ displayName: '查询最小屏幕宽度', tooltip: '勾选之后将在屏幕宽度>=设定值时执行查询' })
  hasMinWidth: boolean = false;
  @property({
    type: cc.Integer,
    displayName: '最小屏幕宽度',
    tooltip: '屏幕宽度>=该值时查询',
    min: 0,
    visible() {
      return this.hasMinWidth;
    }
  })
  MinWidth: number = 0;

  @property({ displayName: '查询最小屏幕高度', tooltip: '勾选之后将在屏幕高度>=设定值时执行查询' })
  hasMinHeight: boolean = false;
  @property({
    type: cc.Integer,
    displayName: '最小屏幕高度',
    tooltip: '屏幕高度>=该值时查询',
    min: 0,
    visible() {
      return this.hasMinHeight;
    }
  })
  MinHeight: number = 0;

  @property({ displayName: '查询最大屏幕宽度', tooltip: '勾选之后将在屏幕宽度<=设定值时执行查询' })
  hasMaxWidth: boolean = false;
  @property({
    type: cc.Integer,
    displayName: '最大屏幕宽度',
    tooltip: '屏幕宽度<=该值时查询',
    min: 0,
    visible() {
      return this.hasMaxWidth;
    }
  })
  MaxWidth: number = 0;

  @property({ displayName: '查询最大屏幕高度', tooltip: '勾选之后将在屏幕高度<=设定值时执行查询' })
  hasMaxHeight: boolean = false;
  @property({
    type: cc.Integer,
    displayName: '最大屏幕高度',
    tooltip: '屏幕高度<=该值时查询',
    min: 0,
    visible() {
      return this.hasMaxHeight;
    }
  })
  MaxHeight: number = 0;

  /** 获取当前已经勾选的媒体查询 */
  get FeatureList(): { FeatureName: string; FeatureType: number }[] {
    const result = [];
    Object.entries(Feature).forEach(([FeatureName, FeatureType]) => {
      if (this[`has${FeatureName}`]) result.push({ FeatureName, FeatureType });
    });
    return result;
  }

  /** 节点信息存档 */
  NodeInfoRecord: MediaQueries = null;
  //#endregion

  //#region 满足查询条件后的节点信息
  @property
  _Position = new cc.Vec2();
  @property
  _Rotation = 0;
  @property
  _Scale = new cc.Vec3();
  @property
  _Anchor = new cc.Vec2();
  @property
  _Size = new cc.Size(0, 0);
  @property
  _Color = new cc.Color();
  @property
  _Opacity = 255;
  @property({ tooltip: '挂载组件时复制一次节点的信息，之后在编辑器修改属性后不再进行复制' })
  _isCopyNodeInfo = false;
  @property({
    tooltip: '相对父节点的位置坐标, 以像素为单位'
  })
  get Position() {
    return this._Position;
  }
  set Position(value) {
    this._Position = value;
  }
  @property({
    type: cc.Integer,
    tooltip: '相对父节点的旋转, 以度为单位，输入正值时逆时针旋转',
    step: 1
  })
  get Rotation() {
    return this._Rotation;
  }
  set Rotation(value) {
    this._Rotation = value;
  }
  @property({
    tooltip: '节点的整体缩放比例，会影响所有子节点'
  })
  get Scale() {
    return this._Scale;
  }
  set Scale(value) {
    this._Scale = value;
  }
  @property({
    tooltip: '节点位置和旋转的基准点，(0,0)表示左下角，(1,1)表示右上角'
  })
  get Anchor() {
    return this._Anchor;
  }
  set Anchor(value) {
    this._Anchor = value;
  }
  @property({
    tooltip: '节点的内容尺寸，以像素为单位，在排版中至关重要。修改size不会影响子节点。',
    min: 0,
    step: 1
  })
  get Size() {
    return this._Size;
  }
  set Size(value) {
    value.width = value.width < 0 ? 0 : value.width;
    value.height = value.height < 0 ? 0 : value.height;
    this._Size = value;
  }
  @property({
    tooltip: '节点的颜色，会影响节点上的渲染组件的颜色显示'
  })
  get Color() {
    return this._Color;
  }
  set Color(value) {
    this._Opacity = value.a;
    this._Color = value;
  }
  @property({
    type: cc.Integer,
    tooltip: '节点的不透明度，会影响本节点和所有子节点上渲染组件的不透明度',
    min: 0,
    max: 255,
    slide: true
  })
  get Opacity() {
    return this._Opacity;
  }
  set Opacity(value) {
    this._Color.a = this._Opacity = value;
  }
  //#endregion

  //#region 组件信息配置
  /** 媒体查询id */
  mid: number = Infinity;
  //#endregion

  onLoad() {
    this.CopyNodeInfo(this, true);
    this.Init();
  }

  Init() {
    this.mid = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    ScreenManager.ins.add(this.node, this);
  }

  /** 执行查询 */
  InquireStart() {
    if (!this.hasFeature()) return;
    const isValid = this.FeatureList.every(Feature => {
      return this[`Inquire${Feature.FeatureName}`]();
    });
    if (isValid) {
      this.SaveNodeInfo();
      this.SetNodeInfo(this);
    } else {
      if (this.hasNodeInfoRecord()) {
        const NodeInfoRecord = this.LoadNodeInfo();
        this.SetNodeInfo(NodeInfoRecord);
      }
    }
  }

  InquireOrientation() {
    let isValid = false;
    const winSize = cc.view.getFrameSize();
    const type = winSize.width < winSize.height ? 0 : 1;
    isValid = this.Orientation === type;
    return isValid;
  }

  InquireMinWidth() {
    let isValid = false;
    const winSize = cc.view.getFrameSize();
    isValid = this.MinWidth <= winSize.width;
    return isValid;
  }

  InquireMinHeight() {
    let isValid = false;
    const winSize = cc.view.getFrameSize();
    isValid = this.MinHeight <= winSize.height;
    return isValid;
  }

  InquireMaxWidth() {
    let isValid = false;
    const winSize = cc.view.getFrameSize();
    isValid = this.MaxWidth >= winSize.width;
    return isValid;
  }

  InquireMaxHeight() {
    let isValid = false;
    const winSize = cc.view.getFrameSize();
    isValid = this.MaxHeight >= winSize.height;
    return isValid;
  }

  /** 挂载组件时复制一次节点的信息，之后在编辑器修改属性后不再进行复制 */
  CopyNodeInfo(out: MediaQueries, once: boolean = false) {
    if (once && this._isCopyNodeInfo) return;
    this.node.getPosition(out.Position);
    out.Rotation = this.node.angle;
    this.node.getScale(out.Scale);
    out.Anchor = this.node.getAnchorPoint();
    out.Size = this.node.getContentSize();
    out.Color = this.node.color;
    out.Opacity = this.node.opacity;
    if (once) this._isCopyNodeInfo = true;
  }

  /** 设置节点信息 */
  SetNodeInfo(input: MediaQueries) {
    this.node.setPosition(input.Position);
    this.node.angle = input.Rotation;
    this.node.setScale(input.Scale);
    this.node.setAnchorPoint(input.Anchor);
    this.node.setContentSize(input.Size);
    this.node.color = input.Color;
    this.node.opacity = input.Opacity;
  }

  /** 是否存在节点信息存档 */
  hasNodeInfoRecord() {
    return this.NodeInfoRecord !== null;
  }

  /** 保存当前节点信息 */
  SaveNodeInfo() {
    if (!this.hasNodeInfoRecord()) this.NodeInfoRecord = new MediaQueries();
    this.CopyNodeInfo(this.NodeInfoRecord);
  }

  /** 读取最近一次保存的节点信息 */
  LoadNodeInfo() {
    if (!this.hasNodeInfoRecord()) return;
    return this.NodeInfoRecord;
  }

  /** 是否存在指定type的媒体查询，如果不指定type，则判断是否至少存在一种媒体查询 */
  hasFeature(type?: number) {
    return type !== undefined ? this.FeatureList.findIndex(Feature => Feature.FeatureType === type) !== -1 : this.FeatureList.length !== 0;
  }

  /** 销毁时反注册组件 */
  onDestroy() {
    ScreenManager.ins.remove(this.node, this.mid);
  }
}
