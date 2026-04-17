export const Model = (function () {
    let board = [];
    let player1 = { name: 'Player 1', mark: 'X' };
    let player2 = { name: 'Player 2', mark: 'O' };
    let gameMode = 'pvp'; // 'pvp' or 'pvc'
    let aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
    let scores = { p1: 0, p2: 0, draws: 0 };
    let currentPlayer = player1;
    let isGameOver = false;

    function initBoard() {
        board = [];
        for (let i = 0; i < 3; i++) {
            board[i] = [];
            for (let j = 0; j < 3; j++) {
                board[i][j] = null;
            }
        }
    }
    initBoard();

    function getBoard() { return board; }
    function getPlayer1() { return player1; }
    function getPlayer2() { return player2; }
    function getGameMode() { return gameMode; }
    function getAiDifficulty() { return aiDifficulty; }
    function getScores() { return scores; }
    function getCurrentPlayer() { return currentPlayer; }
    function getIsGameOver() { return isGameOver; }

    function setGameMode(mode) { gameMode = mode; }
    function setAiDifficulty(diff) { aiDifficulty = diff; }
    function setPlayer1Name(name) { player1.name = name || 'Player 1'; }
    function setPlayer2Name(name) { player2.name = name || 'Player 2'; }
    function incrementScoreP1() { scores.p1++; }
    function incrementScoreP2() { scores.p2++; }
    function incrementScoreDraws() { scores.draws++; }
    function setIsGameOver(state) { isGameOver = state; }

    function resetBoard() {
        initBoard();
        currentPlayer = player1;
        isGameOver = false;
    }

    function switchTurn() {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    }

    function setMark(row, col, mark) {
        if (board[row][col] === null) {
            board[row][col] = mark;
            return true;
        }
        return false;
    }

    function checkWinInfo(currentBoard) {
        for (let i = 0; i < 3; i++) {
            if (currentBoard[i][0] && currentBoard[i][0] === currentBoard[i][1] && currentBoard[i][1] === currentBoard[i][2]) {
                return { winner: currentBoard[i][0], line: [[i, 0], [i, 1], [i, 2]] };
            }
        }
        for (let j = 0; j < 3; j++) {
            if (currentBoard[0][j] && currentBoard[0][j] === currentBoard[1][j] && currentBoard[1][j] === currentBoard[2][j]) {
                return { winner: currentBoard[0][j], line: [[0, j], [1, j], [2, j]] };
            }
        }
        if (currentBoard[0][0] && currentBoard[0][0] === currentBoard[1][1] && currentBoard[1][1] === currentBoard[2][2]) {
            return { winner: currentBoard[0][0], line: [[0, 0], [1, 1], [2, 2]] };
        }
        if (currentBoard[0][2] && currentBoard[0][2] === currentBoard[1][1] && currentBoard[1][1] === currentBoard[2][0]) {
            return { winner: currentBoard[0][2], line: [[0, 2], [1, 1], [2, 0]] };
        }
        return null;
    }

    function checkTie(currentBoard) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (currentBoard[i][j] === null) return false;
            }
        }
        return true;
    }

    function minimax(currentBoard, depth, isMaximizing) {
        let winInfo = checkWinInfo(currentBoard);
        if (winInfo) {
            if (winInfo.winner === player2.mark) return 10 - depth;
            if (winInfo.winner === player1.mark) return -10 + depth;
        }
        if (checkTie(currentBoard)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (currentBoard[i][j] === null) {
                        currentBoard[i][j] = player2.mark;
                        let score = minimax(currentBoard, depth + 1, false);
                        currentBoard[i][j] = null;
                        bestScore = Math.max(score, bestScore);
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (currentBoard[i][j] === null) {
                        currentBoard[i][j] = player1.mark;
                        let score = minimax(currentBoard, depth + 1, true);
                        currentBoard[i][j] = null;
                        bestScore = Math.min(score, bestScore);
                    }
                }
            }
            return bestScore;
        }
    }

    function getRandomMove(currentBoard) {
        let emptyCells = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (currentBoard[i][j] === null) emptyCells.push({row: i, col: j});
            }
        }
        if (emptyCells.length === 0) return null;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    function getMediumMove(currentBoard) {
        // Can AI win?
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (currentBoard[i][j] === null) {
                    currentBoard[i][j] = player2.mark;
                    if (checkWinInfo(currentBoard) && checkWinInfo(currentBoard).winner === player2.mark) {
                        currentBoard[i][j] = null;
                        return {row: i, col: j};
                    }
                    currentBoard[i][j] = null;
                }
            }
        }
        // Can Human win?
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (currentBoard[i][j] === null) {
                    currentBoard[i][j] = player1.mark;
                    if (checkWinInfo(currentBoard) && checkWinInfo(currentBoard).winner === player1.mark) {
                        currentBoard[i][j] = null;
                        return {row: i, col: j};
                    }
                    currentBoard[i][j] = null;
                }
            }
        }
        return getRandomMove(currentBoard);
    }

    function getHardMove(currentBoard) {
        let bestScore = -Infinity;
        let move = null;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (currentBoard[i][j] === null) {
                    currentBoard[i][j] = player2.mark;
                    let score = minimax(currentBoard, 0, false);
                    currentBoard[i][j] = null;
                    if (score > bestScore) {
                        bestScore = score;
                        move = { row: i, col: j };
                    }
                }
            }
        }
        return move;
    }

    function getBestMove() {
        if (aiDifficulty === 'easy') return getRandomMove(board);
        if (aiDifficulty === 'medium') return getMediumMove(board);
        return getHardMove(board);
    }

    return {
        getBoard, getPlayer1, getPlayer2, getGameMode, getAiDifficulty, getScores,
        getCurrentPlayer, getIsGameOver, setGameMode, setAiDifficulty, setPlayer1Name, setPlayer2Name,
        incrementScoreP1, incrementScoreP2, incrementScoreDraws, setIsGameOver,
        resetBoard, switchTurn, setMark, checkWinInfo, checkTie, getBestMove
    };
})();
