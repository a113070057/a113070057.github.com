import { Difficulty, SudokuBoard, SudokuCell } from '../types';

// Helper function to check if placing a number is valid
export function isValidPlacement(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return false;
  }

  // Check 3x3 grid box
  const boxRowStart = Math.floor(row / 3) * 3;
  const boxColStart = Math.floor(col / 3) * 3;
  for (let r = boxRowStart; r < boxRowStart + 3; r++) {
    for (let c = boxColStart; c < boxColStart + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) return false;
    }
  }

  return true;
}

// Backtracking solver to solve/verify board correctness
export function solveSudokuBoard(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        // Try numbers 1 to 9
        // Randomize order to get varied solves if desired, but here standard 1-9 is fine
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(board, r, c, num)) {
            board[r][c] = num;
            if (solveSudokuBoard(board)) {
              return true;
            }
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Helper to fill empty board randomly using backtracking
function fillBoard(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        // Try randomizing 1-9 array
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValidPlacement(board, r, c, num)) {
            board[r][c] = num;
            if (fillBoard(board)) {
              return true;
            }
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Generate Sudoku puzzle and solution
export function generateSudoku(difficulty: Difficulty): { board: SudokuBoard; solution: number[][] } {
  // 1. Create a fully empty board
  const emptyBoard: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  // 2. Generate a fully solved random board
  fillBoard(emptyBoard);

  // Deep copy for the solution
  const solution = emptyBoard.map(row => [...row]);

  // 3. Remove cells depending on the difficulty
  // easy: 40-45 clues (remove ~38-41)
  // medium: 33-39 clues (remove ~44-48)
  // hard: 26-32 clues (remove ~50-55)
  // expert: 21-25 clues (remove ~57-60)
  // hell: 17-20 clues (remove ~62-64)
  let cellsToRemove = 38;
  switch (difficulty) {
    case 'easy':
      cellsToRemove = 36;
      break;
    case 'medium':
      cellsToRemove = 45;
      break;
    case 'hard':
      cellsToRemove = 53;
      break;
    case 'expert':
      cellsToRemove = 59;
      break;
    case 'hell':
      cellsToRemove = 64;
      break;
  }

  const puzzleBoard = emptyBoard.map(row => [...row]);
  let removed = 0;

  // Attempt to remove cells
  // To keep it simple and ultra-robust, we randomly select a filled cells and empty it
  // until we reach cellsToRemove
  const coordinates: { r: number; c: number }[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      coordinates.push({ r, c });
    }
  }
  // Shuffle coordinates
  coordinates.sort(() => Math.random() - 0.5);

  for (const { r, c } of coordinates) {
    if (removed >= cellsToRemove) break;
    puzzleBoard[r][c] = 0;
    removed++;
  }

  // 4. Construct response as SudokuBoard
  const board: SudokuBoard = puzzleBoard.map((row, rIdx) =>
    row.map((val, cIdx) => ({
      row: rIdx,
      col: cIdx,
      value: val,
      isInitial: val !== 0,
      notes: [],
      isError: false,
    }))
  );

  return { board, solution };
}

// Format time from seconds to MM:SS
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Convert MM:SS back to seconds
export function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return 0;
}
