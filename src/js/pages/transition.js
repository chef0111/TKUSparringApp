// Check if CSS is loaded correctly
window.onload = function() {
    const cssLoaded = Array.from(document.styleSheets).some(sheet => 
        sheet.href && sheet.href.includes('transition.css'));
    
    if (!cssLoaded) {
        // Force background color as a backup
        document.body.style.background = 'radial-gradient(circle at center, #001428 0%, #000000 70%)';
        document.documentElement.style.background = 'radial-gradient(circle at center, #001428 0%, #000000 70%)';
    }
    
    // Check if user came from splash screen
    if (!sessionStorage.getItem('hasSeenSplash')) {
        if (window.SPA) {
            window.SPA.navigate('splash');
        }
        return;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Create background particles
    createBackgroundParticles();
    
    // Start progress animation
    animateProgress();
});

/**
 * Creates floating background particles for visual effect
 */
function createBackgroundParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'bg-particle';
        
        // Random size between 50px and 150px
        const size = Math.floor(Math.random() * 100) + 50;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        const left = Math.floor(Math.random() * 100);
        particle.style.left = `${left}%`;
        particle.style.bottom = `-${size}px`;
        
        // Random animation duration between 10s and 30s
        const duration = Math.floor(Math.random() * 20) + 10;
        particle.style.animationDuration = `${duration}s`;
        
        // Random delay so they don't all start at once
        const delay = Math.floor(Math.random() * 15);
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
    }
}

/**
 * Animates the progress bar and updates status messages
 */
function animateProgress() {
    const progressBar = document.getElementById('transitionProgressBar');
    const progressContainer = document.querySelector('.transition-progress-container');
    const loadingStatus = document.getElementById('loadingStatus');
    let progress = 0;
    
    // Loading status messages that will display as the progress increases
    const loadingMessages = [
        { threshold: 5, message: "Initializing system components..." },
        { threshold: 15, message: "Loading scoring modules..." },
        { threshold: 30, message: "Connecting to tournament database..." },
        { threshold: 45, message: "Loading fighter profiles..." },
        { threshold: 60, message: "Validating tournament rules..." },
        { threshold: 75, message: "Preparing judge interface..." },
        { threshold: 95, message: "Finalizing system setup..." },
        { threshold: 100, message: "System ready!" }
    ];
    
    // Start with small increments, then accelerate
    const interval = setInterval(() => {
        // Adjust the rate of progress to create a more natural loading feel
        if (progress < 35) {
            progress += Math.random() * 5;
        } else if (progress < 65) {
            progress += Math.random() * 10;
        } else if (progress < 90) {
            progress += Math.random() * 3;
        } else {
            progress += Math.random() * 1;
        }
        
        if (progress > 100) {
            progress = 100;
            clearInterval(interval);
            
            // Update system info text when complete
            const systemInfo = document.querySelector('.transition-system-info');
            if (systemInfo) {
                systemInfo.textContent = "Launch sequence complete";
                systemInfo.style.color = "rgba(0, 230, 118, 1)";
                systemInfo.style.textShadow = "0 0 10px rgba(0, 230, 118, 0.7)";
            }
            
            // Set flag in sessionStorage indicating transition screen was viewed
            sessionStorage.setItem('hasSeenTransition', 'true');
            
            // Navigate to index.html after progress reaches 100%
            setTimeout(() => {
                if (window.SPA) {
                    window.SPA.navigate('app');
                } else {
                    window.location.href = '../index.html';
                }
            }, 1500);
        }
        
        // Update progress bar width
        progressBar.style.width = `${progress}%`;
        
        // Update percentage text
        const displayProgress = Math.floor(progress);
        progressContainer.setAttribute('data-progress', displayProgress);
        
        // Update loading status message based on current progress
        for (let i = loadingMessages.length - 1; i >= 0; i--) {
            if (displayProgress >= loadingMessages[i].threshold) {
                // If this is a new message, animate it
                if (loadingStatus.textContent !== loadingMessages[i].message) {
                    loadingStatus.style.animation = 'none';
                    // Trigger reflow
                    void loadingStatus.offsetWidth;
                    loadingStatus.textContent = loadingMessages[i].message;
                    loadingStatus.style.animation = 'statusFadeIn 0.3s forwards';
                }
                break;
            }
        }
        
        // Add completion info when progress is at 100%
        if (progress === 100) {
            progressBar.style.background = 'linear-gradient(90deg, #00c853, #00e676, #69f0ae)';
        }
    }, 150);
}
