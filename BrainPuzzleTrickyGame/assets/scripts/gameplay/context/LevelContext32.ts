import { gi } from "../../../@framework/gi";
import { wait } from "../../utils/index";
import Constant from "../Constant";
import { LevelContext } from "./ContextManager";

interface KeyPoint {
  id: number;
  callback?: string;
  des: string;
  isCompleted: boolean;
  ani?: string;
}

interface Variables {
  /** 扔掉的垃圾数 */
  garbage: number;
  curPoint: number;
  keyPoints: KeyPoint[];
  /** 女人洗澡触发器节点 */
  women_trigger: cc.Node;
}

export const levelContext32: LevelContext = {
  variables: {
    garbage: 0,
    curPoint: 0,
    keyPoints: [
      {
        id: 0,
        des: "清理蜘蛛网",
        isCompleted: false,
      },
      {
        id: 1,
        des: "擦干净窗户",
        isCompleted: false,
      },
      {
        id: 2,
        des: "清理完垃圾",
        isCompleted: false,
      },
      {
        id: 3,
        des: "整理好书籍",
        isCompleted: false,
      },
      {
        id: 4,
        des: "拖地",
        isCompleted: false,
      },
      {
        id: 5,
        des: "给猫洗澡",
        isCompleted: false,
      },
      {
        id: 6,
        des: "洗干净地毯",
        isCompleted: false,
      },
      {
        id: 7,
        des: "修好马桶",
        isCompleted: false,
      },
      {
        id: 8,
        des: "补好地板",
        isCompleted: false,
      },
      {
        id: 9,
        des: "洗澡换新衣服",
        isCompleted: false,
      },
    ],
  },
  functions: {
    start: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext32.variables as Variables;

        const [women_trigger] = options.nodes;

        v.women_trigger = women_trigger;

        await wait(2);

        gi.EventManager.emit(Constant.EVENT.START_GUIDE);
      });
    },
    doneKeyPoint: (options) => {
      const v = levelContext32.variables as Variables;
      v.keyPoints[v.curPoint].isCompleted = true;

      // 只剩下没洗澡换新衣服了
      if (v.keyPoints.find((kp) => !kp.isCompleted).id === 9) {
        v.women_trigger.active = true;
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "15");
      }

      // console.log(v.keyPoints[v.curPoint].des, "完成");
    },
    garbageGuide: (options) => {
      if (options.object.node.name === "Garbage0") {
        gi.EventManager.emit(Constant.EVENT.COMPLETE_GUIDE, "0");
      } else if (options.object.node.name === "Garbage1") {
        gi.EventManager.emit(Constant.EVENT.COMPLETE_GUIDE, "1");
      }
    },
    RagAni: (options) => {
      return new Promise((resolve) => {
        const v = levelContext32.variables as Variables;

        const [Rag_ani] = options.nodes;

        Rag_ani.active = true;
        (cc.tween(Rag_ani) as cc.Tween)
          .by(0.2, { x: 70 })
          .by(0.2, { x: -70 })
          .union()
          .repeat(2)
          .call(() => {
            Rag_ani.active = false;
            resolve(true);
          })
          .start();
      });
    },
    mop: (options) => {
      return new Promise((resolve) => {
        const v = levelContext32.variables as Variables;

        const [mop] = options.nodes;
        const ani = mop.getComponent(cc.Animation);
        ani.play();

        ani.once("finished", () => {
          resolve(true);
        });
      });
    },
    showWindow2: (options) => {
      return new Promise((resolve) => {
        const v = levelContext32.variables as Variables;
        const [Window2, Cleaner_ani] = options.nodes;

        Window2.scale = 0;
        Window2.opacity = 0;
        Window2.active = true;
        (cc.tween(Window2) as cc.Tween)
          .to(0.2, { scale: 1, opacity: 255 })
          .start();

        Cleaner_ani.active = true;
        (cc.tween(Cleaner_ani) as cc.Tween)
          .to(0.2, { angle: -5 })
          .to(0.2, { angle: 5 })
          .union()
          .repeat(2)
          .call(() => {
            Cleaner_ani.active = false;
            resolve(true);
          })
          .start();
      });
    },
    /** 洗澡 */
    shower: (options) => {
      const v = levelContext32.variables as Variables;

      const [woman] = options.nodes;

      const womenSp = woman.getComponent(sp.Skeleton);

      woman.active = true;

      womenSp.setCompleteListener(async () => {
        womenSp.setAnimation(0, "Woman3", true);
      });

      v.keyPoints[9].isCompleted = true;
      gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "16");
    },
    /** 男人进门 */
    entrance: (options) => {
      const v = levelContext32.variables as Variables;

      const [door1, door2, man] = options.nodes;
      door1.active = false;
      door2.active = true;

      gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);

      const manSp = man.getComponent(sp.Skeleton);

      manSp.setAnimation(0, "Man2(1)", false);

      manSp.setCompleteListener(async () => {
        manSp.setAnimation(0, "Man2(2)", true);

        await wait(0.5);

        if (v.keyPoints.every((kp) => kp.isCompleted)) {
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "18");
          await wait(1.5);
          gi.UIManager.show(Constant.UI_PREFAB.VICTORY_POP);
        } else {
          gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "17");
          await wait(1.5);
          gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
        }
      });
    },
    tween1: (options) => {
      (cc.tween(options.target) as cc.Tween)
        .to(0.1, { scaleY: 0.94 })
        .to(0.1, { scaleY: 1 })
        .union()
        .repeatForever()
        .start();
    },
  },
};
