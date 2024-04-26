import { Unit } from './Game';

const Level = {
  Level1: {
    Map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]
    ],
    LevelUnitInfos: [
      { type: Unit.item0, level: 0, row: 2, col: 7 },
      { type: Unit.adorn2, level: 0, row: 2, col: 9 },
      { type: Unit.item4, level: 0, row: 2, col: 11 },
      { type: Unit.item4, level: 0, row: 4, col: 7 },
      { type: Unit.item3, level: 0, row: 4, col: 9 },
      { type: Unit.item2, level: 0, row: 5, col: 6 },
      { type: Unit.adorn5, level: 0, row: 6, col: 7 },
      { type: Unit.item3, level: 0, row: 7, col: 5 },
      { type: Unit.adorn2, level: 0, row: 7, col: 6 },
      { type: Unit.item4, level: 0, row: 7, col: 10 },
      { type: Unit.item3, level: 0, row: 9, col: 7 },
      { type: Unit.item2, level: 0, row: 9, col: 8 },
      { type: Unit.item2, level: 0, row: 10, col: 6 },
      { type: Unit.item0, level: 0, row: 10, col: 8 },
      { type: Unit.item1, level: 0, row: 10, col: 9 },
      { type: Unit.item1, level: 0, row: 12, col: 3 },
      { type: Unit.item0, level: 0, row: 13, col: 3 },
      { type: Unit.item0, level: 0, row: 13, col: 7 },
      { type: Unit.item2, level: 0, row: 14, col: 2 },
      { type: Unit.item0, level: 0, row: 14, col: 4 },
      { type: Unit.item0, level: 0, row: 14, col: 6 },
      { type: Unit.item2, level: 0, row: 15, col: 7 },
      { type: Unit.item4, level: 0, row: 16, col: 3 },
      { type: Unit.item1, level: 0, row: 16, col: 5 },
      { type: Unit.adorn4, level: 0, row: 16, col: 6 },
      { type: Unit.item1, level: 0, row: 17, col: 1 },
      { type: Unit.item2, level: 0, row: 18, col: 1 },
      { type: Unit.adorn1, level: 0, row: 18, col: 3 },
      { type: Unit.adorn0, level: 0, row: 19, col: 4 }
    ]
  }
};

export type LevelUnitInfo = {
  type: Unit;
  level: number;
  row: number;
  col: number;
};

export default Level;
