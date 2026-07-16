// ===== Difficulty settings =====
const difficultySettings = {
  easy:   { time: 40, dropInterval: 1300, badChance: 0.10, fallDuration: 5 },
  normal: { time: 30, dropInterval: 1000, badChance: 0.20, fallDuration: 4 },
  hard:   { time: 20, dropInterval: 700,  badChance: 0.35, fallDuration: 3 }
};
let currentDifficulty = "normal";

// ===== Milestone messages =====
const milestones = [
  { score: 5,  message: "Nice start! 💧" },
  { score: 10, message: "Halfway there!" },
  { score: 15, message: "Almost at the well! 🚰" },
  { score: 20, message: "Clean water for a family!" }
];
let milestonesHit = [];

// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0; // Tracks the player's current score
let timeLeft = 30; // Countdown timer, in seconds
let timerInterval; // Will store the timer that counts down every second

// ===== Simple Web Audio sound effects (no downloaded files needed) =====
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, duration, type = "sine") {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}
const sounds = {
  goodDrop: () => playTone(880, 0.15, "sine"),
  badDrop: () => playTone(180, 0.25, "sawtooth"),
  buttonClick: () => playTone(440, 0.1, "square"),
  win: () => {
    playTone(523, 0.15);
    setTimeout(() => playTone(659, 0.15), 150);
    setTimeout(() => playTone(784, 0.3), 300);
  }
};

// ===== Difficulty button listeners =====
document.querySelectorAll(".difficulty-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (gameRunning) return; // don't allow switching mid-game
    document.querySelectorAll(".difficulty-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentDifficulty = btn.dataset.level;
    sounds.buttonClick();
  });
});

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;
  sounds.buttonClick();

  gameRunning = true;
  const settings = difficultySettings[currentDifficulty];

  // Reset score and timer in case this isn't the first round
  score = 0;
  timeLeft = settings.time;
  milestonesHit = [];
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("milestone-message").textContent = "";

  // Clear out any leftover drops from a previous round
  document.getElementById("game-container").innerHTML = "";

  // Create new drops based on difficulty
  dropMaker = setInterval(createDrop, settings.dropInterval);

  // Count down the timer every second
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  timeLeft--;
  document.getElementById("time").textContent = timeLeft;

  if (timeLeft <= 0) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;

  // Stop making new drops and stop the countdown
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  // Remove any drops still on screen
  document.getElementById("game-container").innerHTML = "";

  // Celebrate if the player scored well
  if (score >= 10) {
    launchConfetti();
    sounds.win();
  }

  alert(`Time's up! Final score: ${score}`);
}

function checkMilestones() {
  milestones.forEach((m) => {
    if (score >= m.score && !milestonesHit.includes(m.score)) {
      milestonesHit.push(m.score);
      const msgEl = document.getElementById("milestone-message");
      msgEl.textContent = m.message;
      setTimeout(() => {
        if (msgEl.textContent === m.message) msgEl.textContent = "";
      }, 2000);
    }
  });
}

function createDrop() {
  const settings = difficultySettings[currentDifficulty];

  // Create a new div element that will be our water drop
  const drop = document.createElement("div");

  // Randomly decide if this is a good drop or a bad drop (chance depends on difficulty)
  const isBad = Math.random() < settings.badChance;
  drop.className = isBad ? "water-drop bad-drop" : "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Fall duration depends on difficulty
  drop.style.animationDuration = `${settings.fallDuration}s`;

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Handle clicking the drop
  drop.addEventListener("click", () => {
    if (isBad) {
      score = Math.max(0, score - 2); // Penalty, but don't go below 0
      sounds.badDrop();
    } else {
      score++;
      sounds.goodDrop();
    }
    document.getElementById("score").textContent = score;
    checkMilestones();
    drop.remove(); // Remove immediately once clicked
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

// Reset button functionality
document.getElementById("reset-btn").addEventListener("click", resetGame);

function resetGame() {
  sounds.buttonClick();
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  score = 0;
  timeLeft = difficultySettings[currentDifficulty].time;
  milestonesHit = [];
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("milestone-message").textContent = "";
  document.getElementById("game-container").innerHTML = "";
}

// Simple confetti effect using small colored divs
function launchConfetti() {
  const colors = ["#FFC907", "#2E9DF7", "#4FCB53", "#FF902A", "#F5402C"];

  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti-piece";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = 2 + Math.random() * 2 + "s";
    document.body.appendChild(confetti);

    // Clean up each confetti piece after it finishes falling
    setTimeout(() => confetti.remove(), 4000);
  }
}
