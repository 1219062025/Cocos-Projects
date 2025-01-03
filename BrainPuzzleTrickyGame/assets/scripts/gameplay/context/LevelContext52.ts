import { gi } from "../../../@framework/gi";
import { wait } from "../../utils/index";
import Constant from "../Constant";
import CommandManager from "../fungus/commands/CommandManager";
import { LevelContext } from "./ContextManager";

interface KeyPoint {
  id: number;
  callback: string;
  des: string;
  isCompleted: boolean;
  ani?: string;
}

interface Variables {
  ANIMATION: cc.Node;
  curPoint: number;
  keyPoints: KeyPoint[];
}

export const levelContext52: LevelContext = {
  variables: {
    ANIMATION: null,
    curPoint: 0,
    keyPoints: [
      {
        id: 0,
        callback: "incomplete0",
        des: "锁门",
        isCompleted: false,
      },
      {
        id: 1,
        callback: "incomplete1",
        des: "打碎镜子",
        isCompleted: false,
      },
      {
        id: 2,
        callback: "incomplete2",
        des: "堵排风口",
        isCompleted: false,
      },
      {
        id: 3,
        callback: "incomplete3",
        des: "拔掉插头",
        isCompleted: false,
      },
      {
        id: 4,
        ani: "glue_ani",
        callback: "incomplete4",
        des: "修好地板",
        isCompleted: false,
      },
      {
        id: 5,
        ani: "battery_ani",
        callback: "incomplete5",
        des: "关收音机",
        isCompleted: false,
      },
      {
        id: 6,
        ani: "tape-ani",
        callback: "incomplete6",
        des: "封住柜子",
        isCompleted: false,
      },
      {
        id: 7,
        callback: "incomplete7",
        des: "关窗",
        isCompleted: false,
      },
      {
        id: 8,
        callback: "incomplete7",
        des: "擦窗",
        isCompleted: false,
      },
    ],
  },
  functions: {
    start: (options) => {
      const v = levelContext52.variables as Variables;

      const [ANIMATION] = options.nodes;

      v.ANIMATION = ANIMATION;

      gi.EventManager.emit(Constant.EVENT.START_GUIDE);
    },
    doneKeyPoint: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext52.variables as Variables;

        const kp = v.keyPoints.find((kp) => kp.id === v.curPoint);
        kp.isCompleted = true;

        if (kp.ani) {
          CommandManager.executeCommand(kp.ani, v.ANIMATION);
        }

        resolve(true);
      });
    },
    done: async (options) => {
      const v = levelContext52.variables as Variables;
      const f = levelContext52.functions;

      const incompletePoint = v.keyPoints.find((kp) => !kp.isCompleted) || null;

      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "1");

      gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);

      await wait(1.5);

      if (incompletePoint) {
        CommandManager.executeCommand(incompletePoint.callback, options.target);
      } else {
        const [mask, girl2, girl1, shadow, quilt] = options.nodes;
        (cc.tween(mask) as cc.Tween)
          .to(0.3, { opacity: 255 })
          .call(() => {
            girl1.active = false;
            quilt.active = false;
            girl2.active = true;
            shadow.active = true;
          })
          .delay(1)
          .to(0.3, { opacity: 0 })
          .call(async () => {
            gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "15");
            await wait(1.5);
            gi.UIManager.show(Constant.UI_PREFAB.VICTORY_POP);
            console.log("通关");
          })
          .start();
      }
    },
    /** 没锁门 */
    incomplete0: async (options) => {
      console.log("incomplete0 没锁门");

      const [door1, door2, door_open, killer] = options.nodes;
      door1.active = false;
      door2.active = false;
      door_open.active = true;
      killer.active = true;

      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "13");

      await wait(1.5);

      gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
    },
    /** 没打碎镜子 */
    incomplete1: async (options) => {
      console.log("incomplete1 没打碎镜子");

      const [mirror] = options.nodes;
      mirror.active = true;

      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "12");

      await wait(1.5);

      gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
    },
    /** 没堵排风口 */
    incomplete2: async (options) => {
      console.log("incomplete2 没堵排风口");

      const [airvent1, airvent2, sadako] = options.nodes;
      airvent1.active = false;
      airvent2.active = true;

      sadako.scale = 0;
      sadako.active = true;

      (cc.tween(sadako) as cc.Tween).to(0.2, { scale: 1 }).start();

      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "14");

      await wait(1.5);

      gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
    },
    /** 没拔插头 */
    incomplete3: async (options) => {
      console.log("incomplete3 没拔插头");

      const [sadako1, sadako2] = options.nodes;

      sadako1.scale = 0;
      sadako1.active = true;
      (cc.tween(sadako1) as cc.Tween).to(0.2, { scale: 1 }).start();

      await wait(0.7);
      (cc.tween(sadako1) as cc.Tween).to(0.1, { opacity: 0 }).start();

      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "14");

      sadako2.scale = 0.7;
      sadako2.active = true;
      (cc.tween(sadako2) as cc.Tween).to(0.2, { scale: 1 }).start();

      await wait(1.5);

      gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
    },
    /** 没修地板 */
    incomplete4: async (options) => {
      console.log("incomplete4 没修地板");

      const [floor1, floor2, floor3, killer] = options.nodes;
      floor1.active = false;
      floor2.active = false;
      floor3.active = true;
      killer.active = true;

      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "13");

      await wait(1.5);

      gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
    },
    /** 没关收音机 */
    incomplete5: async (options) => {
      console.log("incomplete5 没关收音机");

      const [sadako] = options.nodes;
      sadako.active = true;

      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "14");

      await wait(1.5);

      gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
    },
    /** 没封柜门 */
    incomplete6: async (options) => {
      console.log("incomplete6 没封柜门");

      const [wardrobe1, wardrobe2, killer] = options.nodes;
      wardrobe1.active = false;
      wardrobe2.active = true;
      killer.active = true;

      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "13");

      await wait(1.5);

      gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
    },
    /** 没关窗或者没关手印 */
    incomplete7: async (options) => {
      console.log("incomplete7 没关窗或者没擦窗");

      const [palmPrint] = options.nodes;
      const ani = palmPrint.getComponent(cc.Animation);

      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "14");

      ani.play();
      ani.on("finished", async () => {
        await wait(1);

        gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
      });
    },
    /** 柜子 */
    switchWardrobe: (options) => {
      const [wardrobe_open, wardrobe_close] = options.nodes;
      setInterval(() => {
        wardrobe_close.active = wardrobe_open.active;
        wardrobe_open.active = !wardrobe_open.active;
      }, 500);
    },
    /** 电脑屏幕 */
    switchComputer: (options) => {
      const [computer_1, computer_2] = options.nodes;
      setInterval(() => {
        computer_2.active = computer_1.active;
        computer_1.active = !computer_1.active;
      }, 100);
    },
    /** 女孩子的脸 */
    switchFace: (options) => {
      const [face] = options.nodes;
      setInterval(() => {
        face.active = !face.active;
      }, 500);
    },
    tweenA: (options) => {
      (cc.tween(options.target) as cc.Tween)
        .to(0.1, { angle: 2, scale: 0.9 })
        .to(0.1, { angle: 0, scale: 1 })
        .union()
        .repeatForever()
        .start();
    },
    tweenB: (options) => {
      (cc.tween(options.target) as cc.Tween)
        .to(0.1, { angle: 1, scaleX: 0.98 })
        .to(0.1, { angle: 0, scaleX: 1 })
        .union()
        .repeatForever()
        .start();
    },
    tweenC: (options) => {
      (cc.tween(options.target) as cc.Tween)
        .to(0.1, { angle: 2, scaleY: 0.8 })
        .to(0.1, { angle: 0, scaleY: 1 })
        .union()
        .repeatForever()
        .start();
    },
    tweenD: (options) => {
      (cc.tween(options.target) as cc.Tween)
        .to(0.1, { scaleY: 0.99 })
        .to(0.1, { scaleY: 1 })
        .union()
        .repeatForever()
        .start();
    },
    tweenE: (options) => {
      (cc.tween(options.target) as cc.Tween)
        .by(0.8, { y: 20 })
        .by(0.8, { y: -20 })
        .union()
        .repeatForever()
        .start();
    },
  },
};
