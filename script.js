const levels = { easy: 3, medium: 4, hard: 5 };

let state = {
  username: "",
  level: "easy",
  gridSize: 3,
  score: 0,
  timeLeft: 30,
  activeMole: -1,
  moleTimer: null,
  countdownTimer: null,
};

const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const resultsScreen = document.getElementById("results-screen");

const usernameInput = document.getElementById("username-input");
const startBtn = document.getElementById("start-btn");
const menuError = document.getElementById("menu-error");
const playAgainBtn = document.getElementById("play-again-btn");

document.querySelectorAll(".level-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".level-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.level = btn.dataset.level;
  });
});

startBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (!name) {
    menuError.textContent = "isi username dulu bre";
    return;
  }
  state.username = name;
  menuError.textContent = "";
  startGame();
});

playAgainBtn.addEventListener("click", () => {
  showScreen("menu");
  loadLeaderboard("leaderboard-body");
});

function showScreen(name) {
  menuScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  resultsScreen.classList.add("hidden");
  if (name === "menu") menuScreen.classList.remove("hidden");
  if (name === "game") gameScreen.classList.remove("hidden");
  if (name === "results") resultsScreen.classList.remove("hidden");
}

function startGame() {
  state.gridSize = levels[state.level];
  state.score = 0;
  state.timeLeft = 30;
  state.activeMole = -1;
  state.gameRunning = true;

  buildGrid();
  updateScoreDisplay();
  updateTimerDisplay();
  showScreen("game");

  scheduleNextMole();

  state.countdownTimer = setInterval(() => {
    state.timeLeft -= 1;
    updateTimerDisplay();
    if (state.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function scheduleNextMole() {
  clearTimeout(state.moleTimer);
  popMole();
  state.moleTimer = setTimeout(scheduleNextMole, 800);
}

function buildGrid() {
  const grid = document.getElementById("mole-grid");
  grid.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
  grid.innerHTML = "";
  const total = state.gridSize * state.gridSize;
  for (let i = 0; i < total; i++) {
    const hole = document.createElement("div");
    hole.className = "mole-hole";
    hole.dataset.index = i;
    hole.addEventListener("click", () => whack(i));
    grid.appendChild(hole);
  }
}

function popMole() {
  const total = state.gridSize * state.gridSize;
  let next;
  do {
    next = Math.floor(Math.random() * total);
  } while (next === state.activeMole && total > 1);
  state.activeMole = next;
  updateGridDisplay();
}

function whack(index) {
  if (!state.gameRunning) return;
  if (index === state.activeMole) {
    state.score += 1;
    state.activeMole = -1;
    updateGridDisplay();
    updateScoreDisplay();
    scheduleNextMole();
  }
}

function updateGridDisplay() {
  document.querySelectorAll(".mole-hole").forEach((hole, i) => {
    if (i === state.activeMole) {
      hole.classList.add("active");
      hole.textContent = "🐹";
    } else {
      hole.classList.remove("active");
      hole.textContent = "";
    }
  });
}

function updateScoreDisplay() {
  document.getElementById("score-display").textContent = state.score;
}

function updateTimerDisplay() {
  document.getElementById("timer-display").textContent = state.timeLeft + "s";
}

async function endGame() {
  state.gameRunning = false;
  clearTimeout(state.moleTimer);
  clearInterval(state.countdownTimer);

  await saveScore(state.username, state.score, state.level);

  document.getElementById("final-score").textContent = state.score;
  document.getElementById("final-info").textContent = `${state.username} - ${state.level}`;

  showScreen("results");
  loadLeaderboard("leaderboard-body-results");
}

async function saveScore(name, score, level) {
  const { error } = await supabaseClient
    .from("leaderboard")
    .insert({ name, score, level });
  if (error) console.error("Gagal simpen skor:", error);
}

async function loadLeaderboard(targetBodyId) {
  const tbody = document.getElementById(targetBodyId);
  tbody.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;

  const { data, error } = await supabaseClient
    .from("leaderboard")
    .select("*")
    .order("score", { ascending: false })
    .limit(10);

  if (error) {
    tbody.innerHTML = `<tr><td colspan="4">Gagal load leaderboard</td></tr>`;
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">Belum ada skor. Jadi yang pertama!</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map(
      (entry, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(entry.name)}</td>
        <td>${entry.level}</td>
        <td>${entry.score}</td>
      </tr>
    `
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

loadLeaderboard("leaderboard-body");
