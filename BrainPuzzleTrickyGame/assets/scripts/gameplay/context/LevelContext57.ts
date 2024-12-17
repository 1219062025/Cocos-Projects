import { LevelContext } from "./ContextManager";

interface Variables {
  sp: string;
  vec2: cc.Vec2;
}

export const levelContext57: LevelContext = {
  variables: {
    sp: "sp1",
    vec2: cc.v2(1, 10),
  },
  functions: {
    start: (options) => {
      const variable = levelContext57.variables as Variables;

      console.log("start");
    },
    print: (options) => {
      const variable = levelContext57.variables as Variables;
    },
    getVariable: () => {
      return true;
    },
  },
};
