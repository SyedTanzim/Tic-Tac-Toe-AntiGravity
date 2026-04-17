export const View = (function () {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

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
    const container = document.querySelector('.container');

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

    function initModals() {
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
    }

    function getStartGameOptions() {
        return {
            gameMode: document.querySelector('input[name="gameMode"]:checked').value,
            p1Name: p1NameInput.value.trim(),
            p2Name: p2NameInput.value.trim(),
            aiDifficulty: aiDifficultySelect.value
        };
    }

    function hideStartModal() {
        startModal.classList.add('hidden');
    }

    function updateScoreBoard(p1Name, p2Name, scores) {
        scoreP1.textContent = `${p1Name}: ${scores.p1}`;
        scoreP2.textContent = `${p2Name}: ${scores.p2}`;
        scoreDraws.textContent = `Draws: ${scores.draws}`;
    }

    function showWin(message) {
        winnerText.textContent = message;
        winnerBanner.classList.remove('hidden');
    }

    function hideWinnerBanner() {
        winnerBanner.classList.add('hidden');
    }

    function renderBoard(board, winCells, isGameOver, isAiTurn, cellClickHandler) {
        container.textContent = '';
        
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (board[i][j]) {
                    cell.classList.add(board[i][j]);
                    cell.textContent = board[i][j];
                }
                
                if (winCells && winCells.some(c => c[0] === i && c[1] === j)) {
                    cell.classList.add('glow');
                }

                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.tabIndex = 0;

                cell.addEventListener('click', () => {
                    if (isGameOver || board[i][j] != null || isAiTurn) return;
                    cellClickHandler(i, j);
                });

                cell.addEventListener('keydown', (e) => {
                    const rowIdx = parseInt(cell.dataset.row);
                    const colIdx = parseInt(cell.dataset.col);

                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (isGameOver || board[rowIdx][colIdx] != null || isAiTurn) return;
                        cellClickHandler(rowIdx, colIdx);
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

    function bindStartGame(handler) {
        startGameBtn.addEventListener('click', () => {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            handler(getStartGameOptions());
        });
    }

    function bindRestartGame(handler) {
        mainRestartBtn.addEventListener('click', handler);
        bannerRestartBtn.addEventListener('click', handler);
    }

    function playConfetti() {
        if (typeof window.confetti === 'function') {
            window.confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }

    return {
        initModals, hideStartModal, getStartGameOptions, updateScoreBoard, showWin, hideWinnerBanner,
        renderBoard, bindStartGame, bindRestartGame, playSound, playConfetti
    };
})();
