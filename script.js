// script.js
const gameState = {
    state: {
        redScore: 0,
        blueScore: 0,
        redHits: 0,
        blueHits: 0,
        redWon: 0,
        blueWon: 0,
        redFouls: 0,
        blueFouls: 0,
        redHealth: 100,
        blueHealth: 100,
        redMana: 5,
        blueMana: 5,
        currentRound: 1,
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
        maxHealth: 100,
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
            if (this.state.redScore > this.state.maxHealth) {
                this.state.redScore = this.state.maxHealth;
            }
        } else if (player === 'blue') {
            this.state.blueScore += points;
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

function updateAvatarName(player, input) {
    if (input.files && input.files[0]) {
        const fileName = input.files[0].name.split('.').slice(0, -1).join('.');
        const playerNameInput = document.getElementById(`${player}PlayerName`);
        playerNameInput.value = fileName;
        validateConfig();
    }
}

function validateConfig() {
    const avatar1Input = document.getElementById('avatar1').files.length > 0;
    const avatar2Input = document.getElementById('avatar2').files.length > 0;
    const roundDuration = document.getElementById('roundDuration').value;
    const breakDuration = document.getElementById('breakDuration').value;
    const maxHealth = document.getElementById('maxHealth').value;
    const okButton = document.getElementById('okConfig');

    okButton.disabled = !(avatar1Input && avatar2Input && roundDuration && breakDuration && maxHealth);
}

function saveConfig() {
    const avatar1Input = document.getElementById('avatar1');
    const avatar2Input = document.getElementById('avatar2');
    const roundDuration = parseInt(document.getElementById('roundDuration').value) * 1000;
    const breakDuration = parseInt(document.getElementById('breakDuration').value) * 1000;
    const maxHealth = parseInt(document.getElementById('maxHealth').value);

    // Update game state with configured values
    gameState.setState('configuredRoundDuration', roundDuration);
    gameState.setState('timeLeft', roundDuration); // Set initial countdown
    gameState.setState('breakTimeLeft', breakDuration);
    gameState.setState('maxHealth', maxHealth);
    gameState.setState('redHealth', maxHealth);
    gameState.setState('blueHealth', maxHealth);

    // Update timer display
    document.getElementById('timer').textContent = formatTime(roundDuration);

    const redAvatar = document.querySelector('.redAvatar');
    const blueAvatar = document.querySelector('.blueAvatar');
    redAvatar.src = URL.createObjectURL(avatar1Input.files[0]);
    blueAvatar.src = URL.createObjectURL(avatar2Input.files[0]);

    document.getElementById('redPlayer').textContent = document.getElementById('player1Name').value;
    document.getElementById('bluePlayer').textContent = document.getElementById('player2Name').value;

    document.getElementById('redHP').style.width = '100%';
    document.getElementById('blueHP').style.width = '100%';
    document.getElementById('redDelayedHP').style.width = '100%';
    document.getElementById('blueDelayedHP').style.width = '100%';

    toggleBreakTimer();
    resetMatch();

    document.getElementById('configPopup').style.display = 'none';
    if (typeof window.updateButtonStates === 'function') {
        window.updateButtonStates();
    }
    // Set the config popup flag to false after saving
    gameState.setState('configPopupOpen', false);
}

document.querySelector('.logoSection').addEventListener('click', () => {
    const configPopup = document.getElementById('configPopup');
    configPopup.style.display = 'flex';
    // Set the config popup flag to true
    gameState.setState('configPopupOpen', true);
    validateConfig();
});

document.getElementById('cancelConfig').addEventListener('click', () => {
    document.getElementById('configPopup').style.display = 'none';
    // Set the config popup flag to false
    gameState.setState('configPopupOpen', false);
});

document.getElementById('okConfig').addEventListener('click', () => {
    saveConfig();
    // Set the config popup flag to false after saving
    gameState.setState('configPopupOpen', false);
});

document.getElementById('avatar1').addEventListener('change', function(e) {
    const fileName = e.target.files[0] ? e.target.files[0].name : 'No file chosen';
    document.getElementById('avatar1-name').textContent = fileName;
    
    if (e.target.files[0]) {
        // Preview images if a file is selected
        const preview = document.getElementById('avatar1-preview');
        preview.src = URL.createObjectURL(e.target.files[0]);
        
        // Connect the player name input to the file name
        const playerNameInput = document.getElementById('player1Name');
        if (!playerNameInput.value.trim()) {
            const nameFromFile = e.target.files[0].name.split('.').slice(0, -1).join('.');
            playerNameInput.value = nameFromFile;
        }
    }
    
    validateConfig();
});

document.getElementById('avatar2').addEventListener('change', function(e) {
    const fileName = e.target.files[0] ? e.target.files[0].name : 'No file chosen';
    document.getElementById('avatar2-name').textContent = fileName;
    
    if (e.target.files[0]) {
        // Preview images if a file is selected
        const preview = document.getElementById('avatar2-preview');
        preview.src = URL.createObjectURL(e.target.files[0]);
        
        // Connect the player name input to the file name
        const playerNameInput = document.getElementById('player2Name');
        if (!playerNameInput.value.trim()) {
            const nameFromFile = e.target.files[0].name.split('.').slice(0, -1).join('.');
            playerNameInput.value = nameFromFile;
        }
    }
    
    validateConfig();
});

// Database file input handling
document.getElementById('databaseInput').addEventListener('change', function(e) {
    const fileName = e.target.files[0] ? e.target.files[0].name : 'No file chosen';
    document.getElementById('database-name').textContent = fileName;
});

