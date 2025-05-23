// Game state
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let currentPlayer = "X"; // Player is always X, bot is always O
let scores = { X: 0, O: 0 };
let currentDifficulty = "easy";

// DOM elements
const statusDisplay = document.querySelector(".status");
const scoreX = document.getElementById("score-x");
const scoreO = document.getElementById("score-o");
const restartButton = document.querySelector(".restart");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

// Winning conditions
const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Sound effects
const clickSound = new Audio("click.mp3");
const winSound = new Audio("win.mp3");
const drawSound = new Audio("draw.mp3");

// Messages
const winningMessage = () => `Player ${currentPlayer} wins!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `Your turn (X)`;

// Initialize the game
statusDisplay.textContent = currentPlayerTurn();

// Add event listeners
document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

restartButton.addEventListener("click", handleRestartGame);

// Difficulty selector
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    difficultyButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentDifficulty = button.dataset.difficulty;
    handleRestartGame();
  });
});

// Handle cell click
function handleCellClick(clickedCellEvent) {
  const clickedCell = clickedCellEvent.target;
  const clickedCellIndex = parseInt(
    clickedCell.getAttribute("data-cell-index")
  );

  if (
    gameState[clickedCellIndex] !== "" ||
    !gameActive ||
    currentPlayer !== "X"
  ) {
    return;
  }

  // Play click sound
  clickSound.currentTime = 0;
  clickSound.play().catch((e) => console.log("Audio play error:", e));

  // Add animation
  clickedCell.style.transform = "scale(0.95)";
  setTimeout(() => {
    clickedCell.style.transform = "";
  }, 80);

  // Handle the cell being played
  handleCellPlayed(clickedCell, clickedCellIndex);

  // Check for a win
  let gameWon = handleResultValidation();

  // If game is not won and still active, let the bot make a move
  if (!gameWon && gameActive) {
    currentPlayer = "O"; // Switch to bot's turn
    setTimeout(() => {
      makeBotMove();
    }, 300); // Small delay to make it feel more natural
  }
}

// Handle cell played
function handleCellPlayed(clickedCell, clickedCellIndex) {
  gameState[clickedCellIndex] = currentPlayer;
  clickedCell.textContent = currentPlayer;
  clickedCell.classList.add(currentPlayer);
}

// Bot move logic
function makeBotMove() {
  if (!gameActive) return;

  let move;
  switch (currentDifficulty) {
    case "easy":
      move = getEasyMove();
      break;
    case "medium":
      move = getMediumMove();
      break;
    case "hard":
      move = getHardMove();
      break;
  }

  if (move !== -1) {
    const cell = document.querySelector(`[data-cell-index="${move}"]`);
    handleCellPlayed(cell, move);
    handleResultValidation();
    currentPlayer = "X"; // Switch back to player's turn
  }
}

// Easy difficulty - random moves
function getEasyMove() {
  const availableMoves = gameState
    .map((cell, index) => (cell === "" ? index : -1))
    .filter((index) => index !== -1);
  return availableMoves.length > 0
    ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
    : -1;
}

// Medium difficulty - tries to win or block
function getMediumMove() {
  // Try to win
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] === "O" && gameState[b] === "O" && gameState[c] === "") {
      return c;
    }
    if (gameState[a] === "O" && gameState[c] === "O" && gameState[b] === "") {
      return b;
    }
    if (gameState[b] === "O" && gameState[c] === "O" && gameState[a] === "") {
      return a;
    }
  }

  // Block player from winning
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] === "X" && gameState[b] === "X" && gameState[c] === "") {
      return c;
    }
    if (gameState[a] === "X" && gameState[c] === "X" && gameState[b] === "") {
      return b;
    }
    if (gameState[b] === "X" && gameState[c] === "X" && gameState[a] === "") {
      return a;
    }
  }

  // If no winning or blocking move, take center if available
  if (gameState[4] === "") return 4;

  // Otherwise, make a random move
  return getEasyMove();
}

// Hard difficulty - uses minimax algorithm
function getHardMove() {
  // Try to win
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] === "O" && gameState[b] === "O" && gameState[c] === "") {
      return c;
    }
    if (gameState[a] === "O" && gameState[c] === "O" && gameState[b] === "") {
      return b;
    }
    if (gameState[b] === "O" && gameState[c] === "O" && gameState[a] === "") {
      return a;
    }
  }

  // Block player from winning
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] === "X" && gameState[b] === "X" && gameState[c] === "") {
      return c;
    }
    if (gameState[a] === "X" && gameState[c] === "X" && gameState[b] === "") {
      return b;
    }
    if (gameState[b] === "X" && gameState[c] === "X" && gameState[a] === "") {
      return a;
    }
  }

  // Take center if available
  if (gameState[4] === "") return 4;

  // Take corners if available
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter((corner) => gameState[corner] === "");
  if (availableCorners.length > 0) {
    return availableCorners[
      Math.floor(Math.random() * availableCorners.length)
    ];
  }

  // Take edges if available
  const edges = [1, 3, 5, 7];
  const availableEdges = edges.filter((edge) => gameState[edge] === "");
  if (availableEdges.length > 0) {
    return availableEdges[Math.floor(Math.random() * availableEdges.length)];
  }

  return -1;
}

// Handle result validation
function handleResultValidation() {
  let roundWon = false;

  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    const condition = winningConditions[i];
    const aValue = gameState[a];
    const bValue = gameState[b];
    const cValue = gameState[c];

    if (aValue === "" || bValue === "" || cValue === "") {
      continue;
    }

    if (aValue === bValue && bValue === cValue) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    // Play win sound
    winSound.currentTime = 0;
    winSound.play().catch((e) => console.log("Audio play error:", e));

    statusDisplay.textContent = winningMessage();
    gameActive = false;

    // Update score
    scores[currentPlayer]++;
    updateScoreboard();
    return true;
  }

  const roundDraw = !gameState.includes("");
  if (roundDraw) {
    // Play draw sound
    drawSound.currentTime = 0;
    drawSound.play().catch((e) => console.log("Audio play error:", e));

    statusDisplay.textContent = drawMessage();
    gameActive = false;
    return true;
  }

  return false;
}

// Update scoreboard
function updateScoreboard() {
  if (scoreX && scoreO) {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;

    // Animate score update
    const scoreElement = currentPlayer === "X" ? scoreX : scoreO;
    scoreElement.classList.add("winner-animation");

    setTimeout(() => {
      scoreElement.classList.remove("winner-animation");
    }, 500);
  }
}

// Handle restart game
function handleRestartGame() {
  gameState = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";
  statusDisplay.textContent = currentPlayerTurn();
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("X", "O");
  });

  // Button animation
  restartButton.style.transform = "scale(0.95)";
  setTimeout(() => {
    restartButton.style.transform = "";
  }, 80);
}

function findBestMove() {
  // First, check if bot can win immediately
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] === "O" && gameState[b] === "O" && gameState[c] === "")
      return c;
    if (gameState[a] === "O" && gameState[c] === "O" && gameState[b] === "")
      return b;
    if (gameState[b] === "O" && gameState[c] === "O" && gameState[a] === "")
      return a;
  }

  // Aggressively block player's winning moves
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] === "X" && gameState[b] === "X" && gameState[c] === "")
      return c;
    if (gameState[a] === "X" && gameState[c] === "X" && gameState[b] === "")
      return b;
    if (gameState[b] === "X" && gameState[c] === "X" && gameState[a] === "")
      return a;
  }

  // Create multiple winning opportunities (forks)
  const forkMoves = findForkMoves("O");
  if (forkMoves.length > 0) {
    return forkMoves[Math.floor(Math.random() * forkMoves.length)];
  }

  // Block opponent's fork opportunities
  const opponentForkMoves = findForkMoves("X");
  if (opponentForkMoves.length > 0) {
    return opponentForkMoves[
      Math.floor(Math.random() * opponentForkMoves.length)
    ];
  }

  // Take center if available (more aggressive play)
  if (gameState[4] === "") return 4;

  // Take corners aggressively
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter((corner) => gameState[corner] === "");
  if (availableCorners.length > 0) {
    // Prioritize corners that create more winning opportunities
    const bestCorner = availableCorners.find((corner) => {
      const tempBoard = [...gameState];
      tempBoard[corner] = "O";
      return countWinningOpportunities(tempBoard, "O") > 1;
    });
    return (
      bestCorner ||
      availableCorners[Math.floor(Math.random() * availableCorners.length)]
    );
  }

  // Take any available space that creates a winning opportunity
  const availableMoves = gameState
    .map((cell, index) => (cell === "" ? index : -1))
    .filter((index) => index !== -1);
  for (const move of availableMoves) {
    const tempBoard = [...gameState];
    tempBoard[move] = "O";
    if (countWinningOpportunities(tempBoard, "O") > 0) {
      return move;
    }
  }

  // If no strategic moves available, take any available space
  return availableMoves.length > 0
    ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
    : -1;
}

function countWinningOpportunities(board, player) {
  let count = 0;
  for (const combo of winningConditions) {
    const [a, b, c] = combo;
    if (
      (board[a] === player && board[b] === player && board[c] === "") ||
      (board[a] === player && board[c] === player && board[b] === "") ||
      (board[b] === player && board[c] === player && board[a] === "")
    ) {
      count++;
    }
  }
  return count;
}

function findForkMoves(player) {
  const forkMoves = [];
  const availableMoves = gameState
    .map((cell, index) => (cell === "" ? index : -1))
    .filter((index) => index !== -1);

  for (const move of availableMoves) {
    const tempBoard = [...gameState];
    tempBoard[move] = player;
    if (countWinningOpportunities(tempBoard, player) >= 2) {
      forkMoves.push(move);
    }
  }

  return forkMoves;
}
