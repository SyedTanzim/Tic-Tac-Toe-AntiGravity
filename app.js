/**
 * Sound effects using Web Audio API
 * @param {string} type - The type of sound to play ('click', 'win', 'draw')
 */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'click') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'win') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.6);
    } else if (type === 'draw') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
    }
}

// Game State
let player1 = { name: 'Player 1', mark: 'X' };
let player2 = { name: 'Player 2', mark: 'O' };
let gameMode = 'pvp'; // 'pvp' or 'pvc'
let aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
let scores = { p1: 0, p2: 0, draws: 0 };

// DOM Elements
const startModal = document.getElementById('startModal');
const startGameBtn = document.getElementById('startGameBtn');
const p1NameInput = document.getElementById('p1Name');
const p2NameInput = document.getElementById('p2Name');
const modeRadios = document.getElementsByName('gameMode');
const difficultySelector = document.getElementById('difficultySelector');
const aiDifficultySelect = document.getElementById('aiDifficulty');
const scoreP1 = document.getElementById('scoreP1');
const scoreP2 = document.getElementById('scoreP2');
const scoreDraws = document.getElementById('scoreDraws');

const winnerBanner = document.getElementById('winnerBanner');
const winnerText = document.getElementById('winnerText');
const bannerRestartBtn = document.getElementById('bannerRestartBtn');
const mainRestartBtn = document.getElementById('mainRestartBtn');

// Modal Logic
modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'pvc') {
            p2NameInput.style.display = 'none';
            difficultySelector.classList.remove('hidden');
        } else {
            p2NameInput.style.display = 'block';
            difficultySelector.classList.add('hidden');
        }
    });
});

startGameBtn.addEventListener('click', () => {
    audioCtx.resume(); // Ensure audio context is ready
    gameMode = document.querySelector('input[name="gameMode"]:checked').value;
    player1.name = p1NameInput.value.trim() || 'Player 1';
    
    if (gameMode === 'pvc') {
        player2.name = 'Computer';
        aiDifficulty = aiDifficultySelect.value;
    } else {
        player2.name = p2NameInput.value.trim() || 'Player 2';
    }
    
    updateScoreBoard();
    startModal.classList.add('hidden');
    gameController.restart();
});

/**
 * Updates the scoreboard DOM elements with current scores.
 */
function updateScoreBoard() {
    scoreP1.textContent = `${player1.name}: ${scores.p1}`;
    scoreP2.textContent = `${player2.name}: ${scores.p2}`;
    scoreDraws.textContent = `Draws: ${scores.draws}`;
}

/**
 * The gameBoard module handles the internal state of the 3x3 grid.
 * @module gameBoard
 */
const gameBoard = (function () {
    let board = [];

    /**
     * Initializes the 3x3 board with null values.
     */
    function init() {
        for (let i = 0; i < 3; i++) {
            board[i] = [];
            for (let j = 0; j < 3; j++) {
                board[i][j] = null;
            }
        }
    }
    init();

    /**
     * Retrieves the current board state.
     * @returns {Array<Array<string|null>>} The 2D array representing the board.
     */
    function getBoard() {
        return board;
    }

    /**
     * Resets the board back to empty cells.
     */
    function resetBoard() {
        init();
    }

    /**
     * Sets a mark at the specified coordinates if the cell is empty.
     * @param {number} row - The row index (0-2).
     * @param {number} col - The column index (0-2).
     * @param {string} mark - The player's mark ('X' or 'O').
     * @returns {boolean} True if the mark was placed, false otherwise.
     */
    function setMark(row, col, mark) {
        if (board[row][col] === null) {
            board[row][col] = mark;
            return true;
        }
        return false;
    }

    return { getBoard, setMark, resetBoard };
})();

/**
 * The gameController module handles the rules and logic of the game, including AI.
 * @module gameController
 */
const gameController = (function () {
    let currentPlayer = player1;
    let isGameOver = false;

    /**
     * Switches the current turn to the other player.
     */
    function switchTurn() {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    }

    /**
     * Retrieves the player whose turn it currently is.
     * @returns {Object} The current player object.
     */
    function getCurrentPlayer() {
        return currentPlayer;
    }

    /**
     * Checks if there's a winning line on the given board.
     * @param {Array<Array<string|null>>} board - The 2D array board to check.
     * @returns {Object|null} An object containing the winner ('X' or 'O') and the winning line coordinates, or null if no win.
     */
    function checkWinInfo(board) {
        // Rows
        for (let i = 0; i < 3; i++) {
            if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
                return { winner: board[i][0], line: [[i, 0], [i, 1], [i, 2]] };
            }
        }
        // Cols
        for (let j = 0; j < 3; j++) {
            if (board[0][j] && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
                return { winner: board[0][j], line: [[0, j], [1, j], [2, j]] };
            }
        }
        // Diagonals
        if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
            return { winner: board[0][0], line: [[0, 0], [1, 1], [2, 2]] };
        }
        if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
            return { winner: board[0][2], line: [[0, 2], [1, 1], [2, 0]] };
        }
        return null;
    }

    /**
     * Checks if the board is completely filled (a tie).
     * @param {Array<Array<string|null>>} board - The 2D array board to check.
     * @returns {boolean} True if tie, false otherwise.
     */
    function checkTie(board) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === null) return false;
            }
        }
        return true;
    }

    /**
     * Minimax algorithm for calculating the optimal move.
     * @param {Array<Array<string|null>>} board - The current board state.
     * @param {number} depth - The current depth of the recursion tree.
     * @param {boolean} isMaximizing - Whether the algorithm is trying to maximize or minimize the score.
     * @returns {number} The calculated score of the node.
     */
    function minimax(board, depth, isMaximizing) {
        let winInfo = checkWinInfo(board);
        if (winInfo) {
            if (winInfo.winner === player2.mark) return 10 - depth; // Computer is maximizing
            if (winInfo.winner === player1.mark) return -10 + depth;
        }
        if (checkTie(board)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] === null) {
                        board[i][j] = player2.mark;
                        let score = minimax(board, depth + 1, false);
                        board[i][j] = null;
                        bestScore = Math.max(score, bestScore);
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] === null) {
                        board[i][j] = player1.mark;
                        let score = minimax(board, depth + 1, true);
                        board[i][j] = null;
                        bestScore = Math.min(score, bestScore);
                    }
                }
            }
            return bestScore;
        }
    }

    /**
     * Picks a random available move (Easy difficulty).
     * @param {Array<Array<string|null>>} board - The current board state.
     * @returns {Object|null} An object with row and col coordinates.
     */
    function getRandomMove(board) {
        let emptyCells = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === null) emptyCells.push({row: i, col: j});
            }
        }
        if (emptyCells.length === 0) return null;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    /**
     * Picks a move blocking an immediate win or taking an immediate win, otherwise random (Medium difficulty).
     * @param {Array<Array<string|null>>} board - The current board state.
     * @returns {Object|null} An object with row and col coordinates.
     */
    function getMediumMove(board) {
        // 1. Can AI win?
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === null) {
                    board[i][j] = player2.mark;
                    if (checkWinInfo(board) && checkWinInfo(board).winner === player2.mark) {
                        board[i][j] = null;
                        return {row: i, col: j};
                    }
                    board[i][j] = null;
                }
            }
        }
        // 2. Can Human win?
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === null) {
                    board[i][j] = player1.mark;
                    if (checkWinInfo(board) && checkWinInfo(board).winner === player1.mark) {
                        board[i][j] = null;
                        return {row: i, col: j};
                    }
                    board[i][j] = null;
                }
            }
        }
        // 3. Random move
        return getRandomMove(board);
    }

    /**
     * Picks the best possible move using Minimax (Hard difficulty).
     * @param {Array<Array<string|null>>} board - The current board state.
     * @returns {Object|null} An object with row and col coordinates.
     */
    function getHardMove(board) {
        let bestScore = -Infinity;
        let move = null;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === null) {
                    board[i][j] = player2.mark;
                    let score = minimax(board, 0, false);
                    board[i][j] = null;
                    if (score > bestScore) {
                        bestScore = score;
                        move = { row: i, col: j };
                    }
                }
            }
        }
        return move;
    }

    /**
     * Selects the AI's move based on the selected difficulty.
     * @returns {Object|null} An object with row and col coordinates.
     */
    function getBestMove() {
        const board = gameBoard.getBoard();
        if (aiDifficulty === 'easy') return getRandomMove(board);
        if (aiDifficulty === 'medium') return getMediumMove(board);
        return getHardMove(board);
    }

    /**
     * Triggers the AI to calculate and make its move.
     */
    function makeAiMove() {
        if (isGameOver) return;
        const move = getBestMove();
        if (move) {
            setTimeout(() => {
                playTurn(move.row, move.col);
            }, 400); // Small delay to feel natural
        }
    }

    /**
     * Handles the logic for a player taking a turn.
     * @param {number} row - The row index clicked/selected.
     * @param {number} col - The column index clicked/selected.
     * @returns {boolean} True if the turn was valid and executed, false otherwise.
     */
    function playTurn(row, col) {
        if (isGameOver) return false;

        const success = gameBoard.setMark(row, col, currentPlayer.mark);
        if (!success) return false;

        playSound('click');

        const currentBoard = gameBoard.getBoard();
        const winInfo = checkWinInfo(currentBoard);

        if (winInfo) {
            isGameOver = true;
            if (currentPlayer === player1) scores.p1++;
            else scores.p2++;
            updateScoreBoard();
            playSound('win');
            displayController.showWin(winInfo.line, `${currentPlayer.name} Wins!`);
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } else if (checkTie(currentBoard)) {
            isGameOver = true;
            scores.draws++;
            updateScoreBoard();
            playSound('draw');
            displayController.showWin([], "It's a Tie!");
        } else {
            switchTurn();
            displayController.renderBoard(currentBoard);
            
            // Trigger AI move if PVC
            if (gameMode === 'pvc' && currentPlayer === player2) {
                makeAiMove();
            }
        }
        
        if (winInfo || checkTie(currentBoard)) {
            displayController.renderBoard(currentBoard); // final render
        }

        return true;
    }

    /**
     * Resets the game state for a new round.
     */
    function restart() {
        currentPlayer = player1;
        isGameOver = false;
        gameBoard.resetBoard();

        winnerBanner.classList.add('hidden');
        displayController.renderBoard(gameBoard.getBoard());
        
        // If computer is player1 (not implemented yet, but for safety)
        if (gameMode === 'pvc' && currentPlayer === player2) {
            makeAiMove();
        }
    }

    return { switchTurn, getCurrentPlayer, playTurn, restart, getIsGameOver: () => isGameOver, checkWinInfo };
})();

/**
 * The displayController module handles DOM manipulation and UI rendering.
 * @module displayController
 */
const displayController = (function () {
    const container = document.querySelector('.container');

    /**
     * Renders the current state of the board onto the screen.
     * @param {Array<Array<string|null>>} board - The 2D array representing the board.
     */
    function renderBoard(board) {
        container.textContent = '';
        
        // Retrieve win line if any
        const winInfo = gameController.getIsGameOver() ? gameController.checkWinInfo(board) : null;
        let winCells = [];
        if (winInfo) {
            winCells = winInfo.line;
        }

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (board[i][j]) {
                    cell.classList.add(board[i][j]);
                    cell.textContent = board[i][j];
                }
                
                // Check if this cell is part of winning line
                if (winCells.some(c => c[0] === i && c[1] === j)) {
                    cell.classList.add('glow');
                }

                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.tabIndex = 0; // Make focusable via keyboard

                cell.addEventListener('click', () => {
                    if (gameController.getIsGameOver() || board[i][j] != null) return;
                    // Prevent human from clicking during AI turn
                    if (gameMode === 'pvc' && gameController.getCurrentPlayer() === player2) return;
                    
                    gameController.playTurn(i, j);
                });

                // Keyboard Accessibility
                cell.addEventListener('keydown', (e) => {
                    const rowIdx = parseInt(cell.dataset.row);
                    const colIdx = parseInt(cell.dataset.col);

                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (gameController.getIsGameOver() || board[rowIdx][colIdx] != null) return;
                        if (gameMode === 'pvc' && gameController.getCurrentPlayer() === player2) return;
                        gameController.playTurn(rowIdx, colIdx);
                    } else if (e.key.startsWith('Arrow')) {
                        e.preventDefault();
                        let newRow = rowIdx;
                        let newCol = colIdx;
                        
                        if (e.key === 'ArrowUp') newRow = Math.max(0, rowIdx - 1);
                        else if (e.key === 'ArrowDown') newRow = Math.min(2, rowIdx + 1);
                        else if (e.key === 'ArrowLeft') newCol = Math.max(0, colIdx - 1);
                        else if (e.key === 'ArrowRight') newCol = Math.min(2, colIdx + 1);
                        
                        const nextCell = container.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
                        if (nextCell) nextCell.focus();
                    }
                });

                container.appendChild(cell);
            }
        }
    }

    /**
     * Displays the winner banner.
     * @param {Array<Array<number>>} line - The winning cells coordinates.
     * @param {string} message - The message to display.
     */
    function showWin(line, message) {
        winnerText.textContent = message;
        winnerBanner.classList.remove('hidden');
    }

    mainRestartBtn.addEventListener('click', () => {
        gameController.restart();
    });

    bannerRestartBtn.addEventListener('click', () => {
        gameController.restart();
    });

    return { renderBoard, showWin };
})();

// Initialize empty board
displayController.renderBoard(gameBoard.getBoard());
