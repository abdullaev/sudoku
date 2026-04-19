import { MAX_LIVES } from './constants';
import type { DifficultyKey, GameState, PersistedState, WinsData } from './types';

export const state: GameState = {
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
  hints:      3,
  notes:      Array.from({ length: 81 }, () => [] as number[]),
  noteMode:   false,
};

export type ActiveGameState = GameState & {
  solution:  number[];
  puzzle:    number[];
  board:     number[];
  locked:    boolean[];
  errors:    boolean[];
  startTime: number;
};

export function assertGameActive(s: GameState): asserts s is ActiveGameState {
  if (!s.board || !s.solution || !s.puzzle || !s.locked || !s.errors || s.startTime === null)
    throw new Error('assertGameActive called before game initialized');
}

function isPersistedState(v: unknown): v is PersistedState {
  return (
    typeof v === 'object' && v !== null &&
    'board' in v && 'solution' in v && 'difficulty' in v
  );
}

export function saveState(): void {
  const { solution, puzzle, board, locked, errors, difficulty, lives, startTime, hints, notes } = state;
  localStorage.setItem('sudoku_state', JSON.stringify(
    { solution, puzzle, board, locked, errors, difficulty, lives, startTime, hints, notes }
  ));
}

export function loadState(): boolean {
  const raw = localStorage.getItem('sudoku_state');
  if (!raw) return false;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedState(parsed)) return false;
    Object.assign(state, parsed);
    state.selected = -1;
    state.gameOver = false;
    state.won = false;
    state.noteMode = false;
    if (!Array.isArray(state.notes) || state.notes.length !== 81) {
      state.notes = Array.from({ length: 81 }, () => []);
    }
    return true;
  } catch { return false; }
}

export function clearState(): void {
  localStorage.removeItem('sudoku_state');
}

export function getWins(): WinsData {
  const raw = localStorage.getItem('sudoku_wins');
  const defaults: WinsData = { easy: 0, medium: 0, hard: 0 };
  if (!raw) return defaults;
  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    return {
      easy:   typeof p.easy   === 'number' ? p.easy   : 0,
      medium: typeof p.medium === 'number' ? p.medium : 0,
      hard:   typeof p.hard   === 'number' ? p.hard   : 0,
    };
  } catch { return defaults; }
}

export function recordWin(difficulty: DifficultyKey): void {
  const wins = getWins();
  wins[difficulty]++;
  localStorage.setItem('sudoku_wins', JSON.stringify(wins));
}

export function initState(difficulty: DifficultyKey): void {
  state.difficulty = difficulty;
  state.selected   = -1;
  state.gameOver   = false;
  state.won        = false;
}
