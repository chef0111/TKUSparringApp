// script.js
const gameState = {
    state: {
        redScore: 0,
        blueScore: 0,
        redHits: 0,
        blueHits: 0,
        redHeadHits: 0,
        blueHeadHits: 0,
        redWon: 0,
        blueWon: 0,
        redFouls: 0,
        blueFouls: 0,
        redHealth: 120,
        blueHealth: 120,
        redMana: 5,
        blueMana: 5,
        currentRound: 1,
        redTechnique: 0,
        blueTechnique: 0,
        redRoundScores: [0, 0, 0],
        blueRoundScores: [0, 0, 0],
        roundWinners: [],
        timeLeft: 60 * 1000,
        configuredRoundDuration: 60 * 1000,
        breakTimeLeft: 30 * 1000,
        timerRunning: false,
        timerInterval: null,
        breakTimerRunning: false,
        breakTimerInterval: null,
        roundStarted: false,
        isBreakTime: false,
        maxRounds: 3,
        maxFouls: 5,
        maxHealth: 120,
        actionHistory: [],
        configPopupOpen: false, // New flag to track if config popup is open
    },

    getState(key) {
        return this.state[key];
    },

    setState(key, value) {
        this.state[key] = value;
        // Trigger updateButtonStates to reflect state changes
        if (typeof window.updateButtonStates === 'function') {
            window.updateButtonStates();
        }
    },

    incrementScore(player, points) {
        if (player === 'red') {
            this.state.redScore += points;
            // Add technique points for 4 or 5 point hits
            if (points >= 20) {
                this.state.redTechnique += points;
            }
            // Add head hits for 3 point hits
            if (points === 15) {
                this.state.redHeadHits++;
            }
            if (this.state.redScore > this.state.maxHealth) {
                this.state.redScore = this.state.maxHealth;
            }
        } else if (player === 'blue') {
            this.state.blueScore += points;
            // Add technique points for 4 or 5 point hits
            if (points >= 20) {
                this.state.blueTechnique += points;
            }
            // Add head hits for 3 point hits
            if (points === 15) {
                this.state.blueHeadHits++;
            }
            if (this.state.blueScore > this.state.maxHealth) {
                this.state.blueScore = this.state.maxHealth;
            }
        }
        document.getElementById(`${player}DmgScore`).textContent = this.state[player === 'red' ? 'redScore' : 'blueScore'];
    },

    incrementHits(player, hits) {
        if (player === 'red') {
            this.state.redHits += hits;
        } else if (player === 'blue') {
            this.state.blueHits += hits;
        }
    },

    incrementFouls(player, fouls) {
        if (player === 'red') {
            if (fouls > 0) {
                this.state.redFouls += fouls;
            } else if (fouls < 0 && this.state.redFouls > 0) {
                this.state.redFouls += fouls;
            }
            this.state.redMana = Math.max(0, this.state.redMana - fouls);
        } else if (player === 'blue') {
            if (fouls > 0) {
                this.state.blueFouls += fouls;
            } else if (fouls < 0 && this.state.blueFouls > 0) {
                this.state.blueFouls += fouls;
            }
            this.state.blueMana = Math.max(0, this.state.blueMana - fouls);
        }
    },

    incrementWins(player) {
        if (player === 'red') {
            this.setState('redWon', this.getState('redWon') + 1);
        } else if (player === 'blue') {
            this.setState('blueWon', this.getState('blueWon') + 1);
        }
    },

    // Add an action to history
    pushAction(action) {
        if (this.state.actionHistory.length >= 10) {
            this.state.actionHistory.shift();
        }
        this.state.actionHistory.push(action);
    },

    // Pop the last action for undo
    popAction() {
        return this.state.actionHistory.pop();
    },

    // Clear history (e.g., on match reset)
    clearHistory() {
        this.state.actionHistory = [];
    }
};

preloadHitIcons();

// Function to format time in MM:SS
function formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', () => {
    const configuredRoundDuration = gameState.getState('configuredRoundDuration');
    document.getElementById('timer').textContent = formatTime(configuredRoundDuration);
    document.getElementById('redDmgScore').textContent = gameState.getState('redScore');
    document.getElementById('blueDmgScore').textContent = gameState.getState('blueScore');
    document.getElementById('red-hits').textContent = gameState.getState('redHits');
    document.getElementById('blue-hits').textContent = gameState.getState('blueHits');
    document.getElementById('red-won').textContent = gameState.getState('redWon');
    document.getElementById('blue-won').textContent = gameState.getState('blueWon');
    document.getElementById('red-penalty').textContent = gameState.getState('redFouls');
    document.getElementById('blue-penalty').textContent = gameState.getState('blueFouls');
    document.getElementById('round').textContent = gameState.getState('currentRound');

    // Initialize health bars
    document.getElementById('redHP').style.width = '100%';
    document.getElementById('blueHP').style.width = '100%';
    document.getElementById('redDelayedHP').style.width = '100%';
    document.getElementById('blueDelayedHP').style.width = '100%';

    // Initialize timer display based on configured round duration
    const timeLeft = gameState.getState('timeLeft');
    document.getElementById('timer').textContent = formatTime(timeLeft);

    for (let i = 1; i <= 5; i++) {
        document.getElementById(`redMP${i}`).style.display = 'block';
        document.getElementById(`blueMP${i}`).style.display = 'block';
    }

    // Call updateButtonStates to set initial button states
    if (typeof window.updateButtonStates === 'function') {
        window.updateButtonStates();
    }
});

document.querySelector('.menuButton').addEventListener('click', () => {
    // Set the config popup flag to true
    gameState.setState('configPopupOpen', true);

    // Show configuration popup instead of opening a new window
    document.getElementById('configPopup').style.display = 'flex';
});

function preloadHitIcons() {
    // All possible hit icons for both players
    const iconPaths = [
        './src/assets/redHeadCrit.webp',
        './src/assets/redTrunkCrit.webp',
        './src/assets/redHead.webp',
        './src/assets/redTrunk.webp',
        './src/assets/redPunch.webp',
        './src/assets/blueHeadCrit.webp',
        './src/assets/blueTrunkCrit.webp',
        './src/assets/blueHead.webp',
        './src/assets/blueTrunk.webp',
        './src/assets/bluePunch.webp'
    ];

    // Create image objects and preload
    const preloadedImages = [];
    iconPaths.forEach(path => {
        const img = new Image();
        img.src = path;
        preloadedImages.push(img);
    });

    // Store the preloaded images in gameState for reference if needed
    gameState.setState('preloadedHitIcons', preloadedImages);

    console.log('Hit icons preloaded:', iconPaths.length);
}