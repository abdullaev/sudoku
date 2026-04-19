export type DifficultyKey = "easy" | "medium" | "hard";

export interface DifficultyConfig {
  remove: number;
}

export type DifficultyMap = Record<DifficultyKey, DifficultyConfig>;

export type WinsData = Record<DifficultyKey, number>;

export interface GameState {
  solution: number[] | null;
  puzzle: number[] | null;
  board: number[] | null;
  locked: boolean[] | null;
  errors: boolean[] | null;
  difficulty: DifficultyKey;
  lives: number;
  selected: number;
  gameOver: boolean;
  won: boolean;
  startTime: number | null;
  hints: number;
  notes: number[][];
  noteMode: boolean;
}

export type PersistedState = Pick<
  GameState,
  "solution" | "puzzle" | "board" | "locked" | "errors" | "difficulty" | "lives" | "startTime" | "hints" | "notes"
>;
