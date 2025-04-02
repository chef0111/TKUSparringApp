// timeRelated.js

function pauseTimer() {
    clearInterval(gameState.getState('timerInterval'));
    gameState.setState('timerRunning', false);
    document.getElementById('timer').style.color = '#fff';
    document.getElementById('timer').classList.remove('blink');
    document.querySelector('.timeoutSection').classList.add('show');
}

function resetTimer() {
    // Use the configured round duration
    const configuredRoundDuration = gameState.getState('configuredRoundDuration') || 60 * 1000;
    gameState.setState('timeLeft', configuredRoundDuration);
    gameState.setState('breakTimeLeft', gameState.getState('breakTimeLeft') || 30 * 1000);
    gameState.setState('timerRunning', false);
    gameState.setState('timerInterval', null);
    gameState.setState('breakTimerRunning', false);
    gameState.setState('breakTimerInterval', null);
    gameState.setState('roundStarted', false);
    gameState.setState('isBreakTime', false);

     // Update timer display with the configured duration
    document.getElementById('timer').textContent = formatTime(configuredRoundDuration);
}

function updateTimer() {
    const timeValue = document.getElementById('timer');
    const timeoutSection = document.querySelector('.timeoutSection');

    let timeLeft = gameState.getState('timeLeft');
    const timerRunning = gameState.getState('timerRunning');
    const roundStarted = gameState.getState('roundStarted');
    const isBreakTime = gameState.getState('isBreakTime');

    // Skip UI updates during break time to avoid interfering with updateBreakTimer
    if (isBreakTime) {
        return; // Let updateBreakTimer handle the UI
    }

    if (timeLeft > 0 && timerRunning) {
        timeLeft -= 10;
        gameState.setState('timeLeft', timeLeft);
        const totalSeconds = Math.floor(timeLeft / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((timeLeft % 1000) / 10);

        if (totalSeconds < 10 && !isBreakTime) {
            timeValue.textContent = `${seconds}.${milliseconds < 10 ? '0' : ''}${milliseconds}`;
            timeValue.classList.add('blink');
        } else {
            timeValue.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            timeValue.style.color = '#fff';
            timeValue.classList.remove('blink');
        }
        timeoutSection.classList.remove('show');
    } else if (timeLeft <= 0 && roundStarted && !isBreakTime) {
        clearInterval(gameState.getState('timerInterval'));
        gameState.setState('timerRunning', false);
        gameState.setState('roundStarted', false); // Mark the round as ended
        timeValue.textContent = '0.00';
        timeValue.style.color = '#fff';
        timeValue.classList.remove('blink');
        timeoutSection.classList.remove('show');

        // Only automatically end the round if there's a winner
        const winner = declareWinner();
        if (winner !== 'tie') {
            finishRound();
        }
    } else if (!timerRunning && timeLeft > 0 && roundStarted && !isBreakTime) {
        const totalSeconds = Math.floor(timeLeft / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((timeLeft % 1000) / 10);

        if (totalSeconds < 10) {
            timeValue.textContent = `${seconds}.${milliseconds < 10 ? '0' : ''}${milliseconds}`;
            timeValue.classList.add('blink');
        } else {
            timeValue.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            timeValue.style.color = '#f8b71d';
            timeValue.classList.remove('blink');
        }
        timeoutSection.classList.add('show');
    } else {
        timeValue.style.color = '#fff';
        timeValue.classList.remove('blink');
        timeoutSection.classList.remove('show');
    }
    updateButtonStates();
}

function updateBreakTimer() {
    const timeValue = document.getElementById('timer');
    const timeBox = document.getElementById('time-box');
    const timeoutSection = document.querySelector('.timeoutSection');
    const timeoutLabel = document.getElementById('timeout-label');

    let breakTimeLeft = gameState.getState('breakTimeLeft');
    const breakTimerRunning = gameState.getState('breakTimerRunning');

    if (breakTimeLeft > 0 && breakTimerRunning) {
        const totalSeconds = Math.floor(breakTimeLeft / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        breakTimeLeft -= 1000;
        gameState.setState('breakTimeLeft', breakTimeLeft);
        timeValue.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        timeValue.style.color = '#fff';
        timeValue.classList.remove('blink');
        timeBox.classList.add('break-time');
        timeoutSection.classList.add('break-time');
        timeoutSection.classList.add('show');
        timeoutLabel.textContent = 'Time out';
    } else {
        clearInterval(gameState.getState('breakTimerInterval'));
        gameState.setState('breakTimerRunning', false);
        gameState.setState('isBreakTime', false);
        hideRecord();
        hideWinIndicator();

        // Check if we can move to the next round
        const currentRound = gameState.getState('currentRound');
        const maxRounds = gameState.getState('maxRounds');
        if (currentRound < maxRounds) {
            // Increment the round
            gameState.setState('currentRound', currentRound + 1);
            document.getElementById('round').textContent = gameState.getState('currentRound');

            // Reset scores for the next round
            gameState.setState('redScore', 0);
            gameState.setState('blueScore', 0);
            document.getElementById('redDmgScore').textContent = '0';
            document.getElementById('blueDmgScore').textContent = '0';

            // Reset the timer to the full configured duration
            const configuredRoundDuration = gameState.getState('configuredRoundDuration');
            gameState.setState('timeLeft', configuredRoundDuration);
            gameState.setState('timerRunning', false);
            gameState.setState('roundStarted', false);

            // Update timer display
            timeValue.textContent = formatTime(configuredRoundDuration);
        } else {
            // If no more rounds, show configured duration for next match
            const configuredRoundDuration = gameState.getState('configuredRoundDuration');
            timeValue.textContent = formatTime(configuredRoundDuration);
        }

        timeValue.style.color = '#fff';
        timeValue.classList.remove('blink');
        timeBox.classList.remove('break-time');
        timeoutSection.classList.remove('break-time');
        timeoutSection.classList.remove('show');
        timeoutLabel.textContent = 'Time out';
    }
}

function toggleTimer() {
    const isBreakTime = gameState.getState('isBreakTime');
    if (isBreakTime) return;

    let timerRunning = gameState.getState('timerRunning');
    const maxRounds = gameState.getState('maxRounds');
    const currentRound = gameState.getState('currentRound');

    if (!timerRunning && currentRound <= maxRounds) {
        gameState.setState('timerRunning', true);
        gameState.setState('roundStarted', true);
        toggleControlButtons(true);
        const interval = setInterval(updateTimer, 10);
        gameState.setState('timerInterval', interval);
        hideRecord();
        hideWinIndicator();
        updateButtonStates(); // Ensure buttons are enabled here
    } else {
        gameState.setState('timerRunning', false);
        clearInterval(gameState.getState('timerInterval'));
        updateButtonStates(); // Update when paused
    }
    updateTimer();
}

function toggleTimeBox() {
    const isBreakTime = gameState.getState('isBreakTime');
    const timeLeft = gameState.getState('timeLeft');
    const maxRounds = gameState.getState('maxRounds');
    const currentRound = gameState.getState('currentRound');

    if (isBreakTime || timeLeft === 0) return;
    if (timeLeft > 0 && currentRound <= maxRounds) {
        let timerRunning = gameState.getState('timerRunning');
        timerRunning = !timerRunning;
        gameState.setState('timerRunning', timerRunning);
        if (timerRunning) {
            gameState.setState('roundStarted', true);
            toggleControlButtons(true);
            startPauseButton.textContent = 'Pause';
            const interval = setInterval(updateTimer, 10);
            gameState.setState('timerInterval', interval);
            hideRecord();
            hideWinIndicator();
        } else {
            startPauseButton.textContent = 'Start';
            clearInterval(gameState.getState('timerInterval'));
        }
        updateTimer();
        updateButtonStates();
    }
}

function startBreakTimer() {
    gameState.setState('breakTimeLeft', 30 * 1000);
    gameState.setState('isBreakTime', true);
    gameState.setState('breakTimerRunning', true);
    clearInterval(gameState.getState('breakTimerInterval'));
    const interval = setInterval(updateBreakTimer, 1000);
    gameState.setState('breakTimerInterval', interval);
    hideScore();
    showRecord();
    updateWinner();
    updateBreakTimer();
    setTimeout(() => {
        document.getElementById('redHP').style.width = '100%';
        document.getElementById('blueHP').style.width = '100%';
    }, 3000);
}

function toggleBreakTimer() {
    const isBreakTime = gameState.getState('isBreakTime');
    if (isBreakTime) {
        let breakTimerRunning = gameState.getState('breakTimerRunning');
        const breakTimeLeft = gameState.getState('breakTimeLeft');
        if (!breakTimerRunning && breakTimeLeft > 0) {
            gameState.setState('breakTimerRunning', true);
            const interval = setInterval(updateBreakTimer, 1000);
            gameState.setState('breakTimerInterval', interval);
        } else if (breakTimerRunning) {
            clearInterval(gameState.getState('breakTimerInterval'));
            gameState.setState('breakTimerRunning', false);
        }
        updateBreakTimer();
        resetMana();
    }
    // Clear hit icons
    document.getElementById('redDmgScore').innerHTML = '';
    document.getElementById('blueDmgScore').innerHTML = '';
    document.getElementById('redDmgScore').style.visibility = 'visible';
    document.getElementById('blueDmgScore').style.visibility = 'visible';
}

function hideRecord() {
    document.querySelector('.redScoreBox .recordSection').style.visibility = 'hidden';
    document.querySelector('.blueScoreBox .recordSection').style.visibility = 'hidden';
    document.querySelector('.redScoreBox .totalWins').style.visibility = 'hidden';
    document.querySelector('.blueScoreBox .totalWins').style.visibility = 'hidden';
}

function hideScore() {
    document.querySelector('.redScoreBox .dmgScore').style.visibility = 'hidden';
    document.querySelector('.blueScoreBox .dmgScore').style.visibility = 'hidden';
}

function hideWinIndicator() {
    const maxRounds = gameState.getState('maxRounds');
    for (let i = 1; i <= maxRounds; i++) {
        document.getElementById(`redWin${i}`).style.visibility = 'hidden';
        document.getElementById(`blueWin${i}`).style.visibility = 'hidden';
    }
}

function showRecord() {
    document.querySelector('.redScoreBox .recordSection').style.visibility = 'visible';
    document.querySelector('.blueScoreBox .recordSection').style.visibility = 'visible';
    document.querySelector('.redScoreBox .totalWins').style.visibility = 'visible';
    document.querySelector('.blueScoreBox .totalWins').style.visibility = 'visible';
}

function updateWinner() {
    const currentRound = gameState.getState('currentRound');
    const roundWinners = gameState.getState('roundWinners');
    for (let i = 1; i <= currentRound; i++) {
        document.getElementById(`redWin${i}`).style.visibility = roundWinners[i - 1] === 'red' ? 'visible' : 'hidden';
        document.getElementById(`blueWin${i}`).style.visibility = roundWinners[i - 1] === 'blue' ? 'visible' : 'hidden';
    }
}

function toggleControlButtons(enabled) {
    const buttons = document.querySelectorAll('.controlPanel button');
    buttons.forEach(button => {
        button.disabled = !enabled;
    });
}