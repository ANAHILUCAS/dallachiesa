const board = document.querySelector("#board");
const difficulty = document.querySelector("#difficulty");
const movesEl = document.querySelector("#moves");
const timerEl = document.querySelector("#timer");
const statusEl = document.querySelector("#status");
const shuffleBtn = document.querySelector("#shuffleBtn");
const previewBtn = document.querySelector("#previewBtn");
const preview = document.querySelector("#preview");
const closePreview = document.querySelector("#closePreview");

const state = {
  rows: 2,
  cols: 3,
  tiles: [],
  selected: null,
  moves: 0,
  seconds: 0,
  timerId: null,
  started: false,
};

function setSize(value) {
  const [rows, cols] = value.split("x").map(Number);
  state.rows = rows;
  state.cols = cols;
}

function solvedTiles() {
  return [...Array(state.rows * state.cols).keys()];
}

function shuffleTiles() {
  state.tiles = solvedTiles();

  for (let i = state.tiles.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.tiles[i], state.tiles[j]] = [state.tiles[j], state.tiles[i]];
  }

  if (isSolved()) {
    [state.tiles[0], state.tiles[1]] = [state.tiles[1], state.tiles[0]];
  }
}

function startTimer() {
  if (state.started) return;
  state.started = true;
  state.timerId = setInterval(() => {
    state.seconds += 1;
    renderStats();
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerId);
  state.timerId = null;
}

function resetGame() {
  stopTimer();
  state.started = false;
  state.moves = 0;
  state.seconds = 0;
  state.selected = null;
  shuffleTiles();
  statusEl.textContent = "Toca dos piezas para intercambiarlas y reconstruir el logo.";
  render();
}

function renderStats() {
  movesEl.textContent = state.moves;
  const minutes = String(Math.floor(state.seconds / 60)).padStart(2, "0");
  const seconds = String(state.seconds % 60).padStart(2, "0");
  timerEl.textContent = `${minutes}:${seconds}`;
}

function render() {
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${state.cols}, 1fr)`;
  board.style.aspectRatio = `${state.cols} / ${state.rows}`;
  renderStats();

  state.tiles.forEach((tile, index) => {
    const cell = document.createElement("button");
    const sourceRow = Math.floor(tile / state.cols);
    const sourceCol = tile % state.cols;
    cell.className = index === state.selected ? "tile selected" : "tile";
    cell.type = "button";
    cell.setAttribute("aria-label", `Pieza ${tile + 1}`);
    cell.style.backgroundSize = `${state.cols * 100}% ${state.rows * 100}%`;
    cell.style.backgroundPosition = `${(sourceCol / (state.cols - 1)) * 100}% ${(sourceRow / (state.rows - 1)) * 100}%`;
    cell.addEventListener("click", () => selectTile(index));

    board.append(cell);
  });
}

function selectTile(index) {
  startTimer();

  if (state.selected === null) {
    state.selected = index;
    statusEl.textContent = "Ahora toca otra pieza para cambiarla de lugar.";
    render();
    return;
  }

  if (state.selected === index) {
    state.selected = null;
    statusEl.textContent = "Seleccion cancelada.";
    render();
    return;
  }

  [state.tiles[state.selected], state.tiles[index]] = [state.tiles[index], state.tiles[state.selected]];
  state.selected = null;
  state.moves += 1;
  render();

  if (isSolved()) {
    stopTimer();
    statusEl.textContent = `Completado en ${state.moves} movimientos.`;
  }
}

function isSolved() {
  const solved = solvedTiles();
  return state.tiles.every((tile, index) => tile === solved[index]);
}

difficulty.addEventListener("change", () => {
  setSize(difficulty.value);
  resetGame();
});

shuffleBtn.addEventListener("click", resetGame);
previewBtn.addEventListener("click", () => preview.classList.remove("hidden"));
closePreview.addEventListener("click", () => preview.classList.add("hidden"));
preview.addEventListener("click", (event) => {
  if (event.target === preview) preview.classList.add("hidden");
});

resetGame();
