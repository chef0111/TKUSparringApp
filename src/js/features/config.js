const apiUrl = 'https://taekwondo-tournament.vercel.app/api/v1';
const clientUrl = window.location.origin + '/';
let currentMatches = [];
let currentMatch = null;
function updateAvatarName(player, input) {
    if (input.files && input.files[0]) {
        const fileName = input.files[0].name.split('.').slice(0, -1).join('.');
        const playerNameInput = document.getElementById(`${player}PlayerName`);
        playerNameInput.value = fileName;
        validateConfig();
    }
}

function validateConfig() {
    const activeTab = document.querySelector('.config-tab.active').getAttribute('data-tab');
    const okButton = document.getElementById('okConfig');

    // Default values for standard tab
    const defaultValues = {
        avatar1: 'No file chosen',
        avatar2: 'No file chosen',
        player1Name: '',
        player2Name: '',
        roundDuration: '60',
        breakDuration: '30',
        maxHealth: '120'
    };
    
    if (activeTab === 'standard') {
        // Check which fields have changed from default
        const changes = {
            avatar1: document.getElementById('avatar1-name').textContent !== defaultValues.avatar1,
            avatar2: document.getElementById('avatar2-name').textContent !== defaultValues.avatar2,
            player1Name: document.getElementById('player1Name').value.trim() !== defaultValues.player1Name,
            player2Name: document.getElementById('player2Name').value.trim() !== defaultValues.player2Name,
            roundDuration: document.getElementById('roundDuration').value !== defaultValues.roundDuration,
            breakDuration: document.getElementById('breakDuration').value !== defaultValues.breakDuration,
            maxHealth: document.getElementById('maxHealth').value !== defaultValues.maxHealth
        };
        
        // Enable OK button if at least one change has been made
        const changesCount = Object.values(changes).filter(changed => changed).length;
        const isStandardValid = changesCount >= 1;
        okButton.disabled = !isStandardValid;
    } else {
        // Validate advanced tab inputs - only group and match are required
        const groupSelect = document.getElementById('groupSelect');
        const matchSelect = document.getElementById('matchSelect');
        
        // Check if both group and match are selected
        const isAdvancedValid = groupSelect.value !== '' && matchSelect.value !== '';
        console.log('Advanced Validation:', {
            groupValue: groupSelect.value,
            matchValue: matchSelect.value,
            isValid: isAdvancedValid
        });
        
        okButton.disabled = !isAdvancedValid;
    }
}

function saveConfig() {
    const activeTab = document.querySelector('.config-tab.active').getAttribute('data-tab');
    
    if (activeTab === 'standard') {
        // Save standard tab data
        const avatar1Input = document.getElementById('avatar1');
        const avatar2Input = document.getElementById('avatar2');
        
        // Get values from standard tab
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
        
        // Check if we have files in the input, otherwise use the current avatar sources
        if (avatar1Input.files.length > 0) {
            redAvatar.src = URL.createObjectURL(avatar1Input.files[0]);
        } else {
            // If no file is selected but there's a name displayed, use the current preview
            const preview1 = document.getElementById('avatar1-preview');
            if (preview1 && preview1.src) {
                redAvatar.src = preview1.src;
            }
        }
        
        if (avatar2Input.files.length > 0) {
            blueAvatar.src = URL.createObjectURL(avatar2Input.files[0]);
        } else {
            // If no file is selected but there's a name displayed, use the current preview
            const preview2 = document.getElementById('avatar2-preview');
            if (preview2 && preview2.src) {
                blueAvatar.src = preview2.src;
            }
        }
        
        document.getElementById('redPlayer').textContent = document.getElementById('player1Name').value;
        document.getElementById('bluePlayer').textContent = document.getElementById('player2Name').value;
    } else {
        // Save advanced tab data
        // Get values from advanced tab
        const roundDuration = parseInt(document.getElementById('advancedRoundDuration').value) * 1000;
        const breakDuration = parseInt(document.getElementById('advancedBreakDuration').value) * 1000;
        const maxHealth = parseInt(document.getElementById('advancedMaxHealth').value);
        
        // Update game state with configured values
        gameState.setState('configuredRoundDuration', roundDuration);
        gameState.setState('timeLeft', roundDuration); // Set initial countdown
        gameState.setState('breakTimeLeft', breakDuration);
        gameState.setState('maxHealth', maxHealth);
        gameState.setState('redHealth', maxHealth);
        gameState.setState('blueHealth', maxHealth);
        
        // Update timer display
        document.getElementById('timer').textContent = formatTime(roundDuration);
        
        // Update player names and avatars from advanced tab
        document.getElementById('redPlayer').textContent = document.getElementById('advanced-red-name').value;
        document.getElementById('bluePlayer').textContent = document.getElementById('advanced-blue-name').value;
        
        const redAvatar = document.querySelector('.redAvatar');
        const blueAvatar = document.querySelector('.blueAvatar');
        
        // Update avatars from advanced tab
        const advancedRedAvatar = document.getElementById('advanced-red-avatar');
        const advancedBlueAvatar = document.getElementById('advanced-blue-avatar');
        
        if (advancedRedAvatar && advancedRedAvatar.src) {
            redAvatar.src = advancedRedAvatar.src;
        }
        
        if (advancedBlueAvatar && advancedBlueAvatar.src) {
            blueAvatar.src = advancedBlueAvatar.src;
        }
        
        // Update match ID from the selected match in advanced tab
        const matchSelect = document.getElementById('matchSelect');
        if (matchSelect && matchSelect.value) {
            // Get the selected option text which contains the match number
            const selectedOption = matchSelect.options[matchSelect.selectedIndex];
            const matchText = selectedOption.textContent;
            
            // Extract match number from the dropdown
            const matchNumberMatch = matchText.match(/Match (\d+):/);
            if (matchNumberMatch && matchNumberMatch[1]) {
                const matchNumber = matchNumberMatch[1];
                // Update the match ID display with the fetched match number
                const matchIdDisplay = document.querySelector('.matchId');
                if (matchIdDisplay) {
                    matchIdDisplay.textContent = matchNumber.padStart(3, '0');
                }
            }
        }
    }
    
    // Reset health bars
    document.getElementById('redHP').style.width = '100%';
    document.getElementById('blueHP').style.width = '100%';
    document.getElementById('redDelayedHP').style.width = '100%';
    document.getElementById('blueDelayedHP').style.width = '100%';
    
    // Reset match if needed
    if (typeof resetMatch === 'function') {
        resetMatch();
    }
    
    // Close the config popup
    document.getElementById('configPopup').style.display = 'none';
    
    // Update button states if needed
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

// Store the current configuration state
function storeCurrentConfig() {
    const avatar1Input = document.getElementById('avatar1');
    const avatar2Input = document.getElementById('avatar2');
    
    // Check if this is the first time accessing the config
    const isFirstTime = !avatar1Input.files.length && !avatar2Input.files.length;
    
    return {
        avatar1: avatar1Input.files[0] || null,
        avatar2: avatar2Input.files[0] || null,
        player1Name: document.getElementById('player1Name').value,
        player2Name: document.getElementById('player2Name').value,
        roundDuration: document.getElementById('roundDuration').value,
        breakDuration: document.getElementById('breakDuration').value,
        maxHealth: document.getElementById('maxHealth').value,
        isFirstTime: isFirstTime
    };
}

// Restore configuration state
function restoreConfig(savedConfig) {
    if (!savedConfig) return;
    
    // Restore player names
    document.getElementById('player1Name').value = savedConfig.player1Name;
    document.getElementById('player2Name').value = savedConfig.player2Name;
    
    // Restore durations and health
    document.getElementById('roundDuration').value = savedConfig.roundDuration;
    document.getElementById('breakDuration').value = savedConfig.breakDuration;
    document.getElementById('maxHealth').value = savedConfig.maxHealth;
    
    // Restore avatar inputs and previews
    const avatar1Input = document.getElementById('avatar1');
    const avatar2Input = document.getElementById('avatar2');
    
    // Create new FileList-like objects for the avatars
    if (savedConfig.avatar1) {
        const dataTransfer1 = new DataTransfer();
        dataTransfer1.items.add(savedConfig.avatar1);
        avatar1Input.files = dataTransfer1.files;
        
        const preview1 = document.getElementById('avatar1-preview');
        if (preview1) preview1.src = URL.createObjectURL(savedConfig.avatar1);
        document.getElementById('avatar1-name').textContent = savedConfig.avatar1.name;
    } else {
        avatar1Input.value = '';
        const preview1 = document.getElementById('avatar1-preview');
        if (preview1) {
            if (savedConfig.isFirstTime) {
                preview1.src = '/src/assets/CapybaraTKU1.webp';
            } else {
                preview1.src = '';
            }
        }
        document.getElementById('avatar1-name').textContent = 'No file chosen';
    }
    
    if (savedConfig.avatar2) {
        const dataTransfer2 = new DataTransfer();
        dataTransfer2.items.add(savedConfig.avatar2);
        avatar2Input.files = dataTransfer2.files;
        
        const preview2 = document.getElementById('avatar2-preview');
        if (preview2) preview2.src = URL.createObjectURL(savedConfig.avatar2);
        document.getElementById('avatar2-name').textContent = savedConfig.avatar2.name;
    } else {
        avatar2Input.value = '';
        const preview2 = document.getElementById('avatar2-preview');
        if (preview2) {
            if (savedConfig.isFirstTime) {
                preview2.src = '/src/assets/CapybaraTKU2.webp';
            } else {
                preview2.src = '';
            }
        }
        document.getElementById('avatar2-name').textContent = 'No file chosen';
    }
    
    validateConfig();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    let savedConfig = null;

    // Add input change listeners for standard form fields
    document.getElementById('roundDuration').addEventListener('input', validateConfig);
    document.getElementById('breakDuration').addEventListener('input', validateConfig);
    document.getElementById('maxHealth').addEventListener('input', validateConfig);
    document.getElementById('player1Name').addEventListener('input', validateConfig);
    document.getElementById('player2Name').addEventListener('input', validateConfig);

    document.getElementById('avatar1').addEventListener('change', function(e) {
        // Only update the file name if a file was actually selected
        if (e.target.files[0]) {
            const fileName = e.target.files[0].name;
            document.getElementById('avatar1-name').textContent = fileName;

            // Preview images if a file is selected
            const preview = document.getElementById('avatar1-preview');
            preview.src = URL.createObjectURL(e.target.files[0]);

            // Always set the player name from the file name when a file is selected
            const playerNameInput = document.getElementById('player1Name');
            const nameFromFile = e.target.files[0].name.split('.').slice(0, -1).join('.');
            playerNameInput.value = nameFromFile;
        }
        // If no file was selected (user clicked Cancel), don't change the file name display

        validateConfig();
    });

    document.getElementById('avatar2').addEventListener('change', function(e) {
        // Only update the file name if a file was actually selected
        if (e.target.files[0]) {
            const fileName = e.target.files[0].name;
            document.getElementById('avatar2-name').textContent = fileName;

            // Preview images if a file is selected
            const preview = document.getElementById('avatar2-preview');
            preview.src = URL.createObjectURL(e.target.files[0]);

            // Always set the player name from the file name when a file is selected
            const playerNameInput = document.getElementById('player2Name');
            const nameFromFile = e.target.files[0].name.split('.').slice(0, -1).join('.');
            playerNameInput.value = nameFromFile;
        }
        // If no file was selected (user clicked Cancel), don't change the file name display

        validateConfig();
    });

    // Function to handle closing the config popup
    const closeConfigPopup = () => {
        restoreConfig(savedConfig);
        document.getElementById('configPopup').style.display = 'none';
        gameState.setState('configPopupOpen', false);
    };

    // Add event listener for the cancel button
    document.getElementById('cancelConfig').addEventListener('click', closeConfigPopup);

    // Add event listener for the close button
    document.getElementById('closeConfig').addEventListener('click', closeConfigPopup);

    // Add keyboard event listener for Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && gameState.getState('configPopupOpen')) {
            closeConfigPopup();
        }
    });

    document.getElementById('okConfig').addEventListener('click', () => {
        saveConfig();
        savedConfig = null; // Clear saved config after successful save
        gameState.setState('configPopupOpen', false);
    });

    // Store config when opening the popup
    document.querySelector('.menuButton').addEventListener('click', () => {
        savedConfig = storeCurrentConfig();
        gameState.setState('configPopupOpen', true);
        const configPopup = document.getElementById('configPopup');
        configPopup.style.display = 'flex';
        
        // Ensure the config content is scrolled to the top
        const configSectionsContainer = document.querySelector('.config-sections-container');
        if (configSectionsContainer) {
            configSectionsContainer.scrollTop = 0;
        }
    });

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

// Sidebar and Tab Functionality
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.config-tab');
  const tabPanes = document.querySelectorAll('.config-tab-pane');
  const groupSelect = document.getElementById('groupSelect');
  const matchSelect = document.getElementById('matchSelect');
  const advancedRedName = document.getElementById('advanced-red-name');
  const advancedBlueName = document.getElementById('advanced-blue-name');
  const advancedRedAvatar = document.getElementById('advanced-red-avatar');
  const advancedBlueAvatar = document.getElementById('advanced-blue-avatar');

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Update active content
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `${targetTab}-tab`) {
          pane.classList.add('active');
        }
      });

      // Trigger validation when switching tabs
      validateConfig();
    });
  });
  
  // API Integration
  async function fetchGroups() {
    const url = `${apiUrl}/tournament-groups?index=0&limit=100`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.isSuccess && data.data && data.data.items) {
        // Clear existing options except the first one
        while (groupSelect.options.length > 1) {
          groupSelect.remove(1);
        }
        
        // Add new options from the API response
        data.data.items.forEach(group => {
          const option = document.createElement('option');
          option.value = group.id;
          option.textContent = `${group.gender} - ${group.weightClass}`;
          groupSelect.appendChild(option);
        });
      } else {
        console.error('Invalid API response format:', data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }

  async function fetchMatches(groupId) {
    const url = `${apiUrl}/matches/tournament/${groupId}`;
    try {
      const response = await fetch(url);
      const matches = await response.json();
      console.log(matches);

      matchSelect.innerHTML = '<option value="" disabled selected>Select a match</option>';
      
      matchSelect.disabled = false;
      
      // Filter out finished matches and sort by matchNo
      currentMatches = matches.data
        .filter(match => !match.isFinished)
        .sort((a, b) => a.matchNo - b.matchNo);

      currentMatches.forEach(match => {
        if (match.redPlayer && match.bluePlayer) {
          const option = document.createElement('option');
          option.value = match.id;
          option.textContent = `Match ${match.matchNo}: ${match.redPlayer.name} vs ${match.bluePlayer.name}`;
          matchSelect.appendChild(option);
        }
      });
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  }

  async function fetchMatchDetails(matchId) {
    try {
        const match = currentMatches.find(match => match.id === matchId);
        currentMatch = match;
        // Update player information
        advancedRedName.value = match.redPlayer.name;
        advancedBlueName.value = match.bluePlayer.name;
        
        // Update player avatars if available
        if (match.redPlayer.avatarUrl) {
            advancedRedAvatar.src = match.redPlayer.avatarUrl;
        }
        if (match.bluePlayer.avatarUrl) {
            advancedBlueAvatar.src = match.bluePlayer.avatarUrl;
        }

        // Sync match ID with timer display
        if (match.matchNo) {
            const matchIdDisplay = document.querySelector('.matchId');
            if (matchIdDisplay) {
                matchIdDisplay.textContent = match.matchNo.toString().padStart(3, '0');
            }
        }
    } catch (error) {
        console.error(error.message);
    }
  }

  // Event Listeners
  groupSelect.addEventListener('change', function() {
    const selectedGroupId = this.value;
    if (selectedGroupId) {
      fetchMatches(selectedGroupId);
    } else {
      matchSelect.disabled = true;
      matchSelect.innerHTML = '<option value="" disabled selected>Select a match</option>';
    }
  });

  matchSelect.addEventListener('change', function() {
    const selectedMatchId = this.value;
    if (selectedMatchId) {
      fetchMatchDetails(selectedMatchId);
    }
  });

  // Initialize groups on load
  fetchGroups();
});

// Custom dropdown functionality
function initializeCustomDropdowns() {
  const groupSelect = document.getElementById('groupSelect');
  const matchSelect = document.getElementById('matchSelect');
  const groupDropdownList = document.getElementById('groupDropdownList');
  const matchDropdownList = document.getElementById('matchDropdownList');

  // Function to create dropdown items
  function createDropdownItems(select, dropdownList, items) {
    dropdownList.innerHTML = '';
    items.forEach((item, index) => {
      const dropdownItem = document.createElement('div');
      dropdownItem.className = 'dropdown-item';
      dropdownItem.textContent = item.name || item;
      dropdownItem.dataset.value = item.id || item;
      dropdownItem.style.setProperty('--item-index', index);
      
      dropdownItem.addEventListener('click', () => {
        select.value = item.id || item;
        select.dispatchEvent(new Event('change'));
        dropdownList.style.opacity = '0';
        dropdownList.style.visibility = 'hidden';
      });
      
      dropdownList.appendChild(dropdownItem);
    });
  }

  // Group dropdown
  groupSelect.addEventListener('focus', () => {
    const options = Array.from(groupSelect.options).slice(1); // Skip the placeholder
    createDropdownItems(groupSelect, groupDropdownList, options);
  });

  // Match dropdown
  matchSelect.addEventListener('focus', () => {
    const options = Array.from(matchSelect.options).slice(1); // Skip the placeholder
    createDropdownItems(matchSelect, matchDropdownList, options);
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
      groupDropdownList.style.opacity = '0';
      groupDropdownList.style.visibility = 'hidden';
      matchDropdownList.style.opacity = '0';
      matchDropdownList.style.visibility = 'hidden';
    }
  });
}

// Initialize custom dropdowns when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeCustomDropdowns();
});

// Add this to your existing code
let isAdvancedMode = false;

// Update the tab switching code to track advanced mode
document.querySelectorAll('.config-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        isAdvancedMode = this.getAttribute('data-tab') === 'advanced';
    });
});

// Function to show/hide result buttons based on mode
function updateResultButtonsVisibility() {
    const resultButtons = document.getElementById('modal-result-buttons');
    if (resultButtons) {
        resultButtons.style.display = isAdvancedMode ? 'flex' : 'none';
    }
}

// Update the match result modal code
function showMatchResult(winner, redScore, blueScore) {
    const modal = document.getElementById('match-result-modal');
    const modalWinnerName = document.getElementById('modal-winner-name');
    const modalWinnerAvatar = document.getElementById('modal-winner-avatar');
    const modalRedScore = document.getElementById('modal-red-score');
    const modalBlueScore = document.getElementById('modal-blue-score');
    const resultButtons = document.getElementById('modal-result-buttons');

    // Update modal content
    modalWinnerName.textContent = winner;
    modalRedScore.textContent = redScore;
    modalBlueScore.textContent = blueScore;

    // Set winner avatar
    if (winner === document.getElementById('redPlayer').textContent) {
        modalWinnerAvatar.src = document.querySelector('.redAvatar').src;
    } else {
        modalWinnerAvatar.src = document.querySelector('.blueAvatar').src;
    }

    // Show modal and buttons
    modal.style.display = 'block';
    if (resultButtons) {
        resultButtons.style.display = 'flex';
    }

    // Add click event to close button
    const closeBtn = document.getElementById('modal-close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

// Add validation check when group or match selection changes
document.addEventListener('DOMContentLoaded', () => {
    const groupSelect = document.getElementById('groupSelect');
    const matchSelect = document.getElementById('matchSelect');
    
    groupSelect.addEventListener('change', validateConfig);
    matchSelect.addEventListener('change', validateConfig);
});

document.getElementById('cancelResult').addEventListener('click', () => {
    const modal = document.getElementById('match-result-modal');
    modal.style.display = 'none';
    currentMatch = null;
});

document.getElementById('acceptResult').addEventListener('click', () => {
    console.log(currentMatch.id);
    console.log(gameState.getState('redWon'));
    console.log(gameState.getState('blueWon'));
});

// Function to send match result to API
async function sendMatchResult(matchId, redWon, blueWon) {
    const url = `${apiUrl}/matches/win/${matchId}`;
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                redRoundWins: redWon,
                blueRoundWins: blueWon,
            })
        });
        const data = await response.json();
        if (!data.isSuccess) {
            console.error('Failed to send match result:', data);
        }
        return data.isSuccess;
    } catch (error) {
        console.error('Error sending match result:', error);
        return false;
    }
}

// Add event listener for accept result button
document.addEventListener('DOMContentLoaded', () => {
    const acceptResultBtn = document.getElementById('acceptResult');
    if (acceptResultBtn) {
        acceptResultBtn.addEventListener('click', async () => {
            if (isAdvancedMode) {
                const redWon = gameState.getState('redWon');
                const blueWon = gameState.getState('blueWon');
                
                const success = await sendMatchResult(currentMatch.id, redWon, blueWon);
                currentMatch = null;
                if (success) {
                    // Close modal and proceed to next match
                    const modal = document.getElementById('match-result-modal');
                    modal.style.display = 'none';
                    gameState.setState('configPopupOpen', false);
                    window.location.href = clientUrl;
                    updateButtonStates();
                }
            }
        });
    }
});