// configuration.js

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

    if (typeof toggleBreakTimer === 'function') {
        toggleBreakTimer();
    }

    if (typeof resetMatch === 'function') {
        resetMatch();
    }

    document.getElementById('configPopup').style.display = 'none';
    if (typeof window.updateButtonStates === 'function') {
        window.updateButtonStates();
    }
    // Set the config popup flag to false after saving
    gameState.setState('configPopupOpen', false);
}

// Format time utility function
function formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
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

    document.addEventListener('keydown', () => {
        if (event.key === "Escape") {
            document.getElementById('configPopup').style.display = 'none';
            gameState.setState('configPopupOpen', false);
        }
    })

    validateConfig();
});

document.addEventListener('DOMContentLoaded', () => {
    // Add custom spinner buttons to number inputs
    const numberInputs = document.querySelectorAll('input[type="number"]');

    numberInputs.forEach(input => {
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'spinner-container';

        // Insert wrapper before input
        input.parentNode.insertBefore(wrapper, input);

        // Move input into wrapper
        wrapper.appendChild(input);

        // Create spinner buttons container
        const spinnerButtons = document.createElement('div');
        spinnerButtons.className = 'spinner-buttons';

        // Create up button
        const spinnerUp = document.createElement('div');
        spinnerUp.className = 'spinner-up';
        spinnerUp.addEventListener('click', () => {
            input.stepUp();
            input.dispatchEvent(new Event('change'));
        });

        // Create down button
        const spinnerDown = document.createElement('div');
        spinnerDown.className = 'spinner-down';
        spinnerDown.addEventListener('click', () => {
            input.stepDown();
            input.dispatchEvent(new Event('change'));
        });

        // Add buttons to container
        spinnerButtons.appendChild(spinnerUp);
        spinnerButtons.appendChild(spinnerDown);

        // Add container to wrapper
        wrapper.appendChild(spinnerButtons);
    });
});