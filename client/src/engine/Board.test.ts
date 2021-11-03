import { act } from "react-dom/test-utils";
import Board, { CellIndex, CellState } from "./Board";
import Cell from "./Cell";

test("create valid board", () => {
  let mines = 35;
  let board = new Board(10, 10, mines);
  expect(board).toBeDefined();
  expect(board.size()).toBe(100);

  let actualMines = 0;
  for (let row = 0; row < board.rows; row++) {
    for (let column = 0; column < board.columns; column++) {
      if (board.getCellState({ row, column }) === CellState.UnclickedMine) {
        actualMines++;
      }
    }
  }
  expect(actualMines).toBe(mines);
});

test("create board with too many mines", () => {
  expect(() => new Board(10, 10, 51)).toThrow("Please provide a number of mines between 0 and 50");
});

test("create board too big", () => {
  expect(() => new Board(200, 50, 51)).toThrow("Please provide a number of rows between 1 and 100");
  expect(() => new Board(50, 200, 51)).toThrow("Please provide a number of columns between 1 and 100");
});

test("getCellNumMineNeighbors returns proper number of neighbors with mines", () => {
  let board = new Board(10, 10, 0);

  // Check cell in the middle of board
  expect(board.getCellNumNeighborMines({ row: 5, column: 5 })).toBe(0);
  board.board[4][4] = CellState.UnclickedMine;
  expect(board.getCellNumNeighborMines({ row: 5, column: 5 })).toBe(1);
  board.board[4][5] = CellState.UnclickedMine;
  expect(board.getCellNumNeighborMines({ row: 5, column: 5 })).toBe(2);
  board.board[4][6] = CellState.UnclickedMine;
  expect(board.getCellNumNeighborMines({ row: 5, column: 5 })).toBe(3);
  board.board[5][4] = CellState.UnclickedMine;
  expect(board.getCellNumNeighborMines({ row: 5, column: 5 })).toBe(4);
  board.board[5][6] = CellState.UnclickedMine;
  expect(board.getCellNumNeighborMines({ row: 5, column: 5 })).toBe(5);
  board.board[6][4] = CellState.UnclickedMine;
  expect(board.getCellNumNeighborMines({ row: 5, column: 5 })).toBe(6);
  board.board[6][5] = CellState.UnclickedMine;
  expect(board.getCellNumNeighborMines({ row: 5, column: 5 })).toBe(7);
  board.board[6][6] = CellState.UnclickedMine;
  expect(board.getCellNumNeighborMines({ row: 5, column: 5 })).toBe(8);

  // Check cell on the edge of board with neighbors out of bounds
  expect(board.getCellNumNeighborMines({ row: 9, column: 9 })).toBe(0);
  board.board[8][8] = CellState.UnclickedMine;
  expect(board.getCellNumNeighborMines({ row: 9, column: 9 })).toBe(1);
});

test("clicking an empty board (no mines) should click all tiles", () => {
  const rows = 10;
  const columns = 10;
  let board = new Board(rows, columns, 0);
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      expect(board.board[row][column]).toBe(CellState.Unclicked);
    }
  }

  board.click({ row: 5, column: 5 });
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      expect(board.board[row][column]).toBe(CellState.Clicked);
    }
  }
});

test("clicking an empty cell floodfills all cells with no neighboring mines", () => {
  /**
   * 0 0 0 m m m m      1 1 1 m m m m
   * 0 0 0 m m m m      1 1 1 m m m m
   * 0 0 0 0 0 m m      1 1 1 1 1 m m
   * 0 0 0 0 0 0 m  ->  1 1 1 1 1 0 m
   * 0 0 0 0 0 0 0      1 1 1 1 1 0 0
   * 0 0 0 m m m m      1 1 1 m m m m
   * c 0 0 m m m m      1 1 1 m m m m
   */
  const mines = [
    { row: 0, column: 3 },
    { row: 0, column: 4 },
    { row: 0, column: 5 },
    { row: 0, column: 6 },
    { row: 1, column: 3 },
    { row: 1, column: 4 },
    { row: 1, column: 5 },
    { row: 1, column: 6 },
    { row: 2, column: 5 },
    { row: 2, column: 6 },
    { row: 3, column: 6 },
    { row: 5, column: 3 },
    { row: 5, column: 4 },
    { row: 5, column: 5 },
    { row: 5, column: 6 },
    { row: 6, column: 3 },
    { row: 6, column: 4 },
    { row: 6, column: 5 },
    { row: 6, column: 6 },
  ];
  const clicked = [
    { row: 0, column: 0 },
    { row: 0, column: 1 },
    { row: 0, column: 2 },
    { row: 1, column: 0 },
    { row: 1, column: 1 },
    { row: 1, column: 2 },
    { row: 2, column: 0 },
    { row: 2, column: 1 },
    { row: 2, column: 2 },
    { row: 2, column: 3 },
    { row: 2, column: 4 },
    { row: 3, column: 0 },
    { row: 3, column: 1 },
    { row: 3, column: 2 },
    { row: 3, column: 3 },
    { row: 4, column: 4 },
    { row: 4, column: 0 },
    { row: 4, column: 1 },
    { row: 4, column: 2 },
    { row: 4, column: 3 },
    { row: 4, column: 4 },
    { row: 5, column: 0 },
    { row: 5, column: 1 },
    { row: 5, column: 2 },
    { row: 6, column: 0 },
    { row: 6, column: 1 },
    { row: 6, column: 2 },
  ];
  const unclicked = [
    { row: 3, column: 5 },
    { row: 4, column: 5 },
    { row: 4, column: 6 },
  ];
  let board = new Board(7, 7, 0);
  setMines(board, mines);
  board.click({ row: 6, column: 0 });
  verifyState(board, clicked, CellState.Clicked);
  verifyState(board, unclicked, CellState.Unclicked);
  verifyState(board, mines, CellState.UnclickedMine);
});

test("clicking a mine sets all mines to ClickedMine", () => {
  /**
   * 0 0 0 m m m m      0 0 0 x x x x
   * 0 0 0 m m m m      0 0 0 x x x x
   * 0 0 0 0 0 m m      0 0 0 0 0 x x
   * 0 0 0 0 0 0 m  ->  0 0 0 0 0 0 x
   * 0 0 0 0 0 0 1      0 0 0 0 0 0 1
   * 0 0 0 m m m m      0 0 0 x x x x
   * 0 0 0 c m m m      0 0 0 x x x x
   */
  const mines = [
    { row: 0, column: 3 },
    { row: 0, column: 4 },
    { row: 0, column: 5 },
    { row: 0, column: 6 },
    { row: 1, column: 3 },
    { row: 1, column: 4 },
    { row: 1, column: 5 },
    { row: 1, column: 6 },
    { row: 2, column: 5 },
    { row: 2, column: 6 },
    { row: 3, column: 6 },
    { row: 5, column: 3 },
    { row: 5, column: 4 },
    { row: 5, column: 5 },
    { row: 5, column: 6 },
    { row: 6, column: 3 },
    { row: 6, column: 4 },
    { row: 6, column: 5 },
    { row: 6, column: 6 },
  ];
  const unclicked = [
    { row: 0, column: 0 },
    { row: 0, column: 1 },
    { row: 0, column: 2 },
    { row: 1, column: 0 },
    { row: 1, column: 1 },
    { row: 1, column: 2 },
    { row: 2, column: 0 },
    { row: 2, column: 1 },
    { row: 2, column: 2 },
    { row: 2, column: 3 },
    { row: 2, column: 4 },
    { row: 3, column: 0 },
    { row: 3, column: 1 },
    { row: 3, column: 2 },
    { row: 3, column: 3 },
    { row: 4, column: 4 },
    { row: 4, column: 0 },
    { row: 4, column: 1 },
    { row: 4, column: 2 },
    { row: 4, column: 3 },
    { row: 4, column: 4 },
    { row: 5, column: 0 },
    { row: 5, column: 1 },
    { row: 5, column: 2 },
    { row: 6, column: 0 },
    { row: 6, column: 1 },
    { row: 6, column: 2 },
    { row: 3, column: 5 },
    { row: 4, column: 5 },
  ];
  const clicked = [{ row: 4, column: 6 }];
  let board = new Board(7, 7, 0);
  setMines(board, mines);
  verifyState(board, mines, CellState.UnclickedMine);
  board.click({ row: 4, column: 6 });
  verifyState(board, clicked, CellState.Clicked);
  board.click({ row: 6, column: 3 });
  verifyState(board, clicked, CellState.Clicked);
  verifyState(board, unclicked, CellState.Unclicked);
  verifyState(board, mines, CellState.ClickedMine);
});

let setMines = (board: Board, mineList: CellIndex[]) => {
  mineList.forEach((cellIndex) => {
    board.board[cellIndex.row][cellIndex.column] = CellState.UnclickedMine;
  });
};

let verifyState = (board: Board, cellList: CellIndex[], state: CellState) => {
  cellList.forEach((cellIndex) => {
    expect(board.board[cellIndex.row][cellIndex.column]).toBe(state);
  });
};