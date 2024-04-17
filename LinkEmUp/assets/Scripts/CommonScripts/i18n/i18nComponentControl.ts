import i18nMgr from './i18nMgr';
import { PropertyType, ComponentType } from './i18nType';

const { ccclass, property, executeInEditMode, requireComponent, disallowMultiple } = cc._decorator;
/**
 * i18n组件
 */
@ccclass
@executeInEditMode //生命周期会在编辑器下触发，例如start
// @requireComponent(cc.Sprite) //指定当前组件的依赖组件
@disallowMultiple //当本组件添加到节点上后，禁止同类型（含子类）的组件再添加到同一个节点
export default class i18nComponent extends cc.Component {
  @property({ type: PropertyType, displayName: '组件类型', tooltip: '选择节点上需要i18n处理的组件的类型' })
  componentType: number = PropertyType.Label;

  /** Key值 */
  @property({ visible: false })
  private _key: string = '';
  @property({ type: cc.String, tooltip: '配置key值' })
  public get key() {
    return this._key;
  }
  public set key(value) {
    this._key = value;
    this.resetValue();
  }

  /** 参数 */
  @property({ visible: false })
  private _params: string[] = [];
  @property({ type: [cc.String], tooltip: '传入参数' })
  public get params() {
    return this._params;
  }
  public set params(value: string[]) {
    this._params = value;
    this.resetValue();
  }

  /** 获取组件类型Prop */
  public get prop() {
    return ComponentType.get(this.componentType);
  }

  onLoad() {
    cc._decorator.requireComponent(cc[this.prop]);
  }

  start() {
    i18nMgr.ins.add(this);
    this.resetValue();
  }

  onDestroy() {
    i18nMgr.ins.remove(this);
  }

  /**
   * 设置
   * @param key   配置key值
   * @param params 传入参数
   */
  public setValue(key: string, params: string[]) {
    this._key = key;
    this._params = params;
    this.resetValue();
  }

  /**重置 */
  public resetValue() {
    this[`reset${this.prop}`]();
  }

  resetLabel() {
    let label: cc.Label = this.node.getComponent(cc.Label);
    label.string = i18nMgr.ins.getLabel(this._key, this._params);
  }

  resetRichText() {
    let label: cc.RichText = this.node.getComponent(cc.RichText);
    label.string = i18nMgr.ins.getLabel(this._key, this._params);
  }

  resetMask() {
    i18nMgr.ins.getSpriteFrame(
      this._key,
      (spriteFrame: cc.SpriteFrame) => {
        if (spriteFrame != null && cc.isValid(this.node)) {
          let p: cc.Mask = this.node.getComponent(cc.Mask);
          p.spriteFrame = spriteFrame;
        }
      },
      this
    );
  }

  resetSprite() {
    i18nMgr.ins.getSpriteFrame(
      this._key,
      (spriteFrame: cc.SpriteFrame) => {
        if (spriteFrame != null && cc.isValid(this.node)) {
          let sp: cc.Sprite = this.node.getComponent(cc.Sprite);
          sp.spriteFrame = spriteFrame;
        }
      },
      this
    );
  }

  resetParticle() {
    i18nMgr.ins.getSpriteFrame(
      this._key,
      (spriteFrame: cc.SpriteFrame) => {
        if (spriteFrame != null && cc.isValid(this.node)) {
          let p: cc.ParticleSystem = this.node.getComponent(cc.ParticleSystem);
          p.spriteFrame = spriteFrame;
        }
      },
      this
    );
  }
}
