import { buildNumpad, scheduleNextHeart } from './ui';
import { initEvents } from './events';
import { state, loadState } from './state';
import { renderAll, renderCell } from './render';

document.addEventListener('DOMContentLoaded', () => {
  buildNumpad();
  initEvents();
  scheduleNextHeart();
  if (loadState()) {
    renderAll();
    for (let i = 0; i < 81; i++) {
      if (!state.locked?.[i]) renderCell(i);
    }
    const screen = document.getElementById('screen-game');
    if (screen) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      screen.classList.add('active');
    }
  }
});
