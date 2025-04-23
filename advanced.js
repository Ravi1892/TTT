document.addEventListener("DOMContentLoaded", () => {
  const cells = document.querySelectorAll("[data-cell-index]");
  const statusDisplay = document.querySelector(".status");
  const restartButton = document.querySelector(".restart");
  const scoreX = document.getElementById("score-x");
  const scoreO = document.getElementById("score-o");

  let gameActive = true;
  let currentPlayer = "X";

  // Store player moves in order, so we can track and remove the oldest one
  let playerXMoves = [];
  let playerOMoves = [];

  // Keep track of marks on the board (empty string means no mark)
  let gameState = ["", "", "", "", "", "", "", "", ""];

  // Track scores
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
  const removeSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/235/235.wav"
  );
  const warningSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2869/2869.wav"
  );

  // Lower the volume a bit
  clickSound.volume = 0.3;
  winSound.volume = 0.3;
  drawSound.volume = 0.3;
  removeSound.volume = 0.3;
  warningSound.volume = 0.2;

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

  // Function to update UI to show which mark will disappear next
  function updateWarningState() {
    // Clear all warning states first
    cells.forEach((cell) => {
      cell.classList.remove("warning-fade");
    });

    // Add warning to the oldest mark of the CURRENT player (not next player)
    const playerMoves = currentPlayer === "X" ? playerXMoves : playerOMoves;

    if (playerMoves.length === 3) {
      const oldestMoveIndex = playerMoves[0];
      const oldestCell = document.querySelector(
        `[data-cell-index="${oldestMoveIndex}"]`
      );

      if (oldestCell) {
        oldestCell.classList.add("warning-fade");

        // Play warning sound
        warningSound.currentTime = 0;
        warningSound.play().catch((e) => console.log("Audio play error:", e));
      }
    }
  }

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

    // Handle the cell being played - this will update the game state and handle mark removal
    handleCellPlayed(clickedCell, clickedCellIndex);

    // Check for a win immediately after placing the mark
    let gameWon = handleResultValidation();

    // Only change player and update warning if game is not won
    if (!gameWon && gameActive) {
      changePlayer();
      // Update warning state AFTER player change to highlight current player's oldest mark
      updateWarningState();
    }

    // No setTimeout delay here anymore - makes player transition immediate
  }

  function handleCellPlayed(clickedCell, clickedCellIndex) {
    // Add the new move to the current player's moves array
    if (currentPlayer === "X") {
      playerXMoves.push(clickedCellIndex);

      // If player X has more than 3 marks, remove the oldest one
      if (playerXMoves.length > 3) {
        const oldestMoveIndex = playerXMoves.shift();
        const oldestCell = document.querySelector(
          `[data-cell-index="${oldestMoveIndex}"]`
        );

        oldestCell.classList.remove("warning-fade");

        // Clear the oldest mark with full fade-out animation
        animateMarkRemoval(oldestCell, "x", oldestMoveIndex);
      }
    } else {
      playerOMoves.push(clickedCellIndex);

      // If player O has more than 3 marks, remove the oldest one
      if (playerOMoves.length > 3) {
        const oldestMoveIndex = playerOMoves.shift();
        const oldestCell = document.querySelector(
          `[data-cell-index="${oldestMoveIndex}"]`
        );

        oldestCell.classList.remove("warning-fade");

        // Clear the oldest mark with full fade-out animation
        animateMarkRemoval(oldestCell, "o", oldestMoveIndex);
      }
    }

    // Set the new mark
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
  }

  function animateMarkRemoval(cell, playerClass, cellIndex) {
    // Add fade-out class for animation
    cell.classList.add("fade-out");

    // Play remove sound
    removeSound.currentTime = 0;
    removeSound.play().catch((e) => console.log("Audio play error:", e));

    // Update game state immediately to prevent winning with a removed mark
    gameState[cellIndex] = "";

    // Wait for animation to complete before clearing the cell visually
    setTimeout(() => {
      cell.textContent = "";
      cell.classList.remove(playerClass);
      cell.classList.remove("fade-out");
    }, 500);
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

      // Remove all warning indicators when game is won
      cells.forEach((cell) => {
        cell.classList.remove("warning-fade");
      });

      return true;
    }

    // In this mode, we never have a true "draw" state since players can always keep moving
    // But we can check if the board is full (temporary draw state)
    const allCellsFilled = !gameState.includes("");
    if (allCellsFilled) {
      // Play draw sound
      drawSound.currentTime = 0;
      drawSound.play().catch((e) => console.log("Audio play error:", e));

      statusDisplay.textContent = "Board full, keep playing!";
      setTimeout(() => {
        if (gameActive) {
          statusDisplay.textContent = currentPlayerTurn();
        }
      }, 2000);
    }

    return false;
  }

  function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.textContent = currentPlayerTurn();
  }

  function updateScoreboard() {
    if (scoreX && scoreO) {
      scoreX.textContent = scores.X;
      scoreO.textContent = scores.O;

      // Animate score update
      const scoreElement = currentPlayer === "X" ? scoreX : scoreO;
      scoreElement.classList.add("winner-animation");

      setTimeout(() => {
        scoreElement.classList.remove("winner-animation");
      }, 1000);
    }
  }

  function handleRestartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    playerXMoves = [];
    playerOMoves = [];
    statusDisplay.textContent = currentPlayerTurn();

    cells.forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove(
        "x",
        "o",
        "winner-animation",
        "fade-out",
        "warning-fade"
      );
    });

    // Play click sound
    clickSound.currentTime = 0;
    clickSound.play().catch((e) => console.log("Audio play error:", e));

    // Button animation
    restartButton.style.transform = "scale(0.95)";
    setTimeout(() => {
      restartButton.style.transform = "";
    }, 150);

    // Initialize warning for player X (first player)
    updateWarningState();
  }

  // Initialize the game
  function initGame() {
    // Reset scores
    scores = {
      X: 0,
      O: 0,
    };

    if (scoreX && scoreO) {
      updateScoreboard();
    }

    // Add event listeners
    cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
    restartButton.addEventListener("click", handleRestartGame);

    // Initialize warning for player X (first player)
    updateWarningState();
  }

  // Start the game
  initGame();
});
