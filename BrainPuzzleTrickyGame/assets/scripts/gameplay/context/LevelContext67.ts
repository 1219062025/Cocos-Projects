import { gi } from "../../../@framework/gi";
import GlobalData from "../../data/GlobalData";
import { wait } from "../../utils/index";
import Constant from "../Constant";
import CommandManager from "../fungus/commands/CommandManager";
import { LevelContext } from "./ContextManager";

interface Variables {
  buttonWrap: cc.Node;
  yseLabel: cc.Label;
  noLabel: cc.Label;
  wrapSize: cc.Size;
  /** 管理员节点 */
  manager: cc.Node;
  /** 女孩节点 */
  catDemon: cc.Node;
  /** 吸血鬼节点 */
  vampire: cc.Node;
  /** 狼人节点 */
  werewolf: cc.Node;
  /** 第二天 */
  scene: cc.Node;
  fxRed: cc.Node;
  Fail_vempire: cc.Node;
  Fail_werewolf: cc.Node;
  /** 当前第几个客人，从1开始 */
  step: number;
  step1Point: number;
  step2Point: number;
  step3Point: number;
}

export const levelContext67: LevelContext = {
  variables: {
    buttonWrap: null,
    yseLabel: null,
    noLabel: null,
    wrapSize: null,
    manager: null,
    catDemon: null,
    vampire: null,
    scene: null,
    fxRed: null,
    Fail_vempire: null,
    Fail_werewolf: null,
    step: 1,
    step1Point: 0,
    step2Point: 0,
    step3Point: 0,
  },
  functions: {
    start: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext67.variables as Variables;
        const f = levelContext67.functions;
        const [
          buttonWrap,
          yseNode,
          noNode,
          manager,
          catDemon,
          vampire,
          werewolf,
          scene,
          fxRed,
          Fail_vempire,
          Fail_werewolf,
        ] = options.nodes;

        const globalData = gi.DataManager.getModule<GlobalData>(
          Constant.DATA_MODULE.GLOBAL
        );

        v.wrapSize = globalData.getGameView().getContentSize();

        v.buttonWrap = buttonWrap;
        v.yseLabel = yseNode.getComponent(cc.Label);
        v.noLabel = noNode.getComponent(cc.Label);
        v.manager = manager;
        v.catDemon = catDemon;
        v.vampire = vampire;
        v.werewolf = werewolf;
        v.scene = scene;
        v.fxRed = fxRed;
        v.Fail_vempire = Fail_vempire;
        v.Fail_werewolf = Fail_werewolf;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        // 管理进场
        f.managerIn(options);

        await wait(3.5);

        // 管理离场
        f.managerOut(options);

        await wait(1.5);

        // 女孩进场
        f.catDemonIn(options);
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);

        gi.EventManager.emit(Constant.EVENT.START_GUIDE);
        resolve(true);
      });
    },
    checkStep1: (options) => {
      const v = levelContext67.variables as Variables;
      if (v.step1Point === 4) {
        v.buttonWrap.active = true;
      }
    },
    checkStep2: (options) => {
      const v = levelContext67.variables as Variables;
      if (v.step2Point === 3) {
        v.buttonWrap.active = true;
      }
    },

    fx_red: (options) => {
      (cc.tween(options.target) as cc.Tween)
        .to(0.5, { opacity: 50 })
        .to(0.5, { opacity: 255 })
        .union()
        .repeatForever()
        .start();
    },
    /** 允许通行 */
    yes: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext67.variables as Variables;
        const f = levelContext67.functions;
        v.buttonWrap.active = false;

        if (v.step === 1) {
          CommandManager.executeCommand("yes-setActive", v.catDemon);
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "6");

          await wait(2);

          // 女孩离场
          f.catDemonOut(options, true);

          await wait(1);

          // 吸血鬼进场
          f.vampireIn(options);
        } else if (v.step === 2) {
          CommandManager.executeCommand("yes-setActive", v.vampire);
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "15");

          // 吸血鬼奸笑
          f.vampireTween(options);

          await wait(1);

          // 吸血鬼离场
          f.vampireOut(options);

          await wait(1.5);
        } else if (v.step === 3) {
          CommandManager.executeCommand("setActive-yes", v.werewolf);
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "22");

          await wait(1);

          f.werewolfOut(options, true);
        }

        v.step++;

        resolve(true);
      });
    },
    /** 拒绝通行 */
    no: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext67.variables as Variables;
        const f = levelContext67.functions;

        v.buttonWrap.active = false;

        if (v.step === 1) {
          CommandManager.executeCommand("no-setActive", v.catDemon);
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "7");

          await wait(2);

          // 女孩离场
          f.catDemonOut(options, false);

          await wait(1);

          // 吸血鬼进场
          f.vampireIn(options);
        } else if (v.step === 2) {
          CommandManager.executeCommand("no-setActive", v.vampire);
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "12");

          v.fxRed.active = true;
        } else if (v.step === 3) {
          gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "26");
          await wait(2);

          f.Fail_werewolf(options);

          await wait(2);
          gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
        }

        v.step++;

        resolve(true);
      });
    },
    /** 管理进场 */
    managerIn: (options, isYes) => {
      const v = levelContext67.variables as Variables;

      const originX = v.manager.x;
      v.manager.x = v.wrapSize.width + v.manager.width;
      v.manager.active = true;

      (cc.tween(v.manager) as cc.Tween)
        .to(1.5, { x: originX }, { easing: "sineInOut" })
        .call(() => {
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "0");
        })
        .start();
    },
    /** 管理离场 */
    managerOut: (options, isYes) => {
      const v = levelContext67.variables as Variables;

      const targetX = v.wrapSize.width;

      (cc.tween(v.manager) as cc.Tween)
        .to(1.5, { x: targetX }, { easing: "sineInOut" })
        .start();
    },
    /** 女孩进场 */
    catDemonIn: (options, isYes) => {
      const v = levelContext67.variables as Variables;

      const originX = v.catDemon.x;
      v.catDemon.x = v.wrapSize.width + v.catDemon.width;
      v.catDemon.active = true;

      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "1");

      (cc.tween(v.catDemon) as cc.Tween)
        .to(1.5, { x: originX }, { easing: "sineInOut" })
        .start();
    },
    /** 女孩离场 */
    catDemonOut: (options, isYes) => {
      const v = levelContext67.variables as Variables;

      const targetX = isYes ? -v.wrapSize.width : v.wrapSize.width;
      (cc.tween(v.catDemon) as cc.Tween)
        .to(isYes ? 1.5 : 1, { x: targetX }, { easing: "sineInOut" })
        .start();
    },
    Fail_vempire: (options) => {
      const v = levelContext67.variables as Variables;
      (cc.tween(v.Fail_vempire) as cc.Tween).to(1, { opacity: 255 }).start();
    },
    Fail_werewolf: (options) => {
      const v = levelContext67.variables as Variables;
      (cc.tween(v.Fail_werewolf) as cc.Tween).to(1, { opacity: 255 }).start();
    },
    /** 吸血鬼进场 */
    vampireIn: (options) => {
      const v = levelContext67.variables as Variables;

      const originX = v.vampire.x;
      v.vampire.x = v.wrapSize.width + v.vampire.width;
      v.vampire.active = true;

      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "8");

      (cc.tween(v.vampire) as cc.Tween)
        .to(1.5, { x: originX }, { easing: "sineInOut" })
        .start();
    },
    /** 吸血鬼离场 */
    vampireOut: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext67.variables as Variables;
        const f = levelContext67.functions;

        v.fxRed.active = false;
        (cc.tween(v.vampire) as cc.Tween)
          .to(1.5, { x: -v.wrapSize.width }, { easing: "sineInOut" })
          .start();

        await wait(1.5);

        f.werewolfIn(options);
        resolve(true);
      });
    },
    /** 吸血鬼离场_被大蒜攻击 */
    vampireOutGarlic: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext67.variables as Variables;
        const f = levelContext67.functions;

        const [vampireIdle, vampireGarlic, garlic_mouth, garlic] =
          options.nodes;

        garlic.active = true;
        const ani = garlic.getComponent(cc.Animation);
        ani.play();
        ani.once("finished", async () => {
          garlic.active = false;
          garlic_mouth.active = true;
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "13");

          // 吸血鬼剧烈颤抖
          (cc.tween(vampireIdle) as cc.Tween)
            .to(0.05, { scaleY: 0.99 })
            .to(0.05, { scaleY: 1 })
            .union()
            .repeatForever()
            .start();

          await wait(0.5);

          vampireIdle.active = false;
          vampireGarlic.active = true;

          await wait(0.2);

          v.fxRed.active = false;

          // 吸血鬼跳出屏幕
          (cc.tween(vampireGarlic) as cc.Tween)
            .to(0.5, {
              position: cc.v2(
                vampireGarlic.x - 300,
                v.wrapSize.height + vampireGarlic.height
              ),
            })
            .delay(1.5)
            .call(() => {
              f.werewolfIn(options);
              resolve(true);
            })
            .start();
        });
      });
    },
    /** 油灯攻击吸血鬼，游戏失败 */
    vampireOilLamp: (options) => {
      return new Promise(async (resolve) => {
        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        const v = levelContext67.variables as Variables;
        const f = levelContext67.functions;

        const [vampireIdle, vampireGarlic, oilLamp] = options.nodes;

        oilLamp.active = true;
        const ani = oilLamp.getComponent(cc.Animation);
        ani.play();

        await wait(0.2);

        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "14");
        vampireIdle.active = false;
        vampireGarlic.active = true;

        await wait(0.3);

        vampireIdle.active = true;
        vampireGarlic.active = false;
        await wait(1.5);

        f.Fail_vempire(options);

        await wait(2);
        gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
      });
    },
    vampireTween: (options) => {
      const v = levelContext67.variables as Variables;

      v.vampire.stopAllActions();
      (cc.tween(v.vampire) as cc.Tween)
        .to(0.1, { scaleY: 0.99 })
        .to(0.1, { scaleY: 1 })
        .union()
        .repeatForever()
        .start();
    },
    /** 狼人变身 */
    werewolf: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext67.variables as Variables;
        CommandManager.executeCommand("setActive-1", options.trigger.node);

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "20");

        await wait(1.5);

        v.fxRed.active = true;
        CommandManager.executeCommand("setActive-2", options.trigger.node);
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "21");
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);
      });
    },
    /** 油灯攻击狼人 */
    werewolfOilLamp: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext67.variables as Variables;
        const f = levelContext67.functions;

        const [fire_FX, oilLamp] = options.nodes;

        v.buttonWrap.active = false;
        oilLamp.active = true;
        const ani = oilLamp.getComponent(cc.Animation);
        ani.play();
        v.fxRed.active = false;

        ani.once("finished", async () => {
          CommandManager.executeCommand("setActive-1", options.trigger.node);
          oilLamp.active = false;
          fire_FX.active = true;

          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "23");

          await wait(1.5);

          f.werewolfOut(options, false);
          resolve(true);
        });
      });
    },
    /** 狼人进场 */
    werewolfIn: (options) => {
      const v = levelContext67.variables as Variables;

      const originX = v.werewolf.x;
      v.werewolf.x = v.wrapSize.width;
      v.werewolf.active = true;

      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "16");
      CommandManager.executeCommand("setActive-window", v.werewolf);
      CommandManager.executeCommand("setActive-oilLamp", v.werewolf);

      (cc.tween(v.werewolf) as cc.Tween)
        .to(1.5, { x: originX }, { easing: "sineInOut" })
        .start();
    },
    /** 狼人离场 */
    werewolfOut: (options, isYes) => {
      return new Promise(async (resolve) => {
        const v = levelContext67.variables as Variables;
        const f = levelContext67.functions;

        v.fxRed.active = false;
        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        v.buttonWrap.active = false;
        (cc.tween(v.werewolf) as cc.Tween)
          .to(
            1.5,
            { x: isYes ? -v.wrapSize.width : v.wrapSize.width },
            { easing: "sineInOut" }
          )
          .start();

        await wait(1.5);

        f.scene(options);

        resolve(true);
      });
    },
    /** 第二天 */
    scene: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext67.variables as Variables;
        const f = levelContext67.functions;
        (cc.tween(v.scene) as cc.Tween)
          .to(1, { opacity: 255 })
          .call(() => {
            CommandManager.executeCommand("setActive-1", v.scene);
          })
          .delay(2)
          .to(1, { opacity: 0 })
          .call(async () => {
            gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "25");

            await wait(2.5);

            gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
          })
          .start();
      });
    },
    /** 普通速度待机 */
    tweenIdle1: (options, target) => {
      const v = levelContext67.variables as Variables;

      (cc.tween(target || options.target) as cc.Tween)
        .to(0.5, { scaleY: 0.99 })
        .to(0.5, { scaleY: 1 })
        .union()
        .repeatForever()
        .start();
    },
    /** 快速待机 */
    tweenIdle2: (options, target) => {
      const v = levelContext67.variables as Variables;

      (cc.tween(target || options.target) as cc.Tween)
        .to(0.3, { scaleY: 0.99 })
        .to(0.3, { scaleY: 1 })
        .union()
        .repeatForever()
        .start();
    },
    /** 尾巴待机 */
    tweenCatTail: (options, target) => {
      const v = levelContext67.variables as Variables;

      (cc.tween(options.target) as cc.Tween)
        .to(0.8, { angle: -5 }, { easing: "sineInOut" })
        .to(1.4, { angle: 0 }, { easing: "sineInOut" })
        .union()
        .repeatForever()
        .start();
    },
    /** 手待机 */
    tweenHand: (options, target) => {
      const v = levelContext67.variables as Variables;

      (cc.tween(options.target) as cc.Tween)
        .to(0.7, { angle: 3 }, { easing: "sineInOut" })
        .to(0.7, { angle: 0 }, { easing: "sineInOut" })
        .union()
        .repeatForever()
        .start();
    },
  },
};
