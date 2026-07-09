// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0; // Tracks the player's current score
let timeLeft = 30; // Countdown timer, in seconds
let timerInterval; // Will store the timer that counts down every second

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;

  // Reset score and timer in case this isn't the first round
  score = 0;
  timeLeft = 30;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;

  // Clear out any leftover drops from a previous round
  document.getElementById("game-container").innerHTML = "";

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);

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
  }

  alert(`Time's up! Final score: ${score}`);
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");

  // Randomly decide if this is a good drop or a bad drop (20% chance bad)
  const isBad = Math.random() < 0.2;
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

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Handle clicking the drop
  drop.addEventListener("click", () => {
    if (isBad) {
      score = Math.max(0, score - 2); // Penalty, but don't go below 0
    } else {
      score++;
    }
    document.getElementById("score").textContent = score;
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
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  score = 0;
  timeLeft = 30;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
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
