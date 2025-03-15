// regulations.js

const maxHealth = 100;

function subtractHealth(player, healthPoints) {
    console.log(`subtractHealth called: player=${player}, healthPoints=${healthPoints}, redScore=${gameState.getState('redScore')}, blueScore=${gameState.getState('blueScore')}`);

    const healthElement = document.getElementById(`${player === 'red' ? 'blue' : 'red'}HP`);
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
    let currentHealth = gameState.getState(healthKey) || maxHealth;
    let newHealth = currentHealth - healthDeduction;
    newHealth = Math.max(0, newHealth);
    gameState.setState(healthKey, newHealth);

    // Update health bar width
    const healthPercentage = (newHealth / maxHealth) * 100;
    healthElement.style.width = `${healthPercentage}%`;

    // Apply afterimage effect when health decreases
    if (newHealth < currentHealth) {
        healthElement.classList.remove('afterimage');
        void healthElement.offsetWidth; // Force restart animation
        healthElement.classList.add('afterimage');
    }

    /// Apply critical hit effect if damage is 20 or 25
    if (healthDeduction === 20 || healthDeduction === 25) {
        // Apply to the container for blinking background
        opponentAvatarContainer.classList.remove('criticalHitContainer');
        void opponentAvatarContainer.offsetWidth; // Force animation restart
        opponentAvatarContainer.classList.add('criticalHitContainer');

        // Apply to the image for vibration
        opponentAvatarImage.classList.remove('criticalHitImage');
        void opponentAvatarImage.offsetWidth; // Force animation restart
        opponentAvatarImage.classList.add('criticalHitImage');
    }

    // Increment damage score
    gameState.incrementScore(player, healthPoints);
    console.log(`After incrementScore: redScore=${gameState.getState('redScore')}, blueScore=${gameState.getState('blueScore')}`);
    dmgScoreElement.textContent = gameState.getState(player === 'red' ? 'redScore' : 'blueScore');

    // Increment hits
    gameState.incrementHits(player, 1);
    hitsElement.textContent = gameState.getState(player === 'red' ? 'redHits' : 'blueHits');

    // Check if opponent's health is depleted
    if (newHealth <= 0) {
        setTimeout(() => {
            document.getElementById('redHP').style.width = '100%';
            document.getElementById('blueHP').style.width = '100%';
        }, 3000);
        finishRound();
    }
}

function addPenalty(player, points) {
    const penaltyElement = document.getElementById(`${player}-penalty`);
    const manaCount = gameState.getState(`${player}Mana`);
    const newManaCount = Math.max(0, Math.min(5, manaCount - points));
    gameState.incrementFouls(player, points);
    gameState.setState(`${player}Mana`, newManaCount);

    // Update penalty UI
    penaltyElement.textContent = gameState.getState(`${player}Fouls`);

    // Update Mana meters UI
    for (let i = 1; i <= 5; i++) {
        const manaMeter = document.getElementById(`${player}MP${i}`);
        if (i <= newManaCount) {
            manaMeter.style.opacity = '1'; // Show Mana meter
            manaMeter.style.display = 'block'; // Ensure it's visible
            manaMeter.classList.remove('mana-disappear'); // Remove animation if present
        } else {
            // Apply the fade-out and glow animation when Mana meter disappears
            if (manaMeter.style.opacity !== '0') {
                manaMeter.classList.add('mana-disappear');
            }
        }
    }

    // Check if player has lost all Mana meters
    if (newManaCount <= 0) {
        finishRound();
    }
}

function declareWinner() {
    const redHealth = gameState.getState('redHealth') || maxHealth;
    const blueHealth = gameState.getState('blueHealth') || maxHealth;
    const redFouls = gameState.getState('redFouls');
    const blueFouls = gameState.getState('blueFouls');
    const redHits = gameState.getState('redHits');
    const blueHits = gameState.getState('blueHits');
    const redMana = gameState.getState('redMana');
    const blueMana = gameState.getState('blueMana');

    // Priority 1: Mana depletion
    if (redMana <= 0) return 'blue';
    if (blueMana <= 0) return 'red';

    // Priority 2: Health depletion
    if (redHealth <= 0) return 'red';
    if (blueHealth <= 0) return 'blue';

    // Priority 3: Higher remaining health
    if (redHealth > blueHealth) return 'red';
    if (blueHealth > redHealth) return 'blue';

    // Priority 4: Fewer fouls
    if (redFouls < blueFouls) return 'red';
    if (blueFouls < redFouls) return 'blue';

    // Priority 5: More hits
    if (redHits > blueHits) return 'red';
    if (blueHits > redHits) return 'blue';

    // Default: Tie
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
    gameState.setState('redHealth', maxHealth);
    gameState.setState('blueHealth', maxHealth);
    gameState.setState('redScore', 0); // Reset damage dealt
    gameState.setState('blueScore', 0);
    gameState.setState('redHits', 0);
    gameState.setState('blueHits', 0);
    gameState.setState('redFouls', 0);
    gameState.setState('blueFouls', 0);
    document.getElementById('redDmgScore').textContent = gameState.getState('redScore');
    document.getElementById('blueDmgScore').textContent = gameState.getState('blueScore');
    document.getElementById('red-hits').textContent = gameState.getState('redHits');
    document.getElementById('blue-hits').textContent = gameState.getState('blueHits');
    document.getElementById('red-penalty').textContent = gameState.getState('redFouls');
    document.getElementById('blue-penalty').textContent = gameState.getState('blueFouls');
}

function resetMatch() {
    gameState.setState('redHealth', maxHealth);
    gameState.setState('blueHealth', maxHealth);
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
    document.getElementById('redHP').style.width = '100%';
    document.getElementById('blueHP').style.width = '100%';
    document.getElementById('redDmgScore').textContent = gameState.getState('redScore');
    document.getElementById('blueDmgScore').textContent = gameState.getState('blueScore');
    document.getElementById('red-hits').textContent = gameState.getState('redHits');
    document.getElementById('blue-hits').textContent = gameState.getState('blueHits');
    document.getElementById('red-won').textContent = gameState.getState('redWon');
    document.getElementById('blue-won').textContent = gameState.getState('blueWon');
    document.getElementById('red-penalty').textContent = gameState.getState('redFouls');
    document.getElementById('blue-penalty').textContent = gameState.getState('blueFouls');
    document.getElementById('round').textContent = gameState.getState('currentRound');
    resetRecord();
    showScore();
    hideRecord();
}