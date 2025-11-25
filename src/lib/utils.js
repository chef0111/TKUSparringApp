const getState = gameState.getState.bind(gameState);
const setState = gameState.setState.bind(gameState);

function activeButtonEffect(button) {
    const DELAY_TIME = 1000;
    const keyList = ['q', 'w', 'e', 'a', 's', 'd', 'u', 'i', 'o', 'j', 'k', 'l'];
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
    const redHealth = getState('redHealth');
    const blueHealth = getState('blueHealth');
    const scoringButtons = document.querySelectorAll('.scoreButton');

    scoringButtons.forEach(button => {
        const shouldEnable = roundStarted && !isBreakTime && timeLeft > 0 && redHealth > 0 && blueHealth > 0;
        button.disabled = !shouldEnable;

        // Disable when KO
        if (redHealth <= 0 || blueHealth <= 0) {
            button.classList.add('ko');
        } else {
            button.classList.remove('ko');
        }
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

    // Click at the penalty box to add foul
    redPenaltyBox.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.button === 0 && getState('roundStarted') && !getState('isBreakTime') && getState('timeLeft') > 0) {
            addPenalty('red', 1);
        }
    });

    // Right click at the penalty box to subtract foul
    redPenaltyBox.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (getState('roundStarted') && !getState('isBreakTime') && getState('timeLeft') > 0) {
            const currentMana = getState('redMana');
            if (currentMana < 5) {
                const manaMeter = document.getElementById(`redMP${currentMana + 1}`);
                // Add mana appear effect
                manaMeter.classList.add('mana-appear');
                setTimeout(() => {
                    manaMeter.classList.remove('mana-appear');
                }, 800);
            }
            addPenalty('red', -1);
        }
    });

    // Click at the penalty box to add foul
    bluePenaltyBox.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.button === 0 && getState('roundStarted') && !getState('isBreakTime') && getState('timeLeft') > 0) {
            addPenalty('blue', 1);
        }
    });

    // Right at the penalty box to subtract foul
    bluePenaltyBox.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (getState('roundStarted') && !getState('isBreakTime') && getState('timeLeft') > 0) {
            const currentMana = getState('blueMana');
            if (currentMana < 5) {
                const manaMeter = document.getElementById(`blueMP${currentMana + 1}`);
                manaMeter.classList.add('mana-appear');
                setTimeout(() => {
                    manaMeter.classList.remove('mana-appear');
                }, 800);
            }
            addPenalty('blue', -1);
        }
    });

    updateButtonStates();

    const scoringButtons = document.querySelectorAll('.scoreButton');
    scoringButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            if (!button.disabled) {
                // Only trigger the active effect; let onclick handle subtractHealth
                const key = button.id.replace('button-', '');
                activeButtonEffect(key);
                console.log(`Button ${button.id} clicked, relying on onclick`);
            }
        }, { once: false }); // Ensure listener persists across clicks
    });

    const redAvatar = document.querySelector('.redAvatar');
    const blueAvatar = document.querySelector('.blueAvatar');

    // Double click at the avatar to quick select round winner
    redAvatar.addEventListener('dblclick', () => {
        const roundStarted = getState('roundStarted');
        const isBreakTime = getState('isBreakTime');
        const currentRound = getState('currentRound');
        const maxRounds = getState('maxRounds');
        const redWon = getState('redWon');
        const blueWon = getState('blueWon');
        const timeLeft = getState('timeLeft');

        if ((roundStarted || timeLeft <= 0) && !isBreakTime && currentRound <= maxRounds && redWon < 2 && blueWon < 2) {
            endRoundWithWinner('red');
            if (getState('redWon') === 2) {
                setTimeout(() => {
                    showMatchResultModal('red');
                }, 3000);
            }
        }
    });

    // Ctrl + click at the avatar to select winner by KO
    redAvatar.addEventListener('click', () => {
        const roundStarted = getState('roundStarted');
        const currentRound = getState('currentRound');
        const maxRounds = getState('maxRounds');
        const redWon = getState('redWon');
        const blueWon = getState('blueWon');
        const timeLeft = getState('timeLeft');

        if (event.ctrlKey) {
            if ((roundStarted || timeLeft <= 0) && currentRound <= maxRounds && redWon < 2 && blueWon < 2) {
                endRoundWithWinner('red');
                setTimeout(() => {
                    showMatchResultModal('red');
                }, 3000);
            }
        }
    });

    // Double click at the avatar to quick select round winner
    blueAvatar.addEventListener('dblclick', () => {
        const roundStarted = getState('roundStarted');
        const isBreakTime = getState('isBreakTime');
        const currentRound = getState('currentRound');
        const maxRounds = getState('maxRounds');
        const redWon = getState('redWon');
        const blueWon = getState('blueWon');
        const timeLeft = getState('timeLeft');

        if ((roundStarted || timeLeft <= 0) && !isBreakTime && currentRound <= maxRounds && redWon < 2 && blueWon < 2) {
            endRoundWithWinner('blue');
            if (getState('blueWon') === 2) {
                setTimeout(() => {
                    showMatchResultModal('blue');
                }, 3000);
            }
        }
    });

    // Ctrl + click at the avatar to select winner by KO
    blueAvatar.addEventListener('click', () => {
        const roundStarted = getState('roundStarted');
        const currentRound = getState('currentRound');
        const maxRounds = getState('maxRounds');
        const redWon = getState('redWon');
        const blueWon = getState('blueWon');
        const timeLeft = getState('timeLeft');

        if (event.ctrlKey) {
            if ((roundStarted || timeLeft <= 0) && currentRound <= maxRounds && redWon < 2 && blueWon < 2) {
                endRoundWithWinner('blue');
                setTimeout(() => {
                    showMatchResultModal('blue');
                }, 3000);
            }
        }
    });

    document.addEventListener('keydown', function (event) {
        // If config popup is open, don't process any keybinds
        if (getState('configPopupOpen')) {
            return;
        }

        const isBreakTime = getState('isBreakTime');
        const timeLeft = getState('timeLeft');
        const roundStarted = getState('roundStarted');
        const redHealth = getState('redHealth');
        const blueHealth = getState('blueHealth');

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
                // Set key binds for scoring scenarios
                switch (key) {
                    case 'k': event.preventDefault(); subtractHealth('blue', 1, event); break;
                    case 'l': event.preventDefault(); subtractHealth('blue', 2, event); break;
                    case 'j': event.preventDefault(); subtractHealth('blue', 3, event); break;
                    case 'o': event.preventDefault(); subtractHealth('blue', 4, event); break;
                    case 'u': event.preventDefault(); subtractHealth('blue', 5, event); break;
                    case 's': event.preventDefault(); subtractHealth('red', 1, event); break;
                    case 'a': event.preventDefault(); subtractHealth('red', 2, event); break;
                    case 'd': event.preventDefault(); subtractHealth('red', 3, event); break;
                    case 'q': event.preventDefault(); subtractHealth('red', 4, event); break;
                    case 'e': event.preventDefault(); subtractHealth('red', 5, event); break;
                    case 'w': event.preventDefault(); addPenalty('red', 1); break;
                    case 'i': event.preventDefault(); addPenalty('blue', 1); break;
                }
                activeButtonEffect(key); // Pass normalized key
            }

            if (event.ctrlKey) {
                const ctrlKey = event.key.toLowerCase();
                if (!isBreakTime) {
                    switch (ctrlKey) {
                        case 'b':
                            event.preventDefault();
                            if (!isBreakTime && roundStarted) {
                                resetRound();
                                document.getElementById('redHP').style.width = '100%';
                                document.getElementById('blueHP').style.width = '100%';
                                clearInterval(getState('timerInterval'));
                                clearInterval(getState('breakTimerInterval'));
                                resetTimer();
                                updateButtonStates();
                            }
                            break;
                        case 'f':
                            event.preventDefault();
                            let winner = declareWinner();
                            if (winner === 'tie') {
                                setState('timeLeft', 0);
                                clearInterval(getState('timerInterval'));
                                clearInterval(getState('breakTimerInterval'));
                                document.getElementById('timer').textContent = '0.00';
                            } else {
                                finishRound();
                            }
                            break;
                        case 'z':
                            event.preventDefault();
                            rollBack();
                            break;
                    }
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
                // First clear any existing timers
                clearInterval(getState('timerInterval'));
                clearInterval(getState('breakTimerInterval'));
                // Then reset the match
                resetMatch();
                // Update button states
                updateButtonStates();
            }
        }
    });

    const modal = document.getElementById('match-result-modal');
    const closeBtn = document.getElementById('modal-close');
    const cancelResultBtn = document.getElementById('cancelResult');

    // Function to close modal and reset state
    const closeModal = () => {
        modal.style.display = 'none';
        gameState.setState('configPopupOpen', false);
        toggleBreakTimer();
        nextMatch();
        updateButtonStates();
    };

    closeBtn.addEventListener('click', closeModal);

    // Add event listener for cancel result button
    if (cancelResultBtn) {
        cancelResultBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
});

function rollBack() {
    const lastAction = gameState.popAction();
    if (!lastAction) {
        console.log('No actions to roll back');
        return;
    }

    if (lastAction.type === 'hit') {
        const { player, healthKey, healthDeduction, points, previousHealth, previousScore, previousHits, iconPath } = lastAction;

        // Restore health
        gameState.setState(healthKey, previousHealth);
        const healthElement = document.getElementById(`${player === 'red' ? 'blue' : 'red'}HP`);
        const delayedHealthElement = document.getElementById(`${player === 'red' ? 'blue' : 'red'}DelayedHP`);
        const healthPercentage = (previousHealth / gameState.getState('maxHealth')) * 100;
        
        // Update health bars with a small delay for the delayed indicator
        healthElement.style.width = `${healthPercentage}%`;
        setTimeout(() => {
            delayedHealthElement.style.width = `${healthPercentage}%`;
        }, 100);

        // Restore score and update icon
        gameState.setState(player === 'red' ? 'redScore' : 'blueScore', previousScore);
        const dmgScoreElement = document.getElementById(`${player}DmgScore`);
        if (previousScore > 0) {
            dmgScoreElement.innerHTML = `<img src="${iconPath}" class="hitIcon" alt="hit">`;
        } else {
            dmgScoreElement.innerHTML = '';
        }

        // Restore hits
        gameState.setState(player === 'red' ? 'redHits' : 'blueHits', previousHits);
        document.getElementById(`${player}-hits`).textContent = previousHits;

        // Remove critical hit effects if applicable
        const opponentAvatarImage = document.querySelector(`.${player === 'red' ? 'blueAvatar' : 'redAvatar'}`);
        const opponentAvatarContainer = opponentAvatarImage.closest('.avatar');
        if (healthDeduction === 20 || healthDeduction === 25) {
            opponentAvatarContainer.classList.remove('criticalHitContainer');
            opponentAvatarImage.classList.remove('criticalHitImage');
        }
    } else if (lastAction.type === 'penalty') {
        const { player, points, previousMana, previousFouls } = lastAction;

        // Restore mana
        gameState.setState(`${player}Mana`, previousMana);
        for (let i = 1; i <= 5; i++) {
            const manaMeter = document.getElementById(`${player}MP${i}`);
            if (i <= previousMana) {
                manaMeter.style.opacity = '1';
                manaMeter.style.display = 'block';
                manaMeter.classList.remove('mana-disappear');
                
                if (i === previousMana) {
                    manaMeter.classList.add('mana-appear');
                    setTimeout(() => {
                        manaMeter.classList.remove('mana-appear');
                    }, 800);
                }
            } else {
                manaMeter.style.opacity = '0';
                manaMeter.classList.add('mana-disappear');
            }
        }

        // Restore fouls
        gameState.setState(`${player}Fouls`, previousFouls);
        document.getElementById(`${player}-penalty`).textContent = previousFouls;
    }
    updateButtonStates();
}

function finishRound() {
    const currentRound = getState('currentRound');
    let redRoundScores = getState('redRoundScores');
    let blueRoundScores = getState('blueRoundScores');
    let roundWinners = getState('roundWinners');

    const redScore = getState('redScore');
    const blueScore = getState('blueScore');
    const redHealth = getState('redHealth');
    const blueHealth = getState('blueHealth');

    redRoundScores[currentRound - 1] = redScore;
    blueRoundScores[currentRound - 1] = blueScore;
    setState('redRoundScores', redRoundScores);
    setState('blueRoundScores', blueRoundScores);

    document.getElementById(`redR${currentRound}`).textContent = redRoundScores[currentRound - 1];
    document.getElementById(`blueR${currentRound}`).textContent = blueRoundScores[currentRound - 1];
    
    // Determine the winner using the declareWinner function
    let winner = declareWinner();
    if (redHealth > 0 && redHealth < getState('maxHealth') && blueHealth <= 0) {
        winner = 'red';
    } else if (blueHealth > 0 && blueHealth < getState('maxHealth') && redHealth <= 0) {
        winner = 'blue';
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
    } else if (winner === 'blue' && !getState('isBreakTime')) {
        const blueWon = getState('blueWon');
        setState('blueWon', blueWon + 1);
        document.getElementById('blue-won').textContent = getState('blueWon');
        document.querySelector('.blueScoreBox .totalWins').textContent = getState('blueWon');
        document.getElementById(`blueWin${currentRound}`).style.visibility = 'visible';
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
    // Disable keybinds when modal is open
    gameState.setState('configPopupOpen', true);
    
    const modal = document.getElementById('match-result-modal');
    const blueScoreElement = document.getElementById('modal-blue-score');
    const redScoreElement = document.getElementById('modal-red-score');
    const winnerNameElement = document.getElementById('modal-winner-name');
    const winnerAvatarElement = document.getElementById('modal-winner-avatar');

    blueScoreElement.textContent = getState('blueWon');
    redScoreElement.textContent = getState('redWon');

    winnerNameElement.classList.remove('red-winner', 'blue-winner');

    // Get player names and avatars from the configured elements
    const redPlayerName = document.getElementById('redPlayer').textContent;
    const bluePlayerName = document.getElementById('bluePlayer').textContent;
    const redAvatarSrc = document.querySelector('.redAvatar').src || '/src/assets/CapybaraTKU1.webp';
    const blueAvatarSrc = document.querySelector('.blueAvatar').src || '/src/assets/CapybaraTKU2.webp';

    if (winner === 'red') {
        winnerNameElement.textContent = redPlayerName;
        winnerAvatarElement.src = redAvatarSrc; // Use configured Red avatar
        winnerNameElement.classList.add('red-winner');
    } else if (winner === 'blue') {
        winnerNameElement.textContent = bluePlayerName;
        winnerAvatarElement.src = blueAvatarSrc; // Use configured Blue avatar
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
    // Store the current match ID before resetting
    const currentMatchId = document.querySelector('.matchId').textContent;
    
    setState('redScore', 0);
    setState('blueScore', 0);
    setState('redTechnique', 0);
    setState('blueTechnique', 0);
    setState('redHeadHits', 0);
    setState('blueHeadHits', 0);
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

    // Use the configured round duration
    const configuredRoundDuration = getState('configuredRoundDuration') || 60 * 1000;
    setState('timeLeft', configuredRoundDuration);
    setState('breakTimeLeft', getState('breakTimeLeft') || 30 * 1000);
    setState('timerRunning', false);
    setState('timerInterval', null);
    setState('breakTimerRunning', false);
    setState('breakTimerInterval', null);
    setState('roundStarted', false);
    setState('isBreakTime', false);

    clearInterval(getState('timerInterval'));
    clearInterval(getState('breakTimerInterval'));

    document.getElementById('redDmgScore').innerHTML = '';
    document.getElementById('blueDmgScore').innerHTML = '';
    document.getElementById('red-hits').textContent = '0';
    document.getElementById('blue-hits').textContent = '0';
    document.getElementById('red-won').textContent = '0';
    document.getElementById('blue-won').textContent = '0';
    document.getElementById('red-penalty').textContent = '0';
    document.getElementById('blue-penalty').textContent = '0';
    document.getElementById('round').textContent = '1';

    // Update timer display with the configured duration
    document.getElementById('timer').textContent = formatTime(configuredRoundDuration);
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
    hideRecord();
    hideWinIndicator();
    updateButtonStates();
    
    // Restore the match ID if in advanced mode
    if (isAdvancedMode) {
        document.querySelector('.matchId').textContent = currentMatchId;
    }
}

