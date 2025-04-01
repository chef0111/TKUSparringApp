// regulations.js

let lastHitTime = 0;
const HIT_COOLDOWN = 100;

function subtractHealth(player, healthPoints, event) {
    // Prevent rapid hits
    const currentTime = Date.now();
    if (currentTime - lastHitTime < HIT_COOLDOWN) {
        return;
    }
    lastHitTime = currentTime;

    if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
    }

    const healthElement = document.getElementById(`${player === 'red' ? 'blue' : 'red'}HP`);
    const delayedHealthElement = document.getElementById(`${player === 'red' ? 'blue' : 'red'}DelayedHP`);
    const healthKey = player === 'red' ? 'blueHealth' : 'redHealth';
    const dmgScoreElement = document.getElementById(`${player}DmgScore`);
    const hitsElement = document.getElementById(`${player}-hits`);

    // Get current health state
    const currentHealth = gameState.getState(healthKey);
    if (currentHealth === undefined || currentHealth <= 0) {
        return; // Don't process if health is already 0 or undefined
    }

    document.getElementById('redDmgScore').style.visibility = 'visible';
    document.getElementById('blueDmgScore').style.visibility = 'visible';

    // Map healthPoints to health deduction and icon path
    let healthDeduction = 0;
    let iconPath = '';
    switch (healthPoints) {
        case 5: 
            healthDeduction = 25; 
            iconPath = `assets/${player}HeadCrit.webp`;
            break;
        case 4: 
            healthDeduction = 20; 
            iconPath = `assets/${player}TrunkCrit.webp`;
            break;
        case 3: 
            healthDeduction = 15; 
            iconPath = `assets/${player}Head.webp`;
            break;
        case 2: 
            healthDeduction = 10; 
            iconPath = `assets/${player}Trunk.webp`;
            break;
        case 1: 
            healthDeduction = 5; 
            iconPath = `assets/${player}Punch.webp`;
            break;
    }

    // Pre-load images
    const preLoadImg = new Image();
    preLoadImg.src = iconPath;

    // Capture state before changes for undo
    const currentScore = gameState.getState(player === 'red' ? 'redScore' : 'blueScore');
    const currentHits = gameState.getState(player === 'red' ? 'redHits' : 'blueHits');

    // Push action to history
    gameState.pushAction({
        type: 'hit',
        player: player,
        healthKey: healthKey,
        healthDeduction: healthDeduction,
        points: healthPoints * 5,
        previousHealth: currentHealth,
        previousScore: currentScore,
        previousHits: currentHits,
        iconPath: iconPath
    });

    // Calculate new health and ensure it can't increase
    let newHealth = Math.max(0, currentHealth - healthDeduction);
    if (newHealth > currentHealth) {
        newHealth = currentHealth;
    }
    
    // Update game state immediately
    gameState.setState(healthKey, newHealth);

    // Update health bars synchronously
    const healthPercentage = (newHealth / gameState.getState('maxHealth')) * 100;
    healthElement.style.width = `${healthPercentage}%`;
    delayedHealthElement.style.width = `${healthPercentage}%`;

    // Avatar effects for critical hits
    if (healthDeduction === 20 || healthDeduction === 25) {
        const opponentAvatarImage = document.querySelector(`.${player === 'red' ? 'blueAvatar' : 'redAvatar'}`);
        const opponentAvatarContainer = opponentAvatarImage.closest('.avatar');
        opponentAvatarContainer.classList.remove('criticalHitContainer');
        void opponentAvatarContainer.offsetWidth; // Force reflow
        opponentAvatarContainer.classList.add('criticalHitContainer');
        opponentAvatarImage.classList.remove('criticalHitImage');
        void opponentAvatarImage.offsetWidth; // Force reflow
        opponentAvatarImage.classList.add('criticalHitImage');
    }

    // Update score and hits
    gameState.incrementScore(player, healthPoints * 5);
    gameState.incrementHits(player, 1);
    hitsElement.textContent = gameState.getState(player === 'red' ? 'redHits' : 'blueHits');

    // Display hit icon
    let iconClass = 'hitIcon';
    if (healthPoints === 5) {
        iconClass += ' superCritical';
    } else if (healthPoints === 4) {
        iconClass += ' critical';
    }
    dmgScoreElement.innerHTML = `<img src="${iconPath}" class="${iconClass}" alt="hit" loading="eager">`;

    if (newHealth <= 0) {
        updateButtonStates(); // Ensure buttons disable immediately
        setTimeout(() => {
            finishRound();
        }, 2000);
    }
}

function addPenalty(player, points) {
    const penaltyElement = document.getElementById(`${player}-penalty`);
    const manaCount = gameState.getState(`${player}Mana`);
    const currentFouls = gameState.getState(`${player}Fouls`);

    // Capture state before changes for undo
    gameState.pushAction({
        type: 'penalty',
        player: player,
        points: points,
        previousMana: manaCount,
        previousFouls: currentFouls
    });

    // Apply changes
    const newManaCount = Math.max(0, Math.min(5, manaCount - points));
    gameState.incrementFouls(player, points);
    gameState.setState(`${player}Mana`, newManaCount);
    penaltyElement.textContent = gameState.getState(`${player}Fouls`);

    for (let i = 1; i <= 5; i++) {
        const manaMeter = document.getElementById(`${player}MP${i}`);
        if (i <= newManaCount) {
            manaMeter.style.opacity = '1';
            manaMeter.style.display = 'block';
            manaMeter.classList.remove('mana-disappear');
        } else {
            if (manaMeter.style.opacity !== '0') {
                manaMeter.classList.add('mana-disappear');
            }
        }
    }

    if (newManaCount <= 0) {
        finishRound();
    }
}

function declareWinner() {
    const redHealth = gameState.getState('redHealth') || gameState.getState('maxHealth');
    const blueHealth = gameState.getState('blueHealth') || gameState.getState('maxHealth');
    const redTechnique = gameState.getState('redTechnique');
    const blueTechnique = gameState.getState('blueTechnique');
    const redHeadHits = gameState.getState('redHeadHits');
    const blueHeadHits = gameState.getState('blueHeadHits');
    const redFouls = gameState.getState('redFouls');
    const blueFouls = gameState.getState('blueFouls');
    const redMana = gameState.getState('redMana');
    const blueMana = gameState.getState('blueMana');

    console.log(`declareWinner: redHealth=${redHealth}, blueHealth=${blueHealth}, redMana=${redMana}, blueMana=${blueMana}`);

    // Check for mana depletion (penalties)
    if (redMana <= 0) return 'blue';
    if (blueMana <= 0) return 'red';

    // Check for health depletion (KO)
    if (blueHealth <= 0) return 'red';
    if (redHealth <= 0) return 'blue';

    // If no KO, compare remaining health
    if (redHealth > blueHealth) return 'red';
    if (blueHealth > redHealth) return 'blue';

    // If health is equal, compare fouls
    if (redFouls < blueFouls) return 'red';
    if (blueFouls < redFouls) return 'blue';

    // If fouls are equal, compare technique points
    if (redTechnique > blueTechnique) return 'red';
    if (blueTechnique > redTechnique) return 'blue';

    // If technique points are equal, compare 3 pointers
    if (redHeadHits > blueHeadHits) return 'redHeadHits';
    if (blueHeadHits > redHeadHits) return 'blueHeadHits';
    return 'tie';
}

function endRoundWithWinner(winner) {
    const currentRound = gameState.getState('currentRound');
    let redRoundScores = gameState.getState('redRoundScores');
    let blueRoundScores = gameState.getState('blueRoundScores');
    let roundWinners = gameState.getState('roundWinners');

    // Ensure dmgScore is accessible
    document.getElementById('redDmgScore').style.visibility = 'visible';
    document.getElementById('blueDmgScore').style.visibility = 'visible';

    // Store current scores for the round record
    const redScore = gameState.getState('redScore');
    const blueScore = gameState.getState('blueScore');
    redRoundScores[currentRound - 1] = redScore;
    blueRoundScores[currentRound - 1] = blueScore;
    gameState.setState('redRoundScores', redRoundScores);
    gameState.setState('blueRoundScores', blueRoundScores);

    // Update UI with round scores
    document.getElementById(`redR${currentRound}`).textContent = redRoundScores[currentRound - 1];
    document.getElementById(`blueR${currentRound}`).textContent = blueRoundScores[currentRound - 1];

    // Set the winner
    roundWinners[currentRound - 1] = winner;
    gameState.setState('roundWinners', roundWinners);

    // Increment wins
    if (winner === 'red') {
        const redWon = gameState.getState('redWon');
        gameState.setState('redWon', redWon + 1);
        document.getElementById('red-won').textContent = redWon + 1;
        document.querySelector('.redScoreBox .totalWins').textContent = redWon + 1;
        document.getElementById(`redWin${currentRound}`).style.visibility = 'visible';
    } else if (winner === 'blue') {
        const blueWon = gameState.getState('blueWon');
        gameState.setState('blueWon', blueWon + 1);
        document.getElementById('blue-won').textContent = blueWon + 1;
        document.querySelector('.blueScoreBox .totalWins').textContent = blueWon + 1;
        document.getElementById(`blueWin${currentRound}`).style.visibility = 'visible';
    }

    // Reset health and other stats, but keep scores intact
    const maxHealth = gameState.getState('maxHealth');
    gameState.setState('redHealth', maxHealth);
    gameState.setState('blueHealth', maxHealth);
    gameState.setState('redHits', 0);
    gameState.setState('blueHits', 0);
    gameState.setState('redFouls', 0);
    gameState.setState('blueFouls', 0);

    // Update UI for health and other stats immediately
    document.getElementById('redHP').style.width = '100%';
    document.getElementById('blueHP').style.width = '100%';
    document.getElementById('redDelayedHP').style.width = '100%';
    document.getElementById('blueDelayedHP').style.width = '100%';
    
    // Update other UI elements
    document.getElementById('red-hits').textContent = '0';
    document.getElementById('blue-hits').textContent = '0';
    document.getElementById('red-penalty').textContent = '0';
    document.getElementById('blue-penalty').textContent = '0';
    gameState.setState('redScore', 0);
    gameState.setState('blueScore', 0);

    // Pause timer and start break
    pauseTimer();
    startBreakTimer();
    updateButtonStates();
}

function resetRecord() {
    for (let i = 1; i <= gameState.getState('maxRounds'); i++) {
        document.getElementById(`redR${i}`).textContent = '0';
        document.getElementById(`blueR${i}`).textContent = '0';
        document.getElementById(`redWin${i}`).style.visibility = 'hidden';
        document.getElementById(`blueWin${i}`).style.visibility = 'hidden';
    }
}

function resetRound() {
    const isBreakTime = gameState.getState('isBreakTime');
    if (!isBreakTime) {
        // Reset game state values
        gameState.setState('redHealth', gameState.getState('maxHealth'));
        gameState.setState('blueHealth', gameState.getState('maxHealth'));
        gameState.setState('redScore', 0);
        gameState.setState('blueScore', 0);
        gameState.setState('redHits', 0);
        gameState.setState('blueHits', 0);
        gameState.setState('redFouls', 0);
        gameState.setState('blueFouls', 0);

        // Update UI elements
        document.getElementById('red-hits').textContent = gameState.getState('redHits');
        document.getElementById('blue-hits').textContent = gameState.getState('blueHits');
        document.getElementById('red-penalty').textContent = gameState.getState('redFouls');
        document.getElementById('blue-penalty').textContent = gameState.getState('blueFouls');

        // Clear hit icons
        document.getElementById('redDmgScore').innerHTML = '';
        document.getElementById('blueDmgScore').innerHTML = '';
        document.getElementById('redDmgScore').style.visibility = 'visible';
        document.getElementById('blueDmgScore').style.visibility = 'visible';

        hideWinIndicator();

        // Reset health bars
        setTimeout(() => {
            document.getElementById('redHP').style.width = '100%';
            document.getElementById('blueHP').style.width = '100%';
            document.getElementById('redDelayedHP').style.width = '100%';
            document.getElementById('blueDelayedHP').style.width = '100%';
        }, 100);
    }
}

function resetMatch() {
    // Reset game state values
    gameState.setState('redHealth', gameState.getState('maxHealth'));
    gameState.setState('blueHealth', gameState.getState('maxHealth'));
    gameState.setState('redScore', 0);
    gameState.setState('blueScore', 0);
    gameState.setState('redHits', 0);
    gameState.setState('blueHits', 0);
    gameState.setState('redWon', 0);
    gameState.setState('blueWon', 0);
    gameState.setState('redFouls', 0);
    gameState.setState('blueFouls', 0);
    gameState.setState('redRoundScores', [0, 0, 0]);
    gameState.setState('blueRoundScores', [0, 0, 0]);
    gameState.setState('roundWinners', []);
    gameState.setState('currentRound', 1);

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

    clearInterval(gameState.getState('timerInterval'));
    clearInterval(gameState.getState('breakTimerInterval'));

    // Update timer display with the configured duration
    document.getElementById('timer').textContent = formatTime(configuredRoundDuration);

    // Update UI elements
    document.getElementById('redDmgScore').textContent = gameState.getState('redScore');
    document.getElementById('blueDmgScore').textContent = gameState.getState('blueScore');
    document.getElementById('red-hits').textContent = gameState.getState('redHits');
    document.getElementById('blue-hits').textContent = gameState.getState('blueHits');
    document.getElementById('red-won').textContent = gameState.getState('redWon');
    document.getElementById('blue-won').textContent = gameState.getState('blueWon');
    document.getElementById('red-penalty').textContent = gameState.getState('redFouls');
    document.getElementById('blue-penalty').textContent = gameState.getState('blueFouls');
    document.getElementById('round').textContent = gameState.getState('currentRound');

    // Reset health bars
    // Use a small delay to ensure any ongoing animations complete first
    setTimeout(() => {
        document.getElementById('redHP').style.width = '100%';
        document.getElementById('blueHP').style.width = '100%';
        document.getElementById('redDelayedHP').style.width = '100%';
        document.getElementById('blueDelayedHP').style.width = '100%';
    }, 100);

    gameState.clearHistory();
    resetRecord();
    hideRecord();
}