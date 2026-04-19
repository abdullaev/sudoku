const MODAL_SCREENS = new Set(['gameover', 'victory']);

export function showScreen(name: string): void {
  if (MODAL_SCREENS.has(name)) {
    const screen = document.getElementById(`screen-${name}`);
    if (screen) screen.classList.add("active");
  } else {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const screen = document.getElementById(`screen-${name}`);
    if (screen) screen.classList.add("active");
  }
}

export function buildNumpad(): void {
  const pad = document.getElementById("numpad");
  if (!pad) return;
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement("button");
    btn.className = "numpad-btn";
    btn.dataset.num = String(n);
    btn.textContent = String(n);
    btn.setAttribute("aria-label", `Enter ${n}`);
    pad.appendChild(btn);
  }
  const erase = document.createElement("button");
  erase.className = "numpad-btn erase";
  erase.dataset.num = "0";
  erase.textContent = "⌫";
  erase.setAttribute("aria-label", "Erase");
  pad.appendChild(erase);

  const note = document.createElement("button");
  note.className = "numpad-btn note";
  note.dataset.note = "1";
  note.setAttribute("aria-label", "Toggle note mode");
  note.setAttribute("aria-pressed", "false");
  note.textContent = "✏️";
  pad.appendChild(note);

  const hint = document.createElement("button");
  hint.className = "numpad-btn hint";
  hint.dataset.hint = "1";
  hint.setAttribute("aria-label", "Hint");
  const hintIcon = document.createElement("span");
  hintIcon.textContent = "💡";
  const hintCount = document.createElement("span");
  hintCount.className = "hint-count";
  hintCount.textContent = "3";
  hint.appendChild(hintIcon);
  hint.appendChild(hintCount);
  pad.appendChild(hint);
}

export function spawnHeart(): void {
  const el = document.createElement("span");
  el.className = "floating-heart";
  el.textContent = "❤️";
  el.style.left = `${10 + Math.random() * 80}%`;
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

export function scheduleNextHeart(): void {
  const delay = 6000 + Math.random() * 14000;
  setTimeout(() => {
    spawnHeart();
    scheduleNextHeart();
  }, delay);
}
