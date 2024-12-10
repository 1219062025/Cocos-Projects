import { LevelContext } from "./ContextManager";

interface Variables {
  sp: number;
  energy: number;
}

export const levelContext57: LevelContext = {
  variables: {
    sp: 50,
    energy: 100,
  },
  functions: {
    jump: () => {
      const variable = levelContext57.variables as Variables;
    },
  },
};
