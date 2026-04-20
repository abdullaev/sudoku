import { MAX_LIVES } from "./constants";
import { generateSolution, createPuzzle } from "./engine";
import { state, saveState, clearState, assertGameActive, recordWin } from "./state";
import {
  renderAll,
  renderCell,
  renderHighlights,
  renderLives,
  renderNumpadCounts,
  renderHintButton,
  renderNoteButton,
  shakeCell,
  popHeart,
  renderWins,
} from "./render";
import { showScreen } from "./ui";
import { formatTime } from "./utils";
import { startFireworks } from "./fireworks";
import type { DifficultyKey } from "./types";

function getPeers(idx: number): number[] {
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  const peers = new Set<number>();
  for (let c = 0; c < 9; c++) peers.add(row * 9 + c);
  for (let r = 0; r < 9; r++) peers.add(r * 9 + col);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) peers.add((boxRow + r) * 9 + (boxCol + c));
  peers.delete(idx);
  return [...peers];
}

function clearNoteFromPeers(idx: number, num: number): void {
  for (const peer of getPeers(idx)) {
    const notes = state.notes[peer];
    const pos = notes.indexOf(num);
    if (pos !== -1) {
      notes.splice(pos, 1);
      renderCell(peer);
    }
  }
}

export function giveHint(): void {
  assertGameActive(state);
  if (state.gameOver || state.won || state.hints <= 0) return;
  const { board, solution, locked, errors } = state;
  const empty = board.reduce<number[]>((acc, v, i) => {
    if (!v && !locked[i] && !errors[i]) acc.push(i);
    return acc;
  }, []);
  if (empty.length === 0) return;
  const idx = empty[Math.floor(Math.random() * empty.length)];
  state.board[idx] = solution[idx];
  state.notes[idx] = [];
  state.errors[idx] = false;
  state.selected = idx;
  state.hints--;
  clearNoteFromPeers(idx, solution[idx]);
  renderCell(idx);
  renderHighlights();
  renderNumpadCounts();
  renderHintButton();
  if (checkWin()) {
    state.won = true;
    clearState();
    setTimeout(triggerVictory, 400);
    return;
  }
  saveState();
}

export function selectCell(idx: number): void {
  state.selected = idx;
  renderHighlights();
}

export function toggleNoteMode(): void {
  state.noteMode = !state.noteMode;
  renderNoteButton();
}

export function handleInput(num: number): void {
  assertGameActive(state);
  const idx = state.selected;
  if (idx === -1 || state.locked[idx] || state.gameOver || state.won) return;

  if (state.noteMode) {
    if (num === 0) {
      state.notes[idx] = [];
    } else {
      const arr = state.notes[idx];
      const pos = arr.indexOf(num);
      if (pos === -1) {
        arr.push(num);
        arr.sort((a, b) => a - b);
      } else {
        arr.splice(pos, 1);
      }
    }
    renderCell(idx);
    renderHighlights();
    saveState();
    return;
  }

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
  state.notes[idx] = [];

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
      setTimeout(() => showScreen("gameover"), 500);
      return;
    }
  } else {
    state.errors[idx] = false;
    clearNoteFromPeers(idx, num);
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
  const el = document.getElementById("victory-time");
  if (el) el.textContent = `Solved in ${formatTime(elapsed)}`;
  startFireworks();
  showScreen("victory");
}

export function startGame(difficulty: DifficultyKey): void {
  clearState();
  state.difficulty = difficulty;
  state.solution = generateSolution();
  state.puzzle = createPuzzle(state.solution, difficulty);
  state.board = [...state.puzzle];
  state.locked = state.puzzle.map((v) => v !== 0);
  state.errors = new Array<boolean>(81).fill(false);
  state.lives = MAX_LIVES;
  state.hints = 3;
  state.notes = Array.from({ length: 81 }, () => [] as number[]);
  state.noteMode = false;
  state.selected = -1;
  state.gameOver = false;
  state.won = false;
  state.startTime = Date.now();
  showScreen("game");
  renderAll();
  renderNoteButton();
}
