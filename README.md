# TKU Sparring System

A modern, user-friendly web application for managing Taekwondo sparring matches of UIT Taekwondo Tournament 2025.

## Installation Guide

### Option 1: Direct Access (Recommended)
Simply visit [https://chef0111.github.io/TKUSparringApp](https://chef0111.github.io/TKUSparringApp) in your web browser to start using the application immediately.

### Option 2: Local Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/chef0111/TKUSparringApp.git
   ```
2. Navigate to the project directory:
   ```bash
   cd TKUSparringApp
   ```
3. Open `index.html` in your preferred web browser

## Features

### Match Configuration
- Customizable player names and avatars
- Adjustable round duration (10-300 seconds)
- Configurable break time between rounds (10-120 seconds)
- Customizable maximum health points (50-200)
- Support for up to 3 rounds per match

### Scoring System
- 5-point scoring system:
  - 5 points: Critical head hit (25 health points)
  - 4 points: Critical trunk hit (20 health points)
  - 3 points: Head hit (15 health points)
  - 2 points: Trunk hit (10 health points)
  - 1 point: Punch (5 health points)
- Automatic health bar updates
- Visual feedback for critical hits
- Hit counter for each player

### Penalty System
- Gam-jeom (penalty) tracking
- Mana system (5 points)
- Penalty effects on health and mana
- Visual feedback for penalty points

### Timer Features
- Round timer with countdown
- Break time between rounds
- Visual indicators for time status
- Support for pausing/resuming matches

### Match Management
- Round-by-round score tracking
- Match winner determination
- Match result display
- Support for multiple matches

## Usage Instructions

### Starting a Match
1. Click the menu button (☰) to open the configuration panel
2. Configure player names, avatars, and match settings
3. Click "OK" to save settings and start a new match

### Match Controls
- **Space**: Start/Pause the match timer
- **Ctrl + M**: Reset the entire match
- **Ctrl + E**: Reset the current round
- **Ctrl + F**: Force end the current round
- **Ctrl + Z**: Undo the last action

### Scoring Controls
**Red Player (Left Side)**
- **E**: 5-point critical head hit
- **Q**: 4-point critical trunk hit
- **D**: 3-point head hit
- **S**: 1-point punch
- **A**: 2-point trunk hit
- **W**: Add penalty to red player

**Blue Player (Right Side)**
- **U**: 5-point critical head hit
- **O**: 4-point critical trunk hit
- **J**: 3-point head hit
- **K**: 1-point punch
- **L**: 2-point trunk hit
- **I**: Add penalty to blue player

### Penalty Controls
- Left-click on penalty box: Add penalty point
- Right-click on penalty box: Remove penalty point

### Quick Winner Selection
- Double-click on player avatar: Select round winner
- Ctrl + click on player avatar: Select winner by KO

## Requirements and Restrictions

### Scoring Restrictions
- Scoring buttons are disabled when:
  - Match is not started
  - Timer is paused
  - Break time is active
  - A player's health reaches 0
  - Match time has expired
  - Maximum rounds are completed

### Penalty System Rules
- Maximum 5 penalty points per player
- Penalty points reduce mana
- Match ends if a player's mana reaches 0
- Penalties can be removed if not at maximum mana

### Timer Rules
- Round timer must be started to enable scoring
- Break time cannot be skipped
- Timer can be paused during active rounds
- Match ends when time expires or health/mana depletes

### Winner Determination
Winner is determined in the following order:
1. Health depletion (KO)
2. Mana depletion (penalties)
3. Remaining health points
4. Fewer penalty points
5. Higher technique points
6. More head hits

### Additional notes
- User can still operate a match without configuration
- Timer must be started before using any feature
- User cannot reset the previous round's stat during break time

## Technical Requirements
- The system is web-base and only supports PC resolution.

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera 
