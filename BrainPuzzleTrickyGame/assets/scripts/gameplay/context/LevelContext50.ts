import { LevelContext } from "./ContextManager";

export const levelContext50: LevelContext = {
  variables: {
    hp: 100,
    score: 0,
  },
  functions: {
    run: () => console.log("Running in level 50"),
  },
};
