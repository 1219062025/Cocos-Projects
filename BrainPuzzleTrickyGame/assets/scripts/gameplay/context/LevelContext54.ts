import { gi } from "../../../@framework/gi";
import { wait } from "../../utils/index";
import Constant from "../Constant";
import CommandManager from "../fungus/commands/CommandManager";
import { LevelContext } from "./ContextManager";

interface Variables {
  /** 女孩骨骼组件1 */
  girlSpine1: sp.Skeleton;
  /** 女孩骨骼组件2 */
  girlSpine2: sp.Skeleton;
  /** 绳子节点 */
  rope: cc.Node;
  /** 集齐的绳子数 */
  partCount: number;
}

export const levelContext54: LevelContext = {
  variables: {
    girlSpine1: null,
    girlSpine2: null,
    rope: null,
    partCount: 0,
  },
  functions: {
    start: (options) => {
      const v = levelContext54.variables as Variables;
      v.girlSpine1 = options.nodes[0].getComponent(sp.Skeleton);
      v.girlSpine2 = options.nodes[1].getComponent(sp.Skeleton);
      v.rope = options.nodes[2];
    },
    slideDown: (options) => {
      return new Promise(async (resolve) => {
        gi.EventManager.emit(Constant.EVENT.DISABLE_TOUCH);
        const v = levelContext54.variables as Variables;

        const partName = options.object.name;

        if (partName === "Coat") {
          v.girlSpine2.setSkin("B");
        }
        if (partName === "Pants") {
          CommandManager.executeCommand(
            "2-setActive",
            cc.find("trigger", v.girlSpine2.node)
          );
        }
        if (partName === "LightElectricWire") {
          setTimeout(() => {
            CommandManager.executeCommand(
              "3-setActive",
              cc.find("trigger", v.girlSpine2.node)
            );
          });
        }

        const part = cc.find(`Rope-${partName}`, v.rope);

        if (part) {
          v.partCount++;
          part.setPosition(0, -(v.partCount * part.height - part.height / 2));

          if (v.partCount === 1) {
            v.girlSpine2.node.setPosition(v.rope.getPosition());
          }

          const partY = v.girlSpine2.node.parent.convertToNodeSpaceAR(
            part.convertToWorldSpaceAR(cc.v2(0, 0))
          ).y;

          v.girlSpine2.setAnimation(0, "Girl-3", true);

          /** 滑下绳子后回调 */
          const callback = () => {
            v.girlSpine2.setAnimation(0, "Girl-2", true);

            if (["Curtain", "HempRope"].includes(partName)) {
              levelContext54.functions.killerDetected(options);
            } else {
              if (v.partCount === 11) {
                levelContext54.functions.done(options);
              } else {
                gi.EventManager.emit(
                  Constant.EVENT.SHOW_TIPS,
                  "1",
                  Constant.TIPS_TYPE.VOICE
                );
                gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);
              }
            }
            resolve(true);
          };

          (cc.tween(v.girlSpine2.node) as cc.Tween)
            .to(1, { y: partY - part.height * 0.45 })
            .call(() => callback())
            .start();
        } else {
          throw new Error("Part not found.");
        }
      });
    },

    stoneDown: (options) => {
      return new Promise(async (resolve) => {
        const [stone, bike1, bike2] = options.nodes;

        stone.active = true;
        (cc.tween(stone) as cc.Tween)
          .by(0.3, { y: 50 })
          .delay(0.2)
          .by(0.2, { y: -400 }, { easing: "sineOut" })
          .call(() => {
            stone.active = false;
            bike1.active = false;
            bike2.active = true;

            resolve(true);
          })
          .start();
      });
    },

    done: (options) => {
      const v = levelContext54.variables as Variables;
      gi.EventManager.emit(
        Constant.EVENT.SHOW_TIPS,
        "2",
        Constant.TIPS_TYPE.VOICE
      );

      CommandManager.executeCommand(
        "4-setActive",
        cc.find("trigger", v.girlSpine2.node)
      );
      v.girlSpine1.setAnimation(0, "Girl-4(1)", false);

      v.girlSpine1.setCompleteListener(async () => {
        v.girlSpine1.setCompleteListener(null);
        CommandManager.executeCommand(
          "overthrow",
          cc.find("trigger", v.girlSpine2.node)
        );
        gi.EventManager.emit(
          Constant.EVENT.SHOW_TIPS,
          "3",
          Constant.TIPS_TYPE.VOICE
        );
        v.girlSpine1.setAnimation(0, "Girl-4(2)", true);

        CommandManager.executeCommand(
          "5-setActive",
          cc.find("trigger", v.girlSpine2.node)
        );

        await wait(2);
        gi.EventManager.emit(
          Constant.EVENT.SHOW_TIPS,
          "5",
          Constant.TIPS_TYPE.VOICE
        );
        await wait(2);

        gi.UIManager.show(Constant.UI_PREFAB.VICTORY_POP);
        gi.EventManager.emit(Constant.EVENT.ENABLE_TOUCH);
      });
    },

    overthrow: (options) => {
      const [vase1, vase2] = options.nodes;

      (cc.tween(vase1) as cc.Tween).to(0.5, { angle: -90 }).start();

      (cc.tween(vase2) as cc.Tween).to(0.5, { angle: 90 }).start();
    },

    killerDetected: (options) => {
      return new Promise(async (resolve) => {
        const v = levelContext54.variables as Variables;

        CommandManager.executeCommand(
          "1-setActive",
          cc.find("trigger", v.girlSpine2.node)
        );

        gi.EventManager.emit(
          Constant.EVENT.SHOW_TIPS,
          "4",
          Constant.TIPS_TYPE.VOICE
        );

        await wait(1);

        gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
      });
    },

    showGirl: (options) => {
      const v = levelContext54.variables as Variables;
      v.girlSpine1.setSkin(options.skin);
      v.girlSpine2.setSkin(options.skin);
    },
    showGirlA: (options) => {
      levelContext54.functions.showGirl({ skin: "A" });
    },
    showGirlB: (options) => {
      levelContext54.functions.showGirl({ skin: "B" });
    },
    lose: () => {
      gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
    },
    victory: () => {
      gi.UIManager.show(Constant.UI_PREFAB.VICTORY_POP);
    },
  },
};
