export type LevelInfo = {
  Map: number[][];
};

const LevelList: LevelInfo[] = [
  {
    Map: [
      [6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
      [6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
      [6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4],
      [6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4],
      [7, 7, 7, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
      [7, 7, 7, 7, 7, 7, 7, 7, 0, 0, 0, 0, 0, 2, 2, 2, 2],
      [7, 7, 7, 7, 7, 7, 7, 7, 0, 2, 0, 0, 0, 2, 2, 2, 2],
      [4, 4, 4, 4, 4, 4, 4, 4, 0, 3, 3, 0, 3, 3, 3, 3, 3],
      [4, 4, 4, 4, 4, 4, 4, 4, 0, 3, 3, 3, 3, 3, 3, 3, 3],
      [4, 4, 4, 4, 4, 4, 4, 4, 0, 3, 3, 3, 3, 3, 3, 3, 3],
      [6, 6, 6, 6, 0, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7],
      [6, 6, 6, 6, 0, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7],
      [6, 6, 6, 6, 0, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7],
      [2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 0, 4, 4],
      [2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 0, 4, 4],
      [2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 0, 4, 4],
      [7, 7, 7, 7, 7, 7, 7, 7, 7, 0, 6, 6, 6, 6, 6, 6, 6],
      [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 0, 6, 6, 6, 6, 6, 6],
      [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 0, 6, 6, 6, 6, 6],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 3, 3, 3, 3],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 3, 3, 3, 3],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 3, 3, 3, 3],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 6, 6, 6, 6],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 6, 6, 6, 6],
      [0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 0],
      [0, 7, 7, 7, 7, 7, 7, 7, 0, 4, 4, 4, 4, 6, 6, 6, 0],
      [0, 7, 7, 7, 7, 7, 7, 7, 0, 4, 4, 4, 4, 6, 6, 6, 0],
      [0, 7, 7, 7, 7, 7, 7, 7, 0, 4, 4, 4, 4, 6, 6, 6, 0],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 2, 2, 2, 2],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 2, 2, 2, 2],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 0, 5, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 0, 5, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 0, 5, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 0, 5, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 0, 5, 5, 5, 5, 5, 2, 2, 2, 0],
      [2, 2, 2, 2, 2, 2, 2, 0, 5, 5, 5, 5, 5, 2, 2, 2, 0],
      [2, 2, 2, 2, 2, 2, 2, 0, 5, 5, 5, 5, 5, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 0, 5, 5, 5, 5, 5, 2, 2, 2, 2],
      [2, 2, 2, 6, 6, 7, 0, 7, 7, 7, 7, 7, 7, 2, 2, 2, 2],
      [2, 2, 2, 6, 6, 7, 0, 7, 7, 7, 7, 7, 7, 2, 2, 2, 0],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 6, 6, 6, 6],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 6, 6, 6, 6],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 6, 6, 6, 6],
      [0, 7, 7, 7, 7, 7, 7, 7, 0, 4, 4, 4, 4, 6, 6, 6, 0],
      [0, 7, 7, 7, 7, 7, 7, 7, 0, 4, 4, 4, 4, 6, 6, 6, 0],
      [0, 7, 7, 7, 7, 7, 7, 7, 0, 4, 4, 4, 4, 6, 6, 6, 0],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 2, 2, 2, 2],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 2, 2, 2, 2],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 0, 5, 2, 2, 2, 0],
      [2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 0, 5, 2, 2, 2, 0],
      [2, 2, 2, 6, 6, 7, 0, 7, 7, 7, 7, 7, 7, 2, 2, 2, 0]
    ]
  }
];

export default LevelList;
