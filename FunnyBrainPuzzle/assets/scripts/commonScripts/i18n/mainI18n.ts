const { ccclass, property } = cc._decorator;
// import DebugUtil from '../eazax-ccc/DebugUtil';
import i18nMgr from "./i18nMgr";
import { Language, GetCountryName } from "./i18nType";

@ccclass
export default class mainI18n extends cc.Component {
  /** 记录页面点击次数，10次后显示语言切换下拉菜单 */
  private num: number = 0;
  private i18nNode: cc.Node = null;

  @property
  debug: boolean = false;

  /** 当前语言 */
  private lan: string = null;

  /** 选项菜单节点 */
  private itemContainer: cc.Node = null;

  /** 限制不让频繁点击 无用功 */
  private isFreezing: boolean = false;

  /** 文本编辑组建 */
  private EditBoxComponent: cc.EditBox = null;

  onLoad() {
    // 获取浏览器默认语言首位
    let curlanguge = window.navigator.language.split("-");
    for (let i = curlanguge.length - 1; i >= 0; i--) {
      let e = curlanguge[i].toLowerCase();
      if (Language[e]) {
        this.lan = e;
        break;
      }
    }

    // 浏览器存在默认语言或者系统存在默认语言，直接调用i18n设置整个项目挂载了i18n处理脚本的组件
    if (this.lan != null) {
      i18nMgr.ins.setLanguage(Language[this.lan]);
    } else if (Language[cc.sys.language]) {
      this.lan = cc.sys.language;
      i18nMgr.ins.setLanguage(Language[this.lan]);
    }

    if (this.debug) {
      this.initShowLanguage();
    }
  }

  private initShowLanguage() {
    let canvas = cc.find("Canvas");
    let isMobile = this.isMobile();
    if (!isMobile.device) {
      canvas.on(cc.Node.EventType.TOUCH_START, this.show, this);
      // grid显示所有可变换 语言
      // this.createChangeLanguage()
      // 变为选择菜单
      this.createSelectMenu();
      if (!this.debug) {
        this.i18nNode.active = false;
      }
      // DebugUtil.setStatsColor(cc.Color.RED, cc.Color.YELLOW);
    }
  }

  /**
   * 是不是移动端设备
   */
  private isMobile = () => {
    let agent = navigator.userAgent.toLowerCase();
    // cc.log(agent)
    let result = {
      device: (function () {
        if (
          (/iphone|ipod/.test(agent) && /mobile/.test(agent)) ||
          (/ipad/.test(agent) && /mobile/.test(agent)) ||
          (/android/.test(agent) && /mobile/.test(agent))
        ) {
          return true;
        } else if (
          /windows/.test(agent) ||
          /linux/.test(agent) ||
          /mac/.test(agent)
        ) {
          return false;
        } else {
          return true;
        }
      })(),
    };
    // cc.log('device', result);
    return result;
  };

  changeLanguageByName(event) {
    // 还原所有兄弟节点大小
    this.reSetScale();
    let language: string = event.target.name;
    // cc.log(language)
    event.target.scale += 0.5;
    event.target.color = cc.color(224, 97, 78);
    let curlanguge1: Language = Language[language];
    i18nMgr.ins.setLanguage(curlanguge1);
  }

  // 还原所有兄弟节点大小
  reSetScale() {
    if (!this.i18nNode) return;
    let children = this.i18nNode.children;
    for (let i = 0; i < children.length; i++) {
      children[i].scale = 1;
      children[i].color = cc.color(0, 0, 0);
    }
  }

  /** 至少点击10次后显示语言切换下拉菜单 */
  private show() {
    // return;
    if (this.num >= 10) {
      this.i18nNode.active = true;
    } else {
      this.num++;
    }
  }

  /** 生成语言切换菜单-----屏幕中心Grid选择模式 */
  createChangeLanguage() {
    if (this.i18nNode != null) {
      return;
    }
    let canvas = cc.find("Canvas");
    // 新建node名为i18n
    let i18n = new cc.Node();
    i18n.name = "i18n";
    i18n.parent = canvas;
    i18n.setPosition(0, 0);
    i18n.width = 50 * 4 + 80 * 5;
    // i18n.height = 50 * 9 + 80 * 10;
    let layout = i18n.addComponent(cc.Layout);
    // one row count 5, spacing = 50, each size 80*80

    layout.type = cc.Layout.Type.GRID;
    layout.spacingX = 50;
    // layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
    // 获取有多少个语言
    let keySInLanguageArr = Object.keys(Language).filter((e) => {
      return e.length > 1;
    });
    // cc.log(keySInLanguageArr[1])
    keySInLanguageArr.forEach((e) => {
      let node = new cc.Node();
      node.name = e;
      node.width = node.height = 80;
      let label = node.addComponent(cc.Label);
      label.string = e;
      label.fontSize = 80;
      label.lineHeight = 80;
      node.color = cc.color(0, 0, 0);
      node.parent = i18n;
      node.scale = 1;
      node.on(cc.Node.EventType.TOUCH_START, this.changeLanguageByName, this);
    });

    this.i18nNode = i18n;
    this.i18nNode.active = false;
    if (this.debug) {
      this.i18nNode.active = true;
    }
  }

  /** 生成语言切换菜单-----下拉选择模式 */
  createSelectMenu() {
    if (this.i18nNode) {
      return;
    }
    let selectMenu = new cc.Node("i18n");
    this.i18nNode = selectMenu;

    selectMenu.setParent(cc.director.getScene().getChildByName("Canvas"));
    /** 画蓝色线框 */
    let outline = selectMenu.addComponent(cc.Graphics);
    outline.moveTo(-100, 25);
    outline.lineTo(100, 25);
    outline.lineTo(100, -25);
    outline.lineTo(-100, -25);
    outline.lineTo(-100, 25);
    outline.strokeColor = cc.Color.BLUE;
    outline.lineWidth = 8;
    outline.stroke();

    // base setting
    selectMenu.width = 200;
    selectMenu.height = 50;

    // 下拉菜单对齐目标是Canvas节点，对齐到右上角，刷新对齐位置的时机是视口大小发生变化时
    let widget = selectMenu.addComponent(cc.Widget);
    widget.target = widget.node.parent;
    widget.isAlignRight = widget.isAlignTop = true;
    widget.right = widget.top = 0;
    widget.alignMode = cc.Widget.AlignMode.ON_WINDOW_RESIZE;

    /** "文本输入框"节点，根据输入的文本自动匹配语言 */
    let EditBoxNode = new cc.Node("EditBox");
    EditBoxNode.setParent(selectMenu);
    EditBoxNode.width = 150;
    EditBoxNode.height = 50;
    EditBoxNode.setPosition(-25, 0, 0);
    let EditBoxComponent = EditBoxNode.addComponent(cc.EditBox);
    // 设置输入模式以及限制输入文本长度
    EditBoxComponent.inputMode = cc.EditBox.InputMode.SINGLE_LINE;
    EditBoxComponent.maxLength = 3;
    // 监听输入完成事件
    var editboxEventHandler = new cc.Component.EventHandler();
    editboxEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
    editboxEventHandler.component = "mainI18n";
    editboxEventHandler.handler = "onEditDidEnded";
    EditBoxComponent.editingDidEnded.push(editboxEventHandler);
    // 输入框默认显示的文本
    EditBoxComponent.string = Language[i18nMgr.ins.getLanguage()];
    this.EditBoxComponent = EditBoxComponent;

    // "展示当前语言"节点，展示当前选择的语言。挂载到"文本输入框"节点上
    let Label = new cc.Node("Label");
    Label.setParent(EditBoxNode);
    Label.color = cc.color(0, 0, 0, 255); //  字体颜色
    let LabelWidget = Label.addComponent(cc.Widget);
    LabelWidget.isAlignTop =
      LabelWidget.isAlignBottom =
      LabelWidget.isAlignLeft =
      LabelWidget.isAlignRight =
        true;
    let LabelComponent: cc.Label = Label.addComponent(cc.Label);
    LabelComponent.fontSize = 30;
    LabelComponent.lineHeight = 30;
    LabelComponent.enableBold = true;
    LabelComponent.overflow = cc.Label.Overflow.CLAMP;
    LabelComponent.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    LabelComponent.verticalAlign = cc.Label.VerticalAlign.CENTER;
    // 输入框输入文本节点挂载 Label 组件对象
    EditBoxComponent.textLabel = LabelComponent;

    /** "打开下拉框按钮"节点 */
    let downSelectMenu = new cc.Node("DownSelectMenu");
    downSelectMenu.setParent(selectMenu);
    downSelectMenu.width = 50;
    downSelectMenu.height = 50;
    downSelectMenu.setPosition(75, 0);
    let gtx = downSelectMenu.addComponent(cc.Graphics);
    gtx.fillColor = cc.color(255, 0, 0, 255);
    gtx.fillRect(-25, -25, 50, 50);
    // 添加点击事件
    downSelectMenu.on(cc.Node.EventType.TOUCH_START, this.toggleMenu, this);
    // create menu
    this.createMenu(selectMenu);
  }

  /** 生成下拉框的选项菜单 */
  createMenu(parent: cc.Node) {
    let languages = Object.keys(Language).filter((v) => isNaN(Number(v)));
    /** "选项菜单"节点 */
    let itemContainer = new cc.Node("itemContainer");
    this.itemContainer = itemContainer;
    itemContainer.setParent(parent);
    itemContainer.setPosition(0, -25);
    itemContainer.width = parent.width;
    itemContainer.setAnchorPoint(0.5, 1);

    // 根据选项个数适应高度
    let layout = itemContainer.addComponent(cc.Layout);
    layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
    layout.type = cc.Layout.Type.VERTICAL;

    /** 根据可切换语言数生成对应选项 */
    let item = new cc.Node("item");
    item.width = itemContainer.width;
    item.height = 100;
    item.addComponent(cc.Label);
    item.color = cc.Color.BLACK;
    for (const lan of languages) {
      let item1 = cc.instantiate(item);
      item1.setParent(itemContainer);
      let label = item1.getComponent(cc.Label);
      let chineseName = GetCountryName(lan);
      if (chineseName == undefined) {
        chineseName = "未知";
      }
      let str = lan + "-" + chineseName;
      label.string = str;

      // touch start event
      item1.on(cc.Node.EventType.TOUCH_START, this.setString, this);
    }
    this.toggleMenu();
  }

  /** 切换语言选项后执行 */
  setString(event: cc.Event.EventTouch) {
    // 清空文本输入框
    this.EditBoxComponent.string = "";
    // 获取触摸的选项的文本，处理后得到语言简写
    let str = event.target.getComponent(cc.Label).string;
    str = this.removeDashAndFollowing(str);
    // 设置文本输入框
    this.EditBoxComponent.string = str;
    // 主动触发editEnd event
    this.onEditDidEnded();
    this.toggleMenu();
  }

  removeDashAndFollowing(str: string): string {
    return str.replace(/-.*$/, "");
  }

  /**
   * 2023/08/23
   * @description 只能有一个渲染组件(有了label 就不能有graphics)
   */

  createBG(node: cc.Node, color?: cc.Color) {
    let gtx: cc.Graphics;
    if (node.getComponent(cc.Graphics)) {
      gtx = node.getComponent(cc.Graphics);
    } else {
      gtx = node.addComponent(cc.Graphics);
    }
    gtx.clear();
    let size: cc.Size = node.getContentSize();
    gtx.moveTo(-size.width / 2, size.height / 2);
    gtx.lineTo(size.width / 2, size.height / 2);
    gtx.lineTo(size.width / 2, -size.height / 2);
    gtx.lineTo(-size.width / 2, -size.height / 2);
    gtx.lineTo(-size.width / 2, size.height / 2);
    if (color) {
      gtx.strokeColor = color;
    } else {
      gtx.strokeColor = cc.Color.WHITE;
    }
    gtx.fill();
  }

  /** 执行切换语言 */
  onEditDidEnded() {
    let curLanguage = this.EditBoxComponent.string;
    i18nMgr.ins.setLanguage(Language[curLanguage]);
  }

  /**
   * 2023/08/22
   * @description 显示/隐藏 下拉菜单
   */
  toggleMenu() {
    if (this.isFreezing) return;
    this.isFreezing = true;
    setTimeout(() => {
      this.isFreezing = false;
    }, 500);
    this.itemContainer.active = !this.itemContainer.active;
  }
}
