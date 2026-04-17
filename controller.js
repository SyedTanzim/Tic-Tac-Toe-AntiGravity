import { Model } from './model.js';
import { View } from './view.js';

export const Controller = (function () {
    // Initialize the application by setting up view bindings and rendering the initial state
    function init() {
        View.initModals();
        View.bindStartGame(handleStartGame);
        View.bindRestartGame(handleRestartGame);
        updateView();
    }

    // Handles the start game button click, setting up players, modes, and resetting the board
    function handleStartGame(options) {
        Model.setGameMode(options.gameMode);
        Model.setPlayer1Name(options.p1Name);
        
        if (options.gameMode === 'pvc') {
            Model.setPlayer2Name('Computer');
            Model.setAiDifficulty(options.aiDifficulty);
        } else {
            Model.setPlayer2Name(options.p2Name);
        }

        View.updateScoreBoard(Model.getPlayer1().name, Model.getPlayer2().name, Model.getScores());
        View.hideStartModal();
        Model.resetBoard();
        updateView();
    }

    // Handles the restart game button click, resetting the board and possibly triggering AI
    function handleRestartGame() {
        Model.resetBoard();
        View.hideWinnerBanner();
        updateView();
        
        if (Model.getGameMode() === 'pvc' && Model.getCurrentPlayer() === Model.getPlayer2()) {
            makeAiMove();
        }
    }

    // Handles a user click on a cell
    function handleCellClick(row, col) {
        playTurn(row, col);
    }

    // Core game logic for executing a turn (placing mark, checking win/tie, switching turn)
    function playTurn(row, col) {
        if (Model.getIsGameOver()) return false;

        const success = Model.setMark(row, col, Model.getCurrentPlayer().mark);
        if (!success) return false;

        View.playSound('click');

        const currentBoard = Model.getBoard();
        const winInfo = Model.checkWinInfo(currentBoard);

        if (winInfo) {
            Model.setIsGameOver(true);
            if (Model.getCurrentPlayer() === Model.getPlayer1()) Model.incrementScoreP1();
            else Model.incrementScoreP2();
            
            View.updateScoreBoard(Model.getPlayer1().name, Model.getPlayer2().name, Model.getScores());
            View.playSound('win');
            View.showWin(`${Model.getCurrentPlayer().name} Wins!`);
            View.playConfetti();
            updateView(winInfo.line);
        } else if (Model.checkTie(currentBoard)) {
            Model.setIsGameOver(true);
            Model.incrementScoreDraws();
            View.updateScoreBoard(Model.getPlayer1().name, Model.getPlayer2().name, Model.getScores());
            View.playSound('draw');
            View.showWin("It's a Tie!");
            updateView();
        } else {
            Model.switchTurn();
            updateView();
            
            if (Model.getGameMode() === 'pvc' && Model.getCurrentPlayer() === Model.getPlayer2()) {
                makeAiMove();
            }
        }
        return true;
    }

    // Triggers the AI to make a move after a short delay
    function makeAiMove() {
        if (Model.getIsGameOver()) return;
        const move = Model.getBestMove();
        if (move) {
            setTimeout(() => {
                playTurn(move.row, move.col);
            }, 400);
        }
    }

    // Updates the view based on the current model state
    function updateView(winCells = null) {
        const isAiTurn = Model.getGameMode() === 'pvc' && Model.getCurrentPlayer() === Model.getPlayer2();
        View.renderBoard(Model.getBoard(), winCells, Model.getIsGameOver(), isAiTurn, handleCellClick);
    }

    return { init };
})();
