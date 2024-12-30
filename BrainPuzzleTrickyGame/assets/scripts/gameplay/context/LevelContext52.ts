import { LevelContext } from "./ContextManager";

interface Variables {}

export const levelContext52: LevelContext = {
  variables: {},
  functions: {
    start: (options) => {
      const v = levelContext52.variables as Variables;
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
  },
};
