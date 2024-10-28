import { _decorator, Component, error, find, instantiate, isValid, Node, Prefab } from 'cc';
import { ResourceUtil } from './resourceUtil';
import { PoolManager } from './poolManager';
import { Tips } from '../ui/common/tips';
const { ccclass, property } = _decorator;

const SHOW_STR_INTERVAL_TIME = 800;

@ccclass('UIManager')
export class UIManager {
  private static _instance: UIManager = null;

  public static get instance() {
    if (this._instance == null) {
      this._instance = new UIManager();
    }

    return this._instance;
  }

  /**  */
  private _dictLoading: any = {};
  /** 已创建的UI界面的字典 */
  private _dictSharedPanel: { [key: string]: Node } = {};

  /** tips显示的时间 */
  private _showTipsTime: number = 0;
  /**
   * 显示单例界面
   * @param {String} panelPath
   * @param {Array} args
   * @param {Function} cb 回调函数，创建完毕后回调
   */
  public showDialog(panelPath: string, args: any = [], cb?: Function, isTip?: boolean) {
    if (this._dictLoading[panelPath]) {
      return;
    }

    // 获取UI脚本名。需要在挂载脚本时按照一定规则
    let scriptName = panelPath.slice(panelPath.lastIndexOf('/') + 1);

    // UI界面已经创建过了，直接显示
    if (this._dictSharedPanel.hasOwnProperty(panelPath)) {
      let panel = this._dictSharedPanel[panelPath] as Node;

      if (isValid(panel)) {
        panel.setParent(isTip ? find('Canvas/ui/tip') : find('Canvas/ui/dislog'));

        this.applyPanelShow(panel, args, cb, scriptName);

        return;
      }
    }

    // 设置该UI界面在加载中
    this._dictLoading[panelPath] = true;

    // 创建UI界面
    this.createUI(panelPath, args, cb, isTip);
  }

  /**
   * 隐藏单例界面
   * @param {String} panelPath
   * @param {Function} cb
   */
  public hideDialog(panelPath: string, cb?: Function) {
    if (this._dictSharedPanel.hasOwnProperty(panelPath)) {
      const panel = this._dictSharedPanel[panelPath];

      if (panel && isValid(panel)) {
        // 获取UI界面上挂载的动画控制脚本
        const aniUI = panel.getComponent('animationUI') as any;
        if (aniUI) {
          // 如果有动画脚本的话，触发关闭界面回调
          aniUI.close(() => {
            panel.parent = null;
            cb && cb();
          });
        } else {
          panel.parent = null;
          cb && cb();
        }
      } else {
        cb && cb();
      }

      this._dictLoading[panelPath] = false;
    }
  }

  /**
   * 创建UI界面
   * @param path UI预制体路径
   * @param cb 回调函数
   * @param parent 父节点
   */
  public createUI(path: string, args?: any, cb?: Function, isTip?: boolean) {
    ResourceUtil.getUIPrefabRes(path, (err: Error, prefab: Prefab) => {
      if (err) return error(err.message || err);

      let node: Node = instantiate(prefab);
      node.setPosition(0, 0, 0);
      node.setParent(isTip ? find('Canvas/ui/tip') : find('Canvas/ui/dislog'));

      const isCloseBeforeShow = !!this._dictLoading[path];

      this._dictLoading[path] = false;
      this._dictSharedPanel[path] = node;

      let scriptName = path.slice(path.lastIndexOf('/') + 1);
      // 获取UI脚本名。需要在挂载脚本时按照一定规则
      this.applyPanelShow(node, args, cb, scriptName);

      if (isCloseBeforeShow) {
        //如果在显示前又被关闭，则直接触发关闭掉
        // this.hideDialog(path);
      }
    });
  }

  /** 调用UI脚本的show方法。这需要在挂载脚本时按照一定规则 */
  applyPanelShow(panel: Node, args: any, cb: Function, scriptName: string) {
    let script = panel.getComponent(scriptName);
    let script2 = panel.getComponent(scriptName.charAt(0).toUpperCase() + scriptName.slice(1));

    //@ts-ignore
    if (script && script.show) {
      //@ts-ignore
      script.show.apply(script, args);
      cb && cb(script);
      //@ts-ignore
    } else if (script2 && script2.show) {
      //@ts-ignore
      script2.show.apply(script2, args);
      cb && cb(script2);
    } else {
      throw `查找不到脚本文件${scriptName}`;
    }
  }

  /**
   * 显示提示
   * @param {String} content
   * @param {Function} cb
   */
  public showTips(content: string | number, callback?: Function) {
    const str = String(content);
    const next = () => {
      this._showTipsAni(str, callback);
    };

    var now = Date.now();
    if (now - this._showTipsTime < SHOW_STR_INTERVAL_TIME) {
      var spareTime = SHOW_STR_INTERVAL_TIME - (now - this._showTipsTime);
      setTimeout(() => {
        next();
      }, spareTime);

      this._showTipsTime = now + spareTime;
    } else {
      next();
      this._showTipsTime = now;
    }
  }

  /**
   * 内部函数
   * @param {String} content
   * @param {Function} cb
   */
  private _showTipsAni(content: string, callback?: Function) {
    ResourceUtil.getUIPrefabRes('common/tips', function (err: any, prefab: any) {
      if (err) {
        return;
      }

      let tipsNode = PoolManager.instance.getNode(prefab, find('Canvas') as Node);

      let tipScript = tipsNode.getComponent(Tips) as Tips;
      tipScript.show(content, callback);
    });
  }
}
