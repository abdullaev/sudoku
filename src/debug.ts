/// <reference types="vite/client" />
import { state, clearState } from './state';
import { renderAll } from './render';
import { checkWin, triggerVictory } from './game';

export function initDebug(): void {
  if (!import.meta.env.DEV) return;

  const btn = document.createElement('button');
  btn.textContent = 'Autofill';
  btn.className = 'debug-btn';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    if (!state.board || !state.solution || !state.locked || !state.errors) return;
    if (state.won || state.gameOver) return;

    for (let i = 0; i < 81; i++) {
      if (!state.locked[i]) {
        state.board[i]  = state.solution[i];
        state.errors[i] = false;
      }
    }

    renderAll();

    if (checkWin()) {
      state.won = true;
      clearState();
      setTimeout(triggerVictory, 400);
    }
  });
}
