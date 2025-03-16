// eventListeners.js
const getState = gameState.getState.bind(gameState);
const setState = gameState.setState.bind(gameState);

function activeButtonEffect(button) {
    const DELAY_TIME = 100;
    const keyList = ['a', 's', 'd', 'f', 'g', 'q', 'w', 'e', 'r', 't'];
    const formattedKey = button.toLowerCase(); // Normalize to lowercase
    const activeButton = document.getElementById('button-' + formattedKey);

    if (keyList.includes(formattedKey)) {
        const buttonNotes = activeButton.querySelectorAll('.buttonNote');
        activeButton.classList.add('active');
        buttonNotes.forEach((note) => {
            note.classList.add('active');
        });
        setTimeout(() => {
            activeButton.classList.remove('active');
            buttonNotes.forEach((note) => {
                note.classList.remove('active');
            });
        }, DELAY_TIME);
    }
}

function updateButtonStates() {
    const roundStarted = getState('roundStarted');
    const isBreakTime = getState('isBreakTime');
    const timeLeft = getState('timeLeft');
    const scoringButtons = document.querySelectorAll('button.scoringButton');
    console.log(`updateButtonStates: roundStarted=${roundStarted}, isBreakTime=${isBreakTime}, timeLeft=${timeLeft}`);
    scoringButtons.forEach(button => {
        const shouldEnable = roundStarted && !isBreakTime && timeLeft > 0;
        button.disabled = !shouldEnable;
        console.log(`Button ${button.outerHTML} disabled: ${button.disabled}, shouldEnable: ${shouldEnable}`);
    });
}

window.updateButtonStates = updateButtonStates;

document.addEventListener('DOMContentLoaded', () => {
    const timeBox = document.getElementById('time-box');
    console.log('timeBox element:', timeBox);
    if (timeBox) {
        timeBox.addEventListener('click', toggleTimeBox);
    } else {
        console.error('timeBox element not found');
    }

    const redPenaltyBox = document.getElementById('redPenalty');
    const bluePenaltyBox = document.getElementById('bluePenalty');

    redPenaltyBox.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.button === 0 && getState('roundStarted') && !getState('isBreakTime') && getState('timeLeft') > 0) {
            addPenalty('red', 1);
        }
    });

    redPenaltyBox.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (getState('roundStarted') && !getState('isBreakTime') && getState('timeLeft') > 0) {
            addPenalty('red', -1);
        }
    });

    bluePenaltyBox.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.button === 0 && getState('roundStarted') && !getState('isBreakTime') && getState('timeLeft') > 0) {
            addPenalty('blue', 1);
        }
    });

    bluePenaltyBox.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (getState('roundStarted') && !getState('isBreakTime') && getState('timeLeft') > 0) {
            addPenalty('blue', -1);
        }
    });

    updateButtonStates();

    const scoringButtons = document.querySelectorAll('button.scoringButton');
    scoringButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            console.log(`Scoring button clicked: ${button.outerHTML}, disabled: ${button.disabled}`);
        });
    });

    const redAvatar = document.querySelector('.redAvatar');
    const blueAvatar = document.querySelector('.blueAvatar');

    redAvatar.addEventListener('dblclick', () => {
        const roundStarted = getState('roundStarted');
        const isBreakTime = getState('isBreakTime');
        const currentRound = getState('currentRound');
        const maxRounds = getState('maxRounds');
        const redWon = getState('redWon');
        const blueWon = getState('blueWon');

        if (roundStarted && !isBreakTime && currentRound <= maxRounds && redWon < 2 && blueWon < 2) {
            let roundWinners = getState('roundWinners');
            roundWinners[currentRound - 1] = 'red';
            setState('roundWinners', roundWinners);
            setState('redWon', redWon + 1);
            document.getElementById('red-won').textContent = getState('redWon');
            document.querySelector('.redScoreBox .totalWins').textContent = getState('redWon');
            pauseTimer();
            resetRound();
            startBreakTimer();
            document.getElementById(`redWin${currentRound}`).style.visibility = 'visible';
            updateButtonStates();

            if (getState('redWon') === 2) {
                setTimeout(() => {
                    showMatchResultModal('red');
                }, 3000);
            }
        }
    });

    blueAvatar.addEventListener('dblclick', () => {
        const roundStarted = getState('roundStarted');
        const isBreakTime = getState('isBreakTime');
        const currentRound = getState('currentRound');
        const maxRounds = getState('maxRounds');
        const redWon = getState('redWon');
        const blueWon = getState('blueWon');

        if (roundStarted && !isBreakTime && currentRound <= maxRounds && redWon < 2 && blueWon < 2) {
            let roundWinners = getState('roundWinners');
            roundWinners[currentRound - 1] = 'blue';
            setState('roundWinners', roundWinners);
            setState('blueWon', blueWon + 1);
            document.getElementById('blue-won').textContent = getState('blueWon');
            document.querySelector('.blueScoreBox .totalWins').textContent = getState('blueWon');
            pauseTimer();
            resetRound();
            startBreakTimer();
            document.getElementById(`blueWin${currentRound}`).style.visibility = 'visible';
            updateButtonStates();

            if (getState('blueWon') === 2) {
                setTimeout(() => {
                    showMatchResultModal('blue');
                }, 3000);
            }
        }
    });

    document.addEventListener('keydown', function (event) {
        const isBreakTime = getState('isBreakTime');
        const timeLeft = getState('timeLeft');
        const roundStarted = getState('roundStarted');
        const redHealth = getState('redHealth');
        const blueHealth = getState('blueHealth');

        console.log(`Keydown event: key=${event.key}, roundStarted=${roundStarted}, isBreakTime=${isBreakTime}, timeLeft=${timeLeft}`);

        if (!isBreakTime && timeLeft > 0) {
            if (event.code === 'Space') {
                event.preventDefault();
                toggleTimer();
                updateButtonStates();
            }
        }

        if (roundStarted && !isBreakTime && timeLeft > 0 && redHealth > 0 && blueHealth > 0) {
            if (!event.ctrlKey) {
                const key = event.key.toLowerCase(); // Normalize key to lowercase
                switch (key) {
                    case 'a': event.preventDefault(); subtractHealth('blue', 1); break;
                    case 's': event.preventDefault(); subtractHealth('blue', 2); break;
                    case 'd': event.preventDefault(); subtractHealth('blue', 3); break;
                    case 'f': event.preventDefault(); subtractHealth('blue', 4); break;
                    case 'g': event.preventDefault(); subtractHealth('blue', 5); break;
                    case 'q': event.preventDefault(); subtractHealth('red', 1); break;
                    case 'w': event.preventDefault(); subtractHealth('red', 2); break;
                    case 'e': event.preventDefault(); subtractHealth('red', 3); break;
                    case 'r': event.preventDefault(); subtractHealth('red', 4); break;
                    case 't': event.preventDefault(); subtractHealth('red', 5); break;
                }
                activeButtonEffect(key); // Pass normalized key
            }

            if (event.ctrlKey) {
                const ctrlKey = event.key.toLowerCase(); // Normalize Ctrl+key
                switch (ctrlKey) {
                    case 'r':
                        event.preventDefault();
                        resetRound();
                        document.getElementById('redHP').style.width = '100%';
                        document.getElementById('blueHP').style.width = '100%';
                        updateButtonStates();
                        break;
                    case 'f':
                        event.preventDefault();
                        finishRound();
                        break;
                }
            }
        }

        if (isBreakTime) {
            if (event.code === 'Space') {
                event.preventDefault();
                toggleBreakTimer();
                updateButtonStates();
            }
        }

        if (event.ctrlKey) {
            const ctrlKey = event.key.toLowerCase(); // Normalize Ctrl+key
            if (ctrlKey === 'm') {
                event.preventDefault();
                nextMatch();
                updateButtonStates();
            }
        }
    });

    const modal = document.getElementById('match-result-modal');
    const closeBtn = document.getElementById('modal-close');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        toggleBreakTimer();
        nextMatch();
        updateButtonStates();
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            toggleBreakTimer();
            nextMatch();
            updateButtonStates();
        }
    });
});

function finishRound() {
    const currentRound = getState('currentRound');
    let redRoundScores = getState('redRoundScores');
    let blueRoundScores = getState('blueRoundScores');
    let roundWinners = getState('roundWinners');

    const redScore = getState('redScore');
    const blueScore = getState('blueScore');

    redRoundScores[currentRound - 1] = redScore;
    blueRoundScores[currentRound - 1] = blueScore;
    setState('redRoundScores', redRoundScores);
    setState('blueRoundScores', blueRoundScores);

    document.getElementById(`redR${currentRound}`).textContent = redRoundScores[currentRound - 1];
    document.getElementById(`blueR${currentRound}`).textContent = blueRoundScores[currentRound - 1];

    let winner = declareWinner();
    if (redScore > 0 && blueScore === 100) {
        winner = "blue";
    } else if (blueScore > 0 && redScore === 100) {
        winner = "red";
    }

    roundWinners[currentRound - 1] = winner;
    setState('roundWinners', roundWinners);

    document.getElementById(`redWin${currentRound}`).style.visibility = 'hidden';
    document.getElementById(`blueWin${currentRound}`).style.visibility = 'hidden';

    if (winner === 'red' && !getState('isBreakTime')) {
        const redWon = getState('redWon');
        setState('redWon', redWon + 1);
        document.getElementById('red-won').textContent = getState('redWon');
        document.querySelector('.redScoreBox .totalWins').textContent = getState('redWon');
        document.getElementById(`redWin${currentRound}`).style.visibility = 'visible';
        console.log(`Incremented redWon to ${getState('redWon')}`);
    } else if (winner === 'blue' && !getState('isBreakTime')) {
        const blueWon = getState('blueWon');
        setState('blueWon', blueWon + 1);
        document.getElementById('blue-won').textContent = getState('blueWon');
        document.querySelector('.blueScoreBox .totalWins').textContent = getState('blueWon');
        document.getElementById(`blueWin${currentRound}`).style.visibility = 'visible';
        console.log(`Incremented blueWon to ${getState('blueWon')}`);
    } else if (winner === 'tie') {
        console.log('Round ended in a tie, no wins incremented');
    }

    pauseTimer();
    const redWon = getState('redWon');
    const blueWon = getState('blueWon');

    if (redWon === 2 || blueWon === 2) {
        const matchWinner = redWon === 2 ? 'red' : 'blue';
        startBreakTimer();
        setTimeout(() => {
            showMatchResultModal(matchWinner);
        }, 3000);
    } else {
        resetRound();
        startBreakTimer();
        setState('redMana', 5);
        setState('blueMana', 5);
        setTimeout(() => {
            resetMana();
        }, 1000);
        updateButtonStates();
    }
}

function showMatchResultModal(winner) {
    const modal = document.getElementById('match-result-modal');
    const blueScoreElement = document.getElementById('modal-blue-score');
    const redScoreElement = document.getElementById('modal-red-score');
    const winnerNameElement = document.getElementById('modal-winner-name');
    const winnerAvatarElement = document.getElementById('modal-winner-avatar');

    blueScoreElement.textContent = getState('blueWon');
    redScoreElement.textContent = getState('redWon');

    winnerNameElement.classList.remove('red-winner', 'blue-winner');

    // Use player names from configuration data
    const redPlayerName = document.getElementById('redPlayer').textContent;
    const bluePlayerName = document.getElementById('bluePlayer').textContent;

    if (winner === 'red') {
        winnerNameElement.textContent = redPlayerName;
        winnerAvatarElement.src = 'assets/CapybaraTKU1.png';
        winnerNameElement.classList.add('red-winner');
    } else if (winner === 'blue') {
        winnerNameElement.textContent = bluePlayerName;
        winnerAvatarElement.src = 'assets/CapybaraTKU2.png';
        winnerNameElement.classList.add('blue-winner');
    }

    modal.style.display = 'flex';
    updateButtonStates();
}

function resetMana() {
    for (let i = 1; i <= 5; i++) {
        const redManaMeter = document.getElementById(`redMP${i}`);
        const blueManaMeter = document.getElementById(`blueMP${i}`);
        redManaMeter.style.opacity = '1';
        blueManaMeter.style.opacity = '1';
        redManaMeter.style.display = 'block';
        blueManaMeter.style.display = 'block';
        redManaMeter.classList.remove('mana-disappear');
        blueManaMeter.classList.remove('mana-disappear');
    }
}

function nextMatch() {
    setState('redScore', 0);
    setState('blueScore', 0);
    setState('redHits', 0);
    setState('blueHits', 0);
    setState('redWon', 0);
    setState('blueWon', 0);
    setState('redFouls', 0);
    setState('blueFouls', 0);
    setState('redMana', 5);
    setState('blueMana', 5);
    setState('redHealth', getState('maxHealth'));
    setState('blueHealth', getState('maxHealth'));
    setState('currentRound', 1);
    setState('redRoundScores', [0, 0, 0]);
    setState('blueRoundScores', [0, 0, 0]);
    setState('roundWinners', []);
    setState('timeLeft', getState('timeLeft')); // Already set by config
    setState('breakTimeLeft', getState('breakTimeLeft')); // Already set by config
    setState('timerRunning', false);
    setState('timerInterval', null);
    setState('breakTimerRunning', false);
    setState('breakTimerInterval', null);
    setState('roundStarted', false);
    setState('isBreakTime', false);

    clearInterval(getState('timerInterval'));
    clearInterval(getState('breakTimerInterval'));

    document.getElementById('redDmgScore').textContent = '0';
    document.getElementById('blueDmgScore').textContent = '0';
    document.getElementById('red-hits').textContent = '0';
    document.getElementById('blue-hits').textContent = '0';
    document.getElementById('red-won').textContent = '0';
    document.getElementById('blue-won').textContent = '0';
    document.getElementById('red-penalty').textContent = '0';
    document.getElementById('blue-penalty').textContent = '0';
    document.getElementById('round').textContent = '1';

    // Update timer display based on configured round duration
    const timeLeft = getState('timeLeft');
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    document.getElementById('start-pause').textContent = 'Start';
    document.getElementById('redHP').style.width = '100%';
    document.getElementById('blueHP').style.width = '100%';

    document.querySelector('.redScoreBox .totalWins').textContent = '0';
    document.querySelector('.blueScoreBox .totalWins').textContent = '0';

    for (let i = 1; i <= getState('maxRounds'); i++) {
        document.getElementById(`redR${i}`).textContent = '0';
        document.getElementById(`blueR${i}`).textContent = '0';
        const redWinElement = document.getElementById(`redWin${i}`);
        const blueWinElement = document.getElementById(`blueWin${i}`);
        if (redWinElement) redWinElement.style.visibility = 'hidden';
        if (blueWinElement) blueWinElement.style.visibility = 'hidden';
    }
    resetMana();
    showScore();
    hideRecord();
    hideWinIndicator();
    updateButtonStates();
}