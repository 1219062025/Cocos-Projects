import I18nManager from "../../I18nManager";
import ResourceManager from "../../ResourceManager";

const { ccclass, property } = cc._decorator;

export const LocalizedType = cc.Enum({
  Label: 0,
  Sprite: 1,
});

@ccclass
export default class Localized extends cc.Component {
  /** 唯一标识符 */
  @property({
    tooltip: "唯一标识符",
  })
  key: string = "";

  @property({
    type: LocalizedType,
    displayName: "组件类型",
    tooltip: "选择节点上需要i18n处理的组件的类型",
  })
  type: number = LocalizedType.Label;

  onLoad() {
    if (!this.key) {
      console.error(
        `[Localized] Component Localized on node ${this.node} has not been assigned a Key value.`
      );
      return;
    }

    // 注册
    I18nManager.register(this);
  }

  onDestroy() {
    I18nManager.unregister(this);
  }

  /** 执行更新 */
  public updateLocalization() {
    const languageData = I18nManager.getCurrentLanguageData();
    if (languageData) {
      this._updateContent(languageData);
    }
  }

  private _updateContent(languageData: Record<string, string>) {
    let value = languageData[this.key];

    if (!value) {
      console.warn(
        `[Localized] Key "${this.key}" not found in [${I18nManager.language}] language data.`
      );
      return;
    }

    if (this.type === LocalizedType.Label) {
      // 更新当前节点的文本组件
      const label = this.node.getComponent(cc.Label);
      if (label) {
        label.string = value;
      }
    } else if (this.type === LocalizedType.Sprite) {
      // 更新当前节点的图片组件
      const sprite = this.node.getComponent(cc.Sprite);
      if (sprite) {
        const url = `${I18nManager.basePath}/${value}`;

        ResourceManager.loadRes(url, cc.SpriteFrame)
          .then((res: cc.SpriteFrame) => {
            sprite.spriteFrame = res;
          })
          .catch((err) => {
            console.error(`[Localized] Failed to load sprite: ${url}`, err);
          });
      }
    }
  }
}
