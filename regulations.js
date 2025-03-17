// regulations.js

function subtractHealth(player, healthPoints) {
    console.log(`subtractHealth called: player=${player}, healthPoints=${healthPoints}, redScore=${gameState.getState('redScore')}, blueScore=${gameState.getState('blueScore')}`);

    const healthElement = document.getElementById(`${player === 'red' ? 'blue' : 'red'}HP`);
    const delayedHealthElement = document.getElementById(`${player === 'red' ? 'blue' : 'red'}DelayedHP`);
    const healthKey = player === 'red' ? 'blueHealth' : 'redHealth';
    const dmgScoreElement = document.getElementById(`${player}DmgScore`);
    const hitsElement = document.getElementById(`${player}-hits`);

    // Identify the opponent's avatar image and its container
    const opponentAvatarImage = document.querySelector(`.${player === 'red' ? 'blueAvatar' : 'redAvatar'}`);
    const opponentAvatarContainer = opponentAvatarImage.closest('.avatar');

    // Map healthPoints to health deduction
    let healthDeduction = 0;
    switch (healthPoints) {
        case 5: healthDeduction = 25; break;
        case 4: healthDeduction = 20; break;
        case 3: healthDeduction = 15; break;
        case 2: healthDeduction = 10; break;
        case 1: healthDeduction = 5; break;
    }

    // Deduct health from opponent
    let currentHealth = gameState.getState(healthKey) || gameState.getState('maxHealth');
    let newHealth = currentHealth - healthDeduction;
    newHealth = Math.max(0, newHealth);
    gameState.setState(healthKey, newHealth);

    // Update health bar width
    const healthPercentage = (newHealth / gameState.getState('maxHealth')) * 100;
    healthElement.style.width = `${healthPercentage}%`;
    
    // Update the delayed health indicator to match the health meter with a delay
    // The transition delay is handled in CSS
    delayedHealthElement.style.width = `${healthPercentage}%`;

    // Apply critical hit effect if damage is 20 or 25
    if (healthDeduction === 20 || healthDeduction === 25) {
        opponentAvatarContainer.classList.remove('criticalHitContainer');
        void opponentAvatarContainer.offsetWidth;
        opponentAvatarContainer.classList.add('criticalHitContainer');

        opponentAvatarImage.classList.remove('criticalHitImage');
        void opponentAvatarImage.offsetWidth;
        opponentAvatarImage.classList.add('criticalHitImage');
    }

    // Increment damage score
    gameState.incrementScore(player, healthPoints);
    dmgScoreElement.textContent = gameState.getState(player === 'red' ? 'redScore' : 'blueScore');

    // Increment hits
    gameState.incrementHits(player, 1);
    hitsElement.textContent = gameState.getState(player === 'red' ? 'redHits' : 'blueHits');

    // Check if opponent's health is depleted
    if (newHealth <= 0) {
        setTimeout(() => {
            finishRound();
        }, 2000);
    }
}

function addPenalty(player, points) {
    const penaltyElement = document.getElementById(`${player}-penalty`);
    const manaCount = gameState.getState(`${player}Mana`);
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
    const redFouls = gameState.getState('redFouls');
    const blueFouls = gameState.getState('blueFouls');
    const redHits = gameState.getState('redHits');
    const blueHits = gameState.getState('blueHits');
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

    // If fouls are equal, compare hits
    if (redHits > blueHits) return 'red';
    if (blueHits > redHits) return 'blue';

    return 'tie';
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
    document.getElementById('redDmgScore').textContent = gameState.getState('redScore');
    document.getElementById('blueDmgScore').textContent = gameState.getState('blueScore');
    document.getElementById('red-hits').textContent = gameState.getState('redHits');
    document.getElementById('blue-hits').textContent = gameState.getState('blueHits');
    document.getElementById('red-penalty').textContent = gameState.getState('redFouls');
    document.getElementById('blue-penalty').textContent = gameState.getState('blueFouls');
    
    // Reset health bars
    // Use a small delay to ensure any ongoing animations complete first
    setTimeout(() => {
        document.getElementById('redHP').style.width = '100%';
        document.getElementById('blueHP').style.width = '100%';
        document.getElementById('redDelayedHP').style.width = '100%';
        document.getElementById('blueDelayedHP').style.width = '100%';
    }, 100);
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
    
    resetRecord();
    showScore();
    hideRecord();
}