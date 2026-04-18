// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY = {
  easy:   { remove: 36 },
  medium: { remove: 46 },
  hard:   { remove: 52 },
};

const MAX_LIVES = 3;

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  solution:   null,
  puzzle:     null,
  board:      null,
  locked:     null,
  errors:     null,
  difficulty: 'easy',
  lives:      MAX_LIVES,
  selected:   -1,
  gameOver:   false,
  won:        false,
  startTime:  null,
};

// ─── Persistence ─────────────────────────────────────────────────────────────

function saveState() {
  const { solution, puzzle, board, locked, errors, difficulty, lives, startTime } = state;
  localStorage.setItem('sudoku_state', JSON.stringify(
    { solution, puzzle, board, locked, errors, difficulty, lives, startTime }
  ));
}

function loadState() {
  const raw = localStorage.getItem('sudoku_state');
  if (!raw) return false;
  try {
    Object.assign(state, JSON.parse(raw));
    state.selected = -1;
    state.gameOver = false;
    state.won = false;
    return true;
  } catch { return false; }
}

function clearState() {
  localStorage.removeItem('sudoku_state');
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0
    ? `${m}m ${sec.toString().padStart(2, '0')}s`
    : `${sec}s`;
}

// ─── Sudoku Engine ────────────────────────────────────────────────────────────

function isValid(board, idx, num) {
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

function solve(board) {
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

function generateSolution() {
  const board = new Array(81).fill(0);
  solve(board);
  return board;
}

function countSolutions(board, limit = 2) {
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

function createPuzzle(solution, difficulty) {
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

// ─── Screen Management ────────────────────────────────────────────────────────

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function renderAll() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';

  for (let i = 0; i < 81; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.idx = i;
    cell.dataset.row = Math.floor(i / 9);
    cell.dataset.col = i % 9;
    cell.setAttribute('role', 'gridcell');

    if (state.locked[i]) {
      cell.classList.add('locked');
      cell.textContent = state.puzzle[i];
    }
    boardEl.appendChild(cell);
  }

  document.getElementById('difficulty-label').textContent =
    state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);

  renderLives();
  renderHighlights();
  renderNumpadCounts();
}

function renderCell(idx) {
  const el = document.querySelector(`.cell[data-idx="${idx}"]`);
  el.textContent = state.board[idx] || '';
  el.classList.toggle('error', state.errors[idx]);
  el.classList.toggle('player', !state.locked[idx] && state.board[idx] !== 0 && !state.errors[idx]);
}

function renderHighlights() {
  const sel = state.selected;
  const selRow = sel !== -1 ? Math.floor(sel / 9) : -1;
  const selCol = sel !== -1 ? sel % 9 : -1;
  const selBox = sel !== -1 ? Math.floor(selRow / 3) * 3 + Math.floor(selCol / 3) : -1;
  const selVal = sel !== -1 ? state.board[sel] : 0;

  document.querySelectorAll('.cell').forEach(el => {
    const idx = +el.dataset.idx;
    const row = +el.dataset.row;
    const col = +el.dataset.col;
    const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);

    el.classList.remove('selected', 'related', 'same-num');

    if (idx === sel) {
      el.classList.add('selected');
    } else if (selVal && state.board[idx] === selVal && !state.errors[idx]) {
      el.classList.add('same-num');
    } else if (selRow !== -1 && (row === selRow || col === selCol || box === selBox)) {
      el.classList.add('related');
    }
  });
}

function renderLives() {
  document.querySelectorAll('.heart').forEach(el => {
    const life = +el.dataset.life;
    el.classList.toggle('lost', life > state.lives);
  });
}

function renderNumpadCounts() {
  const counts = new Array(10).fill(0);
  state.board.forEach((v, i) => {
    if (v && !state.errors[i]) counts[v]++;
  });
  document.querySelectorAll('.numpad-btn[data-num]').forEach(btn => {
    const n = +btn.dataset.num;
    if (n > 0) btn.classList.toggle('complete', counts[n] >= 9);
  });
}

function shakeCell(idx) {
  const el = document.querySelector(`.cell[data-idx="${idx}"]`);
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

function popHeart() {
  const hearts = document.querySelectorAll('.heart:not(.lost)');
  const last = hearts[hearts.length - 1];
  if (last) {
    last.classList.add('pop');
    last.addEventListener('animationend', () => last.classList.remove('pop'), { once: true });
  }
}

// ─── Game Logic ───────────────────────────────────────────────────────────────

function selectCell(idx) {
  state.selected = idx;
  renderHighlights();
}

function handleInput(num) {
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

function checkWin() {
  return state.board.every((v, i) => v === state.solution[i]);
}

function triggerVictory() {
  const elapsed = Date.now() - state.startTime;
  document.getElementById('victory-time').textContent =
    `Solved in ${formatTime(elapsed)}`;
  showScreen('victory');
}

function startGame(difficulty) {
  clearState();
  state.difficulty = difficulty;
  state.solution   = generateSolution();
  state.puzzle     = createPuzzle(state.solution, difficulty);
  state.board      = [...state.puzzle];
  state.locked     = state.puzzle.map(v => v !== 0);
  state.errors     = new Array(81).fill(false);
  state.lives      = MAX_LIVES;
  state.selected   = -1;
  state.gameOver   = false;
  state.won        = false;
  state.startTime  = Date.now();
  showScreen('game');
  renderAll();
}

// ─── Numpad Builder ───────────────────────────────────────────────────────────

function buildNumpad() {
  const pad = document.getElementById('numpad');
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement('button');
    btn.className = 'numpad-btn';
    btn.dataset.num = n;
    btn.textContent = n;
    btn.setAttribute('aria-label', `Enter ${n}`);
    pad.appendChild(btn);
  }
  const erase = document.createElement('button');
  erase.className = 'numpad-btn erase';
  erase.dataset.num = 0;
  erase.textContent = '⌫';
  erase.setAttribute('aria-label', 'Erase');
  pad.appendChild(erase);
}

// ─── Events ───────────────────────────────────────────────────────────────────

function initEvents() {
  // Difficulty selection
  document.querySelectorAll('.btn-difficulty').forEach(btn => {
    btn.addEventListener('click', () => startGame(btn.dataset.difficulty));
  });

  // Board cell selection (event delegation)
  document.getElementById('board').addEventListener('click', e => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    selectCell(+cell.dataset.idx);
  });

  // Numpad input (event delegation)
  document.getElementById('numpad').addEventListener('click', e => {
    const btn = e.target.closest('.numpad-btn');
    if (!btn) return;
    handleInput(+btn.dataset.num);
  });

  // Keyboard input
  document.addEventListener('keydown', e => {
    if (state.gameOver || state.won) return;

    if (e.key >= '1' && e.key <= '9') {
      handleInput(+e.key);
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      handleInput(0);
    } else if (e.key === 'ArrowUp') {
      if (state.selected >= 9) selectCell(state.selected - 9);
    } else if (e.key === 'ArrowDown') {
      if (state.selected < 72) selectCell(state.selected + 9);
    } else if (e.key === 'ArrowLeft') {
      if (state.selected % 9 > 0) selectCell(state.selected - 1);
    } else if (e.key === 'ArrowRight') {
      if (state.selected % 9 < 8) selectCell(state.selected + 1);
    }
  });

  // In-game "New" button
  document.getElementById('btn-new-game').addEventListener('click', () => {
    clearState();
    showScreen('start');
  });

  // Game Over screen
  document.getElementById('btn-retry').addEventListener('click', () => {
    startGame(state.difficulty);
  });
  document.getElementById('btn-retry-menu').addEventListener('click', () => {
    clearState();
    showScreen('start');
  });

  // Victory screen
  document.getElementById('btn-victory-again').addEventListener('click', () => {
    startGame(state.difficulty);
  });
  document.getElementById('btn-victory-menu').addEventListener('click', () => {
    clearState();
    showScreen('start');
  });
}

// ─── Floating Hearts ──────────────────────────────────────────────────────────

function spawnHeart() {
  const el = document.createElement('span');
  el.className = 'floating-heart';
  el.textContent = '❤️';
  el.style.left = `${10 + Math.random() * 80}%`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function scheduleNextHeart() {
  const delay = 6000 + Math.random() * 14000; // 6–20 seconds
  setTimeout(() => {
    spawnHeart();
    scheduleNextHeart();
  }, delay);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  buildNumpad();
  initEvents();
  scheduleNextHeart();
  if (loadState()) {
    renderAll();
    for (let i = 0; i < 81; i++) {
      if (!state.locked[i]) renderCell(i);
    }
    showScreen('game');
  }
});
