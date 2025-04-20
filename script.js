document.addEventListener("DOMContentLoaded", () => {
  const cells = document.querySelectorAll("[data-cell-index]");
  const statusDisplay = document.querySelector(".status");
  const restartButton = document.querySelector(".restart");
  const scoreX = document.getElementById("score-x");
  const scoreO = document.getElementById("score-o");

  let gameActive = true;
  let currentPlayer = "X";
  let gameState = ["", "", "", "", "", "", "", "", ""];
  let scores = {
    X: 0,
    O: 0,
  };

  // Sound effects
  const clickSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2568/2568.wav"
  );
  const winSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/1435/1435.wav"
  );
  const drawSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2575/2575.wav"
  );

  // Lower the volume a bit
  clickSound.volume = 0.3;
  winSound.volume = 0.3;
  drawSound.volume = 0.3;

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

  const winningMessage = () => `Player ${currentPlayer} wins!`;
  const drawMessage = () => `Game ended in a draw!`;
  const currentPlayerTurn = () => `Player ${currentPlayer}'s turn`;

  statusDisplay.textContent = currentPlayerTurn();

  function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(
      clickedCell.getAttribute("data-cell-index")
    );

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
      return;
    }

    // Play click sound
    clickSound.currentTime = 0;
    clickSound.play().catch((e) => console.log("Audio play error:", e));

    // Add animation
    clickedCell.style.transform = "scale(0.95)";
    setTimeout(() => {
      clickedCell.style.transform = "";
    }, 150);

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
  }

  function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
  }

  function handleResultValidation() {
    let roundWon = false;
    let winningLine = null;

    for (let i = 0; i < winningConditions.length; i++) {
      const [a, b, c] = winningConditions[i];
      const condition =
        gameState[a] &&
        gameState[a] === gameState[b] &&
        gameState[a] === gameState[c];

      if (condition) {
        roundWon = true;
        winningLine = winningConditions[i];
        break;
      }
    }

    if (roundWon) {
      // Play win sound
      winSound.currentTime = 0;
      winSound.play().catch((e) => console.log("Audio play error:", e));

      // Highlight the winning cells
      winningLine.forEach((index) => {
        cells[index].classList.add("winner-animation");
      });

      // Update score
      scores[currentPlayer]++;
      updateScoreboard();

      statusDisplay.textContent = winningMessage();
      gameActive = false;
      return;
    }

    const roundDraw = !gameState.includes("");
    if (roundDraw) {
      // Play draw sound
      drawSound.currentTime = 0;
      drawSound.play().catch((e) => console.log("Audio play error:", e));

      statusDisplay.textContent = drawMessage();
      gameActive = false;
      return;
    }

    changePlayer();
  }

  function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.textContent = currentPlayerTurn();
  }

  function updateScoreboard() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;

    // Animate score update
    const scoreElement = currentPlayer === "X" ? scoreX : scoreO;
    scoreElement.classList.add("winner-animation");

    setTimeout(() => {
      scoreElement.classList.remove("winner-animation");
    }, 1000);
  }

  function handleRestartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.textContent = currentPlayerTurn();

    cells.forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove("x", "o", "winner-animation");
    });

    // Play click sound
    clickSound.currentTime = 0;
    clickSound.play().catch((e) => console.log("Audio play error:", e));

    // Button animation
    restartButton.style.transform = "scale(0.95)";
    setTimeout(() => {
      restartButton.style.transform = "";
    }, 150);
  }

  // Reset scores function (new)
  function resetScores() {
    scores = {
      X: 0,
      O: 0,
    };
    updateScoreboard();
  }

  // Initialize the game
  function initGame() {
    // Reset scores on page load instead of loading from localStorage
    resetScores();

    // Add event listeners
    cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
    restartButton.addEventListener("click", handleRestartGame);
  }

  // Start the game
  initGame();
});
