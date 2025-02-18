import { gi } from "../../../@framework/gi";
import GlobalData from "../../data/GlobalData";
import { wait } from "../../utils/index";
import Constant from "../Constant";
import CommandManager from "../fungus/commands/CommandManager";
import { LevelContext } from "./ContextManager";

interface Variables {
  /** 当前第几幕 */
  step: number;
  /** 0-没有帮手 1-维修工帮忙 2-屠夫帮忙 3-两个帮手 */
  helper: number;
  /** 全部的Act节点 */
  actList: cc.Node[];
  /** 过渡黑幕 */
  transitionMask: cc.Node;
  eyeOutSideArea: cc.Node;
}

export const levelContext72: LevelContext = {
  variables: {
    step: 0,
    helper: 0,
    actList: [],
    transitionMask: null,
    eyeOutSideArea: null,
  },
  functions: {
    start: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;
        const [transitionMask, eyeOutSideArea] = options.nodes;

        v.transitionMask = transitionMask;
        v.eyeOutSideArea = eyeOutSideArea;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "0");
        gi.EventManager.emit(Constant.EVENT.START_GUIDE);
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);
        resolve(true);
      });
    },
    saveAct: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        v.actList = options.nodes;
        resolve(true);
      });
    },
    /** 下一幕 */
    nextAct: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        if (v.step > 6) resolve(true);

        const curAct = v.actList[v.step];
        const nextAct = v.actList[v.step + 1];

        curAct.active = false;
        nextAct.active = true;
        v.step++;

        v.eyeOutSideArea.children.forEach((item) => (item.active = false));

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        switch (v.step) {
          case 1:
            gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "1");
            break;
          case 2:
            gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "4");
            break;
          case 3:
            gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "6");
            break;
          case 4:
            gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "11");
            break;
          case 5:
            gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "13");
            break;
          case 6:
            gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "18");
            break;
        }
        v.eyeOutSideArea.children[v.step].active = true;
        v.eyeOutSideArea.active = true;

        await wait(2);
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);

        resolve(true);
      });
    },
    /** 看猫眼 */
    eyeOutSide: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        v.eyeOutSideArea.active = false;

        const curAct = v.actList[v.step];

        switch (v.step) {
          case 0:
            f.startAni(options);
            gi.EventManager.emit(Constant.EVENT.COMPLETE_GUIDE, "0");
            break;
          case 1:
            gi.EventManager.emit(Constant.EVENT.COMPLETE_GUIDE, "1");
            break;
          case 2:
            curAct.getChildByName("Button_Group").active = true;
            gi.EventManager.emit(Constant.EVENT.COMPLETE_GUIDE, "3");
            break;
          case 3:
            gi.EventManager.emit(Constant.EVENT.COMPLETE_GUIDE, "4");
            break;
          case 4:
            gi.EventManager.emit(Constant.EVENT.COMPLETE_GUIDE, "7");
            break;
          case 5:
            gi.EventManager.emit(Constant.EVENT.COMPLETE_GUIDE, "8");
            break;
          case 6:
            curAct.getChildByName("Button_Group").active = true;
            gi.EventManager.emit(Constant.EVENT.COMPLETE_GUIDE, "9");
            break;
        }

        if (v.step !== 0) {
          curAct.getChildByName("Out_Side").active = true;
        }

        resolve(true);
      });
    },
    /** 过渡黑幕255 */
    transition255: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;

        (cc.tween(v.transitionMask) as cc.Tween)
          .to(0.3, { opacity: 255 })
          .call(() => {
            resolve(true);
          })
          .start();
      });
    },
    /** 过渡黑幕0 */
    transition0: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;

        (cc.tween(v.transitionMask) as cc.Tween)
          .to(0.3, { opacity: 0 })
          .call(() => {
            resolve(true);
          })
          .start();
      });
    },
    /** 隐藏门外场景与按钮 */
    hideOutSideAndButton: (options) => {
      const v = levelContext72.variables as Variables;

      const curAct = v.actList[v.step];
      curAct.getChildByName("Out_Side").active = false;
      curAct.getChildByName("Button_Group").active = false;
    },
    /** 游戏失败，杀手进门 */
    failOpenDoorKiller: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;

        const curAct = v.actList[v.step];
        cc.find("In_Side/A_Door_1", curAct).active = false;
        cc.find("In_Side/A_Door_3", curAct).active = true;
        cc.find("In_Side/F_Killer", curAct).active = true;
      });
    },
    /** 正常情况开门 */
    defaultOpenDoor: (options) => {
      const v = levelContext72.variables as Variables;

      const curAct = v.actList[v.step];
      cc.find("In_Side/A_Door_1", curAct).active = false;
      cc.find("In_Side/A_Door_3", curAct).active = true;
    },
    /** 正常情况没开门 */
    defaultNoOpenDoor: (options) => {
      const v = levelContext72.variables as Variables;

      const curAct = v.actList[v.step];
      cc.find("In_Side/A_Door_1", curAct).active = false;
      cc.find("In_Side/A_Door_2", curAct).active = true;
    },
    startAni: (options) => {
      const v = levelContext72.variables as Variables;
      const f = levelContext72.functions;

      gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);

      const ani = v.actList[0].getComponent(cc.Animation);
      ani.play("Start_Act");
      ani.once("finished", async () => {
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "25");
        await wait(2.5);
        f.nextAct(options);
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);
      });
    },
    /** 第一幕开门，后面依此类推 */
    yes1: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        await f.transition255(options);
        f.hideOutSideAndButton(options);
        await f.transition0(options);

        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "3");
        options.nodes[0].active = true;
        f.failOpenDoorKiller(options);

        await wait(2);
        gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);

        resolve(true);
      });
    },
    /** 第一幕不开门，后面依此类推 */
    no1: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        await f.transition255(options);
        f.hideOutSideAndButton(options);
        f.defaultNoOpenDoor(options);
        await f.transition0(options);

        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "2");

        await wait(3);

        f.nextAct(options);
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);

        resolve(true);
      });
    },
    yes2: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        await f.transition255(options);
        f.hideOutSideAndButton(options);
        await f.transition0(options);

        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "3");
        options.nodes[0].active = true;
        f.failOpenDoorKiller(options);

        await wait(2);
        gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);

        resolve(true);
      });
    },
    no2: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        await f.transition255(options);
        f.hideOutSideAndButton(options);
        f.defaultNoOpenDoor(options);
        await f.transition0(options);

        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "5");

        await wait(3);

        f.nextAct(options);
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);

        resolve(true);
      });
    },
    yes3: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        v.helper = 1;

        await f.transition255(options);
        f.hideOutSideAndButton(options);
        await f.transition0(options);

        f.defaultOpenDoor(options);

        /** 维修工进门 */
        options.nodes[0].active = true;

        await wait(1.5);
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "8");
        await wait(2);
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "9");

        options.nodes[0].getComponent(cc.Animation).play("Leave");
        await wait(1);

        await f.transition255(options);
        f.nextAct(options);
        await f.transition0(options);
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);

        resolve(true);
      });
    },
    no3: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        await f.transition255(options);
        f.hideOutSideAndButton(options);
        f.defaultNoOpenDoor(options);
        await f.transition0(options);

        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "10");

        await wait(3);

        f.nextAct(options);
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);

        resolve(true);
      });
    },
    yes4: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        await f.transition255(options);
        f.hideOutSideAndButton(options);
        await f.transition0(options);

        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "3");
        options.nodes[0].active = true;
        f.failOpenDoorKiller(options);

        await wait(2);
        gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);

        resolve(true);
      });
    },
    no4: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        await f.transition255(options);
        f.hideOutSideAndButton(options);
        f.defaultNoOpenDoor(options);
        await f.transition0(options);

        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "12");

        await wait(3);

        f.nextAct(options);
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);

        resolve(true);
      });
    },
    yes5: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        v.helper = v.helper === 1 ? 3 : 2;

        await f.transition255(options);
        f.hideOutSideAndButton(options);
        await f.transition0(options);

        f.defaultOpenDoor(options);

        /** 屠夫进门 */
        options.nodes[0].active = true;

        await wait(1.5);
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "15");
        await wait(2);
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "16");

        options.nodes[0].getComponent(cc.Animation).play("Leave");
        await wait(1);

        await f.transition255(options);
        f.nextAct(options);
        await f.transition0(options);
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);

        resolve(true);
      });
    },
    no5: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        await f.transition255(options);
        f.hideOutSideAndButton(options);
        f.defaultNoOpenDoor(options);
        await f.transition0(options);

        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "17");

        await wait(3);

        f.nextAct(options);
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);

        resolve(true);
      });
    },
    yes6: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        await f.transition255(options);
        f.hideOutSideAndButton(options);
        await f.transition0(options);

        const [In_Side] = options.nodes;
        const ani = In_Side.getComponent(cc.Animation);

        /** 执行动画 */
        if (v.helper === 0) {
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "3");
          f.failOpenDoorKiller(options);
          await wait(2);
          gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
        } else if (v.helper === 1 || v.helper === 2) {
          ani.play(v.helper === 1 ? "End_Repairman_ANI" : "End_Butcher_ANI");
          // 你终于开门了
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "3");
          await wait(1.5);
          // 我来帮你
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "20");
        } else if (v.helper === 3) {
          ani.play("End_Killer_ANI");
          // 你终于开门了
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "3");
          await wait(1.5);
          // 我们来帮你
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "19");
        }

        // 打斗动画播放完毕
        ani.once("finished", async () => {
          if (v.helper === 1 || v.helper === 2) {
            gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "21");
            await wait(1);
            gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
          } else if (v.helper === 3) {
            await wait(1);
            gi.UIManager.show(Constant.UI_PREFAB.VICTORY_POP);
          }
        });

        resolve(true);
      });
    },
    no6: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext72.variables as Variables;
        const f = levelContext72.functions;

        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        await f.transition255(options);
        f.hideOutSideAndButton(options);
        f.defaultNoOpenDoor(options);
        await f.transition0(options);

        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "22");

        await wait(3);

        const Act7 = v.actList[7];
        Act7.active = true;

        await wait(1.75);
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "24");
        await wait(1.5);
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "23");
        await wait(2);
        gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);

        resolve(true);
      });
    },
  },
};
