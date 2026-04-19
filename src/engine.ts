import { shuffle } from './utils';
import { DIFFICULTY } from './constants';
import type { DifficultyKey } from './types';

function isValid(board: number[], idx: number, num: number): boolean {
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (board[row * 9 + i] === num) return false;
    if (board[i * 9 + col] === num) return false;
    const br = boxRow + Math.floor(i / 3);
    const bc = boxCol + (i % 3);
    if (board[br * 9 + bc] === num) return false;
  }
  return true;
}

function solve(board: number[]): boolean {
  const idx = board.indexOf(0);
  if (idx === -1) return true;

  for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (isValid(board, idx, n)) {
      board[idx] = n;
      if (solve(board)) return true;
      board[idx] = 0;
    }
  }
  return false;
}

export function generateSolution(): number[] {
  const board = new Array<number>(81).fill(0);
  solve(board);
  return board;
}

function countSolutions(board: number[], limit = 2): number {
  const idx = board.indexOf(0);
  if (idx === -1) return 1;

  let count = 0;
  for (let n = 1; n <= 9; n++) {
    if (isValid(board, idx, n)) {
      board[idx] = n;
      count += countSolutions(board, limit);
      board[idx] = 0;
      if (count >= limit) return count;
    }
  }
  return count;
}

export function createPuzzle(solution: number[], difficulty: DifficultyKey): number[] {
  const puzzle = [...solution];
  const positions = shuffle([...Array(81).keys()]);
  let removed = 0;
  const target = DIFFICULTY[difficulty].remove;

  for (const idx of positions) {
    if (removed >= target) break;
    const backup = puzzle[idx];
    puzzle[idx] = 0;
    if (countSolutions([...puzzle]) === 1) {
      removed++;
    } else {
      puzzle[idx] = backup;
    }
  }
  return puzzle;
}
