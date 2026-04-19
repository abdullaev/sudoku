import { state, clearState } from "./state";
import { startGame, selectCell, handleInput } from "./game";
import { showScreen } from "./ui";

export function initEvents(): void {
  document.querySelectorAll<HTMLButtonElement>(".btn-difficulty").forEach((btn) => {
    btn.addEventListener("click", () => {
      const d = btn.dataset.difficulty;
      if (d === "easy" || d === "medium" || d === "hard") startGame(d);
    });
  });

  document.getElementById("board")?.addEventListener("click", (e) => {
    const cell = (e.target as Element).closest<HTMLElement>(".cell");
    if (!cell) return;
    selectCell(Number(cell.dataset.idx ?? "-1"));
  });

  document.getElementById("numpad")?.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest<HTMLElement>(".numpad-btn");
    if (!btn) return;
    handleInput(Number(btn.dataset.num ?? "0"));
  });

  document.addEventListener("keydown", (e) => {
    if (state.gameOver || state.won) return;

    if (e.key >= "1" && e.key <= "9") {
      handleInput(Number(e.key));
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      handleInput(0);
    } else if (e.key === "ArrowUp") {
      if (state.selected >= 9) selectCell(state.selected - 9);
    } else if (e.key === "ArrowDown") {
      if (state.selected < 72) selectCell(state.selected + 9);
    } else if (e.key === "ArrowLeft") {
      if (state.selected % 9 > 0) selectCell(state.selected - 1);
    } else if (e.key === "ArrowRight") {
      if (state.selected % 9 < 8) selectCell(state.selected + 1);
    }
  });

  document.getElementById("btn-new-game")?.addEventListener("click", () => {
    clearState();
    showScreen("start");
  });

  document.getElementById("btn-retry")?.addEventListener("click", () => {
    startGame(state.difficulty);
  });
  document.getElementById("btn-retry-menu")?.addEventListener("click", () => {
    clearState();
    showScreen("start");
  });

  document.getElementById("btn-victory-again")?.addEventListener("click", () => {
    startGame(state.difficulty);
  });
  document.getElementById("btn-victory-menu")?.addEventListener("click", () => {
    clearState();
    showScreen("start");
  });
}
