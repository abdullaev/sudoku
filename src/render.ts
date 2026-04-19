import { state, assertGameActive, getWins } from "./state";
import { getEl, formatTime } from "./utils";
import type { DifficultyKey } from "./types";

export function renderAll(): void {
  assertGameActive(state);
  const boardEl = getEl<HTMLDivElement>("board");
  boardEl.innerHTML = "";

  for (let i = 0; i < 81; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.idx = String(i);
    cell.dataset.row = String(Math.floor(i / 9));
    cell.dataset.col = String(i % 9);
    cell.setAttribute("role", "gridcell");

    if (state.locked[i]) {
      cell.classList.add("locked");
      cell.textContent = String(state.puzzle[i]);
    }
    boardEl.appendChild(cell);
  }

  getEl<HTMLSpanElement>("difficulty-label").textContent =
    state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);

  renderLives();
  renderHighlights();
  renderNumpadCounts();
  renderWins();
}

export function renderCell(idx: number): void {
  assertGameActive(state);
  const { board, errors, locked } = state;
  const el = document.querySelector<HTMLDivElement>(`.cell[data-idx="${idx}"]`);
  if (!el) return;
  el.textContent = board[idx] ? String(board[idx]) : "";
  el.classList.toggle("error", errors[idx]);
  el.classList.toggle("player", !locked[idx] && board[idx] !== 0 && !errors[idx]);
}

export function renderHighlights(): void {
  assertGameActive(state);
  const { board, errors } = state;
  const sel = state.selected;
  const selRow = sel !== -1 ? Math.floor(sel / 9) : -1;
  const selCol = sel !== -1 ? sel % 9 : -1;
  const selBox = sel !== -1 ? Math.floor(selRow / 3) * 3 + Math.floor(selCol / 3) : -1;
  const selVal = sel !== -1 ? board[sel] : 0;

  document.querySelectorAll<HTMLDivElement>(".cell").forEach((el) => {
    const idx = Number(el.dataset.idx ?? "-1");
    const row = Number(el.dataset.row ?? "-1");
    const col = Number(el.dataset.col ?? "-1");
    const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);

    el.classList.remove("selected", "related", "same-num");

    if (idx === sel) {
      el.classList.add("selected");
    } else if (selVal && board[idx] === selVal && !errors[idx]) {
      el.classList.add("same-num");
    } else if (selRow !== -1 && (row === selRow || col === selCol || box === selBox)) {
      el.classList.add("related");
    }
  });
}

export function renderLives(): void {
  document.querySelectorAll<HTMLSpanElement>(".heart").forEach((el) => {
    const life = Number(el.dataset.life ?? "0");
    el.classList.toggle("lost", life > state.lives);
  });
}

export function renderNumpadCounts(): void {
  assertGameActive(state);
  const { board, errors } = state;
  const counts = new Array<number>(10).fill(0);
  board.forEach((v, i) => {
    if (v && !errors[i]) counts[v]++;
  });
  document.querySelectorAll<HTMLButtonElement>(".numpad-btn[data-num]").forEach((btn) => {
    const n = Number(btn.dataset.num ?? "0");
    if (n > 0) btn.classList.toggle("complete", counts[n] >= 9);
  });
}

export function renderWins(): void {
  const wins = getWins();
  (["easy", "medium", "hard"] as DifficultyKey[]).forEach((d) => {
    const el = document.getElementById(`wins-${d}`);
    if (el) el.textContent = `🏆 ${wins[d]}`;
  });
  const gameWinsEl = document.getElementById("game-wins");
  if (gameWinsEl && state.board) {
    gameWinsEl.textContent = `🏆 ${wins[state.difficulty]}`;
  }
}

export function renderTimer(): void {
  const el = document.getElementById("game-timer");
  if (!el) return;
  if (!state.startTime || state.gameOver || state.won) return;
  el.textContent = `🕐 ${formatTime(Date.now() - state.startTime)}`;
}

export function shakeCell(idx: number): void {
  const el = document.querySelector<HTMLDivElement>(`.cell[data-idx="${idx}"]`);
  if (!el) return;
  el.classList.add("shake");
  el.addEventListener("animationend", () => el.classList.remove("shake"), { once: true });
}

export function popHeart(): void {
  const hearts = document.querySelectorAll<HTMLSpanElement>(".heart:not(.lost)");
  const last = hearts[hearts.length - 1];
  if (last) {
    last.classList.add("pop");
    last.addEventListener("animationend", () => last.classList.remove("pop"), { once: true });
  }
}
