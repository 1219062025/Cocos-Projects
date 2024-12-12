import { LevelContext } from "./ContextManager";

interface Variables {
  sp: number;
  energy: number;
  test: {
    a: number;
  };
  vec2: cc.Vec2;
}

export const levelContext57: LevelContext = {
  variables: {
    sp: 50,
    energy: 100,
    test: {
      a: 10,
    },
    vec2: cc.v2(1, 10),
  },
  functions: {
    print: () => {
      const variable = levelContext57.variables as Variables;

      if (variable.vec2.x === 1) {
        console.log(`x: ${variable.vec2.x}, y: ${variable.vec2.y}`);
      }
    },
    getVariable: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(20);
        }, 2000);
      });
    },
  },
};
