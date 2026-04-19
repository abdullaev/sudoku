import { MAX_LIVES } from './constants';
import { generateSolution, createPuzzle } from './engine';
import {
  state, saveState, clearState, assertGameActive, recordWin,
} from './state';
import {
  renderAll, renderCell, renderHighlights, renderLives,
  renderNumpadCounts, shakeCell, popHeart, renderWins,
} from './render';
import { showScreen } from './ui';
import { formatTime } from './utils';
import { startFireworks } from './fireworks';
import type { DifficultyKey } from './types';

export function selectCell(idx: number): void {
  state.selected = idx;
  renderHighlights();
}

export function handleInput(num: number): void {
  assertGameActive(state);
  const idx = state.selected;
  if (idx === -1 || state.locked[idx] || state.gameOver || state.won) return;

  if (num === 0) {
    state.board[idx] = 0;
    state.errors[idx] = false;
    renderCell(idx);
    renderHighlights();
    renderNumpadCounts();
    saveState();
    return;
  }

  state.board[idx] = num;

  if (num !== state.solution[idx]) {
    state.errors[idx] = true;
    popHeart();
    state.lives--;
    renderLives();
    shakeCell(idx);
    renderCell(idx);
    if (state.lives === 0) {
      state.gameOver = true;
      clearState();
      setTimeout(() => showScreen('gameover'), 500);
      return;
    }
  } else {
    state.errors[idx] = false;
    renderCell(idx);
    if (checkWin()) {
      state.won = true;
      clearState();
      setTimeout(triggerVictory, 400);
      return;
    }
  }

  renderHighlights();
  renderNumpadCounts();
  saveState();
}

export function checkWin(): boolean {
  assertGameActive(state);
  const { board, solution } = state;
  return board.every((v, i) => v === solution[i]);
}

export function triggerVictory(): void {
  assertGameActive(state);
  recordWin(state.difficulty);
  renderWins();
  const elapsed = Date.now() - state.startTime;
  const el = document.getElementById('victory-time');
  if (el) el.textContent = `Solved in ${formatTime(elapsed)}`;
  startFireworks();
  showScreen('victory');
}

export function startGame(difficulty: DifficultyKey): void {
  clearState();
  state.difficulty = difficulty;
  state.solution   = generateSolution();
  state.puzzle     = createPuzzle(state.solution, difficulty);
  state.board      = [...state.puzzle];
  state.locked     = state.puzzle.map(v => v !== 0);
  state.errors     = new Array<boolean>(81).fill(false);
  state.lives      = MAX_LIVES;
  state.selected   = -1;
  state.gameOver   = false;
  state.won        = false;
  state.startTime  = Date.now();
  showScreen('game');
  renderAll();
}
