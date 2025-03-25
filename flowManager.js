/**
 * Flow Manager for TKU Sparring System
 * Manages the application flow between splash, transition, and main pages
 */

// Check if this is a new session by looking for a sessionStorage flag
function isNewSession() {
    return !sessionStorage.getItem('hasSeenSplash');
}

// Check if user is coming from transition page
function isFromTransition() {
    return sessionStorage.getItem('hasSeenTransition') === 'true';
}

// Check if user has completed the proper flow in current session
function hasCompletedFlow() {
    return sessionStorage.getItem('hasCompletedFlow') === 'true';
}

// Get the current page name
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    return page || 'index.html'; // Default to index.html if no page specified
}

// Main flow check function
function checkEntryFlow() {
    const currentPage = getCurrentPage();

    // If we're on splash.html or transition.html, don't interfere
    if (currentPage === 'splash.html' || currentPage === 'transition.html') {
        return;
    }

    // If we're on index.html or root and have completed the flow, allow access
    if (hasCompletedFlow()) {
        return;
    }

    // If it's a new session, redirect to splash
    if (isNewSession()) {
        sessionStorage.setItem('hasSeenSplash', 'true');
        window.location.replace('splash.html');
        return;
    }

    // If user hasn't seen transition page but has seen splash
    if (!isFromTransition()) {
        window.location.replace('transition.html');
        return;
    }

    // If we get here and we're on index.html, mark flow as completed
    if (currentPage === 'index.html' || currentPage === '') {
        sessionStorage.setItem('hasCompletedFlow', 'true');
        sessionStorage.removeItem('hasSeenTransition');
    }
}

// Function to reset the flow (mainly for testing)
function resetAppFlow() {
    sessionStorage.clear();
    window.location.reload();
}

// Function to bypass flow (for development)
function bypassFlow() {
    sessionStorage.setItem('hasSeenSplash', 'true');
    sessionStorage.setItem('hasSeenTransition', 'true');
    sessionStorage.setItem('hasCompletedFlow', 'true');
    window.location.reload();
}

// Execute flow check immediately when script loads
checkEntryFlow(); 