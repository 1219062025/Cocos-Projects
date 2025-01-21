import { gi } from "../../../@framework/gi";
import DragObject from "../../entities/DragObject";
import { wait } from "../../utils/index";
import Constant from "../Constant";
import { LevelContext } from "./ContextManager";

interface Variables {
  curPoint: number;
  completedPoint: number;
  manNode: cc.Node[];
  dishwasher: boolean;
}

export const levelContext38: LevelContext = {
  variables: {
    curPoint: 0,
    completedPoint: 0,
    manNode: [],
    dishwasher: false,
  },
  functions: {
    start: (options) => {
      return new Promise(async (resolve) => {
        await wait(2);
        gi.EventManager.emit(Constant.EVENT.START_GUIDE);
        resolve(true);
      });
    },
    saveManNode: (options) => {
      const v = levelContext38.variables as Variables;

      v.manNode = options.nodes;
    },
    triggerMan: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext38.variables as Variables;
        const f = levelContext38.functions;
        const i = v.curPoint - 1;
        const man = v.manNode[0].parent;

        switch (v.curPoint) {
          case 12:
            man.getComponent(DragObject).disable = true;
            gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "4");
            v.manNode[i].parent.active = true;
            man.opacity = 0;
            break;
          case 13:
            man.getComponent(DragObject).disable = true;
            gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "2");
            v.manNode[i].parent.active = true;
            man.opacity = 0;
            v.dishwasher = true;
            break;
          default:
            man.getComponent(DragObject).disable = true;
            gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "1");
            v.manNode[i].parent.active = true;
            man.opacity = 0;
            await wait(2);
            v.manNode[i].parent.active = false;
            f["completePoint"](options);
            man.getComponent(DragObject).disable = false;
            break;
        }
        resolve(true);
      });
    },
    completePoint: async (options) => {
      const v = levelContext38.variables as Variables;
      const man = v.manNode[0].parent;

      if (++v.completedPoint === 9) {
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "5");
        v.manNode[10].parent.active = true;
        await wait(2);
        gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "6");
        await wait(1);
        gi.UIManager.show(Constant.UI_PREFAB.VICTORY_POP);
      } else {
        man.opacity = 255;
      }
    },
    Trash: (options) => {
      const v = levelContext38.variables as Variables;
      const f = levelContext38.functions;

      const [man8, man12] = options.nodes;
      const man = v.manNode[0].parent;

      man12.active = false;
      man8.active = true;

      (cc.tween(man8) as cc.Tween)
        .by(0.5, { x: 20 }, { easing: "sineInOut" })
        .by(0.8, { x: -400 }, { easing: "sineOut" })
        .by(0.1, { y: 100 })
        .delay(0.5)
        .call(() => {
          man12.setPosition(man8.getPosition());
          man12.active = true;
          man8.active = false;

          (cc.tween(man12) as cc.Tween)
            .by(0.8, { x: 380, y: -100 }, { easing: "sineOut" })
            .delay(0.1)
            .call(() => {
              gi.EventManager.emit(Constant.EVENT.SHOW_VOICE, "1");
              man12.active = false;
              man.getComponent(DragObject).disable = false;
              f["completePoint"](options);
            })
            .start();
        })
        .start();
    },
    Light2_Node: (options) => {
      (cc.tween(options.target) as cc.Tween)
        .to(0.5, { angle: -3 }, { easing: "sineInOut" })
        .to(0.5, { angle: 3 }, { easing: "sineInOut" })
        .union()
        .repeatForever()
        .start();
    },
    light_2: (options) => {
      (cc.tween(options.target) as cc.Tween)
        .blink(0.8, 6)
        .delay(0.2)
        .blink(0.5, 4)
        .delay(0.2)
        .blink(0.5, 4)
        .delay(0.8)
        .union()
        .repeatForever()
        .start();
    },
    baby1: (options) => {
      (cc.tween(options.target) as cc.Tween)
        .to(0.3, { angle: -2, scale: 1.05 })
        .to(0.3, { angle: 2, scale: 1 })
        .union()
        .repeatForever()
        .start();
    },
    baby2: (options) => {
      (cc.tween(options.target) as cc.Tween)
        .to(0.8, { scale: 1.05 })
        .to(0.8, { scale: 1 })
        .union()
        .repeatForever()
        .start();
    },
    Toilet: (options) => {
      (cc.tween(options.target) as cc.Tween)
        .to(0.1, { scaleY: 0.9 })
        .to(0.1, { scaleY: 1 })
        .union()
        .repeatForever()
        .start();
    },
  },
};
