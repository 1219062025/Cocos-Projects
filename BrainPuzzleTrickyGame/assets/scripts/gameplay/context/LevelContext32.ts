import { LevelContext } from "./ContextManager";

interface Variables {}

export const levelContext32: LevelContext = {
  variables: {},
  functions: {
    start: (options) => {
      const v = levelContext32.variables as Variables;
    },
  },
};
