document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const slider = document.getElementById('slider');
    const skipButton = document.getElementById('skipButton');
    const enterButton = document.getElementById('enterButton');
    const navDots = document.querySelectorAll('.nav-dot');
    const loadingScreen = document.getElementById('loadingScreen');
    const progressBar = document.getElementById('progressBar');

    // Hide splash content initially
    document.querySelector('.splash-container').style.opacity = '0';

    // Initialize variables
    let currentSlide = 0;
    const totalSlides = 5;
    let autoSlideInterval;
    let isAutoSliding = true;

    // Update progress bar based on current slide
    function updateProgressBar() {
        const progress = ((currentSlide) / (totalSlides - 1)) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Add visual enhancement to progress bar during transitions
        progressBar.classList.add('updating');
        setTimeout(() => {
            progressBar.classList.remove('updating');
        }, 1000);
    }

    // Function to update slider position (vertical)
    function updateSlider() {
        // Add transitioning state
        slider.setAttribute('data-transitioning', 'true');
        document.querySelector('.splash-container').classList.add('transitioning');
        
        // Reset any content transforms from hover effects
        document.querySelectorAll('.slide-content').forEach(content => {
            content.style.transform = '';
        });
        
        // Remove any spotlight overlays
        document.querySelectorAll('.spotlight-overlay').forEach(overlay => {
            overlay.remove();
        });
        
        // Reset timer when changing slides
        if (window.resetTimer) {
            window.resetTimer();
        }
        
        // After a slight delay, update the position
        setTimeout(() => {
        slider.style.transform = `translateY(-${currentSlide * 20}%)`;
        slider.setAttribute('data-active', currentSlide);
            
            // Apply perspective effect
            const slides = document.querySelectorAll('.slide');
            slides.forEach((slide, index) => {
                if (index === currentSlide) {
                    slide.style.transform = 'translateZ(0px)';
                    slide.style.opacity = '1';
                } else if (index === currentSlide - 1 || index === currentSlide + 1) {
                    slide.style.transform = 'translateZ(-50px)';
                    slide.style.opacity = '0.8';
                } else {
                    slide.style.transform = 'translateZ(-100px)';
                    slide.style.opacity = '0.6';
                }
            });
        }, 100);
        
        // Hide scroll indicator on last slide
        const scrollIndicator = document.getElementById('scrollIndicator');
        const skipButton = document.getElementById('skipButton');
        skipButton.style.opacity = '0';
        scrollIndicator.style.opacity = '0';
        if (currentSlide === totalSlides - 1) {
            skipButton.style.opacity = '0';
            scrollIndicator.style.opacity = '0';
            skipButton.style.visibility = 'hidden';
            scrollIndicator.style.visibility = 'hidden';
            skipButton.classList.remove('cursor-active');
            scrollIndicator.classList.remove('cursor-active');
            document.body.classList.remove('last-slide-active');
        } else {
            skipButton.style.visibility = 'visible';
            scrollIndicator.style.visibility = 'visible';

            // Show skip button and scroll indicator when cursor moves
            document.addEventListener('mousemove', () => {
                skipButton.classList.add('cursor-active');
                skipButton.style.opacity = '1';
                scrollIndicator.classList.add('cursor-active');
                scrollIndicator.style.opacity = '1';
                clearTimeout(scrollIndicator.timeout);

                // Set new timeout to hide after 2 seconds of inactivity
                scrollIndicator.timeout = setTimeout(() => {
                    skipButton.classList.remove('cursor-active');
                    skipButton.style.opacity = '0';
                    scrollIndicator.classList.remove('cursor-active');
                    scrollIndicator.style.opacity = '0';
                }, 2000);
            });
        }
        
        // Apply continuous background effect
        const backgrounds = document.querySelectorAll('.parallax-bg');
        backgrounds.forEach((bg, index) => {
            if (index === currentSlide) {
                bg.style.opacity = '1';
            } else if (index === currentSlide - 1 || index === currentSlide + 1) {
                bg.style.opacity = '0.3';
            } else {
                bg.style.opacity = '0';
            }
        });
        
        // Remove transitioning state after animation completes
        setTimeout(() => {
            slider.setAttribute('data-transitioning', 'false');
            document.querySelector('.splash-container').classList.remove('transitioning');
        }, 1800);
        
        updateProgressBar();

        // Update navigation dots
        navDots.forEach(dot => {
            dot.classList.remove('active');
        });
        navDots[currentSlide].classList.add('active');

        // Show/hide skip button on last slide
        if (currentSlide === totalSlides - 1) {
            skipButton.style.display = 'none';
        } else {
            skipButton.style.display = 'block';
        }
    }

    // Function to go to a specific slide
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        updateSlider();
        resetAutoSlide();
    }

    // Function to go to next slide
    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlider();
        }
    }

    // Function to initialize auto sliding
    function startAutoSlide() {
        if (!isAutoSliding) return;
        autoSlideInterval = setInterval(() => {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
                updateSlider();
            } else {
                stopAutoSlide();
            }
        }, 5000); // Change slide every 5 seconds
    }

    // Function to stop auto sliding
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
        isAutoSliding = false;
    }

    // Function to reset auto slide timer
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        if (isAutoSliding) {
            startAutoSlide();
        }
    }

    // Preload images function
    function preloadImages() {
        return new Promise((resolve) => {
            const images = [
                'assets/background1.png',
                'assets/background2.png',
                'assets/background3.png',
                'assets/background4.png',
                'assets/background5.png',
                'assets/logo1.png',
                'assets/logo2.png'
            ];

            let loadedCount = 0;
            const totalImages = images.length;

            // If no images to load, resolve immediately
            if (totalImages === 0) {
                resolve();
                return;
            }

            images.forEach(src => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                };
                img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                };
            });
        });
    }

    // SVG animation handlers with enhanced styling to match main system
    function initializeSVGAnimations() {
        // Health tracking SVG animations - enhanced to match main system
        const healthSVG = document.querySelector('.health-svg');
        if (healthSVG) {
            // Ensure SVG container is centered
            healthSVG.parentElement.style.display = 'flex';
            healthSVG.parentElement.style.justifyContent = 'center';

            // Set initial health values for demo
            const redHealthBar = healthSVG.querySelector('.health-red');
            const blueHealthBar = healthSVG.querySelector('.health-blue');
            const redHealthText = healthSVG.querySelector('.red-health-text');
            const blueHealthText = healthSVG.querySelector('.blue-health-text');
            const hitEffect = healthSVG.querySelector('.hit-effect');
            const damageText = healthSVG.querySelector('.damage-text');
            const redFighter = healthSVG.querySelector('.red-fighter');
            const blueFighter = healthSVG.querySelector('.blue-fighter');

            if (redHealthBar && blueHealthBar && redHealthText && blueHealthText) {
                // Initialize health values
                let redHealth = 100;
                let blueHealth = 100;

                // Update text display
                redHealthText.textContent = redHealth;
                blueHealthText.textContent = blueHealth;

                // Simulate damage every 4 seconds
                setInterval(() => {
                    // Random damage value between 5-15
                    const damage = Math.floor(Math.random() * 11) + 5;
                    const isCritical = Math.random() < 0.3; // 30% chance for critical hit
                    const isSuperCritical = Math.random() < 0.1; // 10% chance for super critical

                    // Alternate between red and blue taking damage
                    if (Math.random() > 0.5) {
                        // Blue takes damage
                        blueHealth = Math.max(0, blueHealth - damage);
                        blueHealthText.textContent = blueHealth;
                        blueHealthBar.setAttribute('width', `${blueHealth * 2}px`);

                        // Position hit effect and damage text near blue fighter
                        if (hitEffect && damageText && blueFighter) {
                            const blueBBox = blueFighter.getBBox();
                            hitEffect.setAttribute('cx', blueBBox.x + blueBBox.width/2);
                            hitEffect.setAttribute('cy', blueBBox.y + blueBBox.height/2);
                            damageText.setAttribute('x', blueBBox.x + blueBBox.width/2);
                            damageText.setAttribute('y', blueBBox.y);
                            damageText.textContent = damage;

                            // Reset animation by cloning and replacing
                            const hitParent = hitEffect.parentNode;
                            const newHitEffect = hitEffect.cloneNode(true);
                            hitParent.replaceChild(newHitEffect, hitEffect);

                            const damageParent = damageText.parentNode;
                            const newDamageText = damageText.cloneNode(true);
                            damageParent.replaceChild(newDamageText, damageText);

                            // Apply critical hit effects
                            if (isSuperCritical) {
                                blueFighter.classList.add('superCritical');
                                newDamageText.classList.add('super-critical');
                                setTimeout(() => {
                                    blueFighter.classList.remove('superCritical');
                                }, 500);
                            } else if (isCritical) {
                                blueFighter.classList.add('critical');
                                newDamageText.classList.add('critical');
                                setTimeout(() => {
                                    blueFighter.classList.remove('critical');
                                }, 500);
                            } else {
                                blueFighter.classList.add('hitIcon');
                                setTimeout(() => {
                                    blueFighter.classList.remove('hitIcon');
                                }, 300);
                            }
                        }
                    } else {
                        // Red takes damage
                        redHealth = Math.max(0, redHealth - damage);
                        redHealthText.textContent = redHealth;
                        redHealthBar.setAttribute('width', `${redHealth * 2}px`);

                        // Position hit effect and damage text near red fighter
                        if (hitEffect && damageText && redFighter) {
                            const redBBox = redFighter.getBBox();
                            hitEffect.setAttribute('cx', redBBox.x + redBBox.width/2);
                            hitEffect.setAttribute('cy', redBBox.y + redBBox.height/2);
                            damageText.setAttribute('x', redBBox.x + redBBox.width/2);
                            damageText.setAttribute('y', redBBox.y);
                            damageText.textContent = damage;

                            // Reset animation by cloning and replacing
                            const hitParent = hitEffect.parentNode;
                            const newHitEffect = hitEffect.cloneNode(true);
                            hitParent.replaceChild(newHitEffect, hitEffect);

                            const damageParent = damageText.parentNode;
                            const newDamageText = damageText.cloneNode(true);
                            damageParent.replaceChild(newDamageText, damageText);

                            // Apply critical hit effects
                            if (isSuperCritical) {
                                redFighter.classList.add('superCritical');
                                newDamageText.classList.add('super-critical');
                                setTimeout(() => {
                                    redFighter.classList.remove('superCritical');
                                }, 500);
                            } else if (isCritical) {
                                redFighter.classList.add('critical');
                                newDamageText.classList.add('critical');
                                setTimeout(() => {
                                    redFighter.classList.remove('critical');
                                }, 500);
                            } else {
                                redFighter.classList.add('hitIcon');
                                setTimeout(() => {
                                    redFighter.classList.remove('hitIcon');
                                }, 300);
                            }
                        }
                    }

                    // Reset health if both fighters get too low
                    if (redHealth < 20 && blueHealth < 20) {
                        setTimeout(() => {
                            redHealth = 100;
                            blueHealth = 100;
                            redHealthText.textContent = redHealth;
                            blueHealthText.textContent = blueHealth;
                            redHealthBar.setAttribute('width', `${redHealth * 2}px`);
                            blueHealthBar.setAttribute('width', `${blueHealth * 2}px`);
                        }, 2000);
                    }
                }, 4000);
            }
        }

        // Scoring controls button press simulation - enhanced to match main system
        const scoringSVG = document.querySelector('.scoring-svg');
        if (scoringSVG) {
            // Ensure SVG container is centered
            scoringSVG.parentElement.style.display = 'flex';
            scoringSVG.parentElement.style.justifyContent = 'center';

            // Sequence through different buttons with improved animations
            let activeButtonIndex = 0;
            const buttons = scoringSVG.querySelectorAll('.button');
            const pressIndicator = scoringSVG.querySelector('.press-indicator');
            const hitEffect = scoringSVG.querySelector('.hit-effect-scoring');
            const energyParticles = scoringSVG.querySelectorAll('.energy-particle');
            
            // Add hover effects for buttons
            buttons.forEach(button => {
                button.addEventListener('mouseenter', () => {
                    if (!button.classList.contains('active-button')) {
                        button.querySelector('.button-bg').style.filter = 'brightness(1.2) drop-shadow(0 0 8px currentColor)';
                        button.querySelector('.button-bg').style.transform = 'scale(1.05)';
                    }
                });
                
                button.addEventListener('mouseleave', () => {
                    if (!button.classList.contains('active-button')) {
                        button.querySelector('.button-bg').style.filter = '';
                        button.querySelector('.button-bg').style.transform = '';
                    }
                });
            });

            setInterval(() => {
                // Reset all buttons
                buttons.forEach(button => {
                    button.classList.remove('active-button');
                    if (button.querySelector('.button-bg')) {
                        button.querySelector('.button-bg').style.filter = '';
                        button.querySelector('.button-bg').style.transform = '';
                    }
                });

                // Activate current button
                const currentButton = buttons[activeButtonIndex];
                currentButton.classList.add('active-button');
                
                // Position the press indicator at the current button's center
                const buttonBg = currentButton.querySelector('.button-bg');
                if (buttonBg && pressIndicator) {
                    // Get the center coordinates of the button
                    const cx = buttonBg.getAttribute('cx') || buttonBg.getAttribute('x');
                    const cy = buttonBg.getAttribute('cy') || buttonBg.getAttribute('y');
                    
                    // Set the press indicator's position
                    if (cx && cy) {
                        pressIndicator.setAttribute('cx', cx);
                        pressIndicator.setAttribute('cy', cy);
                        
                        // Also position hit effect at the same location
                        if (hitEffect) {
                            hitEffect.setAttribute('cx', cx);
                            hitEffect.setAttribute('cy', cy);
                            
                            // Clone and replace to restart animation
                            const newHitEffect = hitEffect.cloneNode(true);
                            hitEffect.parentNode.replaceChild(newHitEffect, hitEffect);
                        }
                        
                        // Position energy particles around the active button
                        energyParticles.forEach((particle, index) => {
                            const angle = (index / energyParticles.length) * 2 * Math.PI;
                            const radius = 15 + Math.random() * 10;
                            const particleX = parseFloat(cx) + radius * Math.cos(angle);
                            const particleY = parseFloat(cy) + radius * Math.sin(angle);
                            
                            particle.setAttribute('cx', particleX);
                            particle.setAttribute('cy', particleY);
                            
                            // Make each particle move in a different direction
                            const directions = [
                                'translate(30px, -40px)', // up-right
                                'translate(-30px, -40px)', // up-left
                                'translate(40px, 10px)', // right
                                'translate(-40px, 10px)', // left
                                'translate(0px, -50px)', // straight up
                            ];
                            
                            // Apply a different animation direction for each particle
                            particle.style.animation = `particleFloat${index} ${2 + Math.random() * 1.5}s infinite linear`;
                            particle.style.transform = 'translate(0, 0) scale(1)';
                            
                            // Set the final transform based on the particle's index
                            const finalTransform = directions[index % directions.length];
                            
                            // Create a custom keyframe animation for this particle
                            const particleAnimation = `
                                @keyframes particleFloat${index} {
                                    0% {
                                        transform: translate(0, 0) scale(1);
                                        opacity: 0;
                                    }
                                    10% {
                                        opacity: 0.8;
                                    }
                                    50% {
                                        opacity: 0.5;
                                        transform: ${finalTransform} scale(0.7);
                                    }
                                    100% {
                                        transform: ${finalTransform} scale(0);
                                        opacity: 0;
                                    }
                                }
                            `;
                            
                            // Add the custom animation to the document
                            const styleSheet = document.createElement('style');
                            styleSheet.textContent = particleAnimation;
                            document.head.appendChild(styleSheet);
                            
                            // Apply the custom animation to this particle
                            particle.style.animation = `particleFloat${index} ${2 + Math.random() * 1.5}s infinite linear`;
                        });
                    }

                // Reset and trigger press indicator animation
                    const newIndicator = pressIndicator.cloneNode(true);
                    pressIndicator.parentNode.replaceChild(newIndicator, pressIndicator);
                }

                // Simulate a "hit" effect when a button is pressed
                const damageTexts = currentButton.querySelectorAll('.damage-value');
                if (damageTexts.length) {
                    damageTexts.forEach(text => {
                        // Create a visual pulse effect
                        text.animate([
                            { transform: 'scale(1)', filter: 'drop-shadow(0 0 2px #fff)' },
                            { transform: 'scale(1.3)', filter: 'drop-shadow(0 0 8px #fff)' },
                            { transform: 'scale(1)', filter: 'drop-shadow(0 0 2px #fff)' }
                        ], {
                            duration: 600,
                            easing: 'cubic-bezier(0.19, 1, 0.22, 1)'
                        });
                    });
                }

                // Move to next button
                activeButtonIndex = (activeButtonIndex + 1) % buttons.length;
            }, 2000);
        }

        // Global timer variables and reset function
        let timerInterval;
        let count = 90; // Start at 1:30 (90 seconds)
        
        // Define the resetTimer function in the global scope
        window.resetTimer = function() {
            // Reset timer to 1:30
            count = 90;
            
            // Update timer display immediately
            const timerSVG = document.querySelector('.timer-svg');
            if (timerSVG) {
                const timerText = timerSVG.querySelector('.timer-text');
                
                if (timerText) {
                    const minutes = Math.floor(count / 60);
                    const seconds = count % 60;
                    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                    timerText.textContent = formattedTime;
                    timerText.setAttribute('fill', 'white');
                    timerText.setAttribute('filter', 'url(#glow-blue)');
                }
            }
        };

        // Timer countdown animation - enhanced to match main system
        const timerSVG = document.querySelector('.timer-svg');
        if (timerSVG) {
            // Ensure SVG container is centered
            timerSVG.parentElement.style.display = 'flex';
            timerSVG.parentElement.style.justifyContent = 'center';

            // Remove countdown ring if it exists
            const countdownRing = timerSVG.querySelector('.countdown-ring');
            if (countdownRing) {
                countdownRing.remove();
            }

            // Get timer controls
            const playPauseButton = timerSVG.querySelector('.play-pause');
            const resetButton = timerSVG.querySelector('.reset');
            let isPaused = false;
            
            // Add event listeners to controls
            if (playPauseButton) {
                playPauseButton.addEventListener('click', function() {
                    isPaused = !isPaused;
                    
                    // Update play/pause icon
                    const playIcon = playPauseButton.querySelector('.play-icon') || playPauseButton.nextElementSibling;
                    
                    if (isPaused) {
                        // Change to play icon (showing play since timer is paused)
                        if (playIcon) {
                            playIcon.setAttribute('d', 'M25,-35 L25,-25 L35,-30 Z');
                        }
                    } else {
                        // Change to pause icon
                        if (playIcon) {
                            playIcon.setAttribute('d', 'M25,-35 L25,-25 M35,-35 L35,-25');
                        }
                    }
                });
            }
            
            if (resetButton) {
                resetButton.addEventListener('click', function() {
                    window.resetTimer();
                    
                    // Change back to play icon if we were paused
                    if (isPaused) {
                        isPaused = false;
                        const playIcon = playPauseButton.querySelector('.play-icon') || playPauseButton.nextElementSibling;
                        if (playIcon) {
                            playIcon.setAttribute('d', 'M25,-35 L25,-25 M35,-35 L35,-25');
                        }
                    }
                });
            }

            // Clear any existing interval
            if (timerInterval) {
                clearInterval(timerInterval);
            }

            // Initial timer display
            window.resetTimer();

            timerInterval = setInterval(() => {
                // Don't update if paused
                if (isPaused) return;
                
                // Format time as minutes:seconds
                const minutes = Math.floor(count / 60);
                const seconds = count % 60;
                const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                // Update timer text
                const timerText = timerSVG.querySelector('.timer-text');
                if (timerText) {
                    timerText.textContent = formattedTime;
                    timerText.setAttribute('data-value', formattedTime);

                    // Change color based on time remaining to match main system
                    if (count <= 30) {
                        timerText.setAttribute('fill', '#f44336'); // Red for urgent
                        timerText.setAttribute('filter', 'url(#glow-red)');
                        
                        // Blink when under 10 seconds
                        if (count <= 10) {
                            timerText.classList.add('blink');
                        } else {
                            timerText.classList.remove('blink');
                        }
                    } else if (count <= 60) {
                        timerText.setAttribute('fill', '#ff9800'); // Orange for warning
                        timerText.setAttribute('filter', 'url(#glow-orange)');
                        timerText.classList.remove('blink');
                    } else {
                        timerText.setAttribute('fill', 'white');
                        timerText.setAttribute('filter', 'url(#glow-blue)');
                        timerText.classList.remove('blink');
                    }
                }

                count--;

                // Reset timer when it reaches 0
                if (count < 0) {
                    count = 90;
                    
                    // Optional: Reset round counter with timer
                    const currentRoundText = timerSVG.querySelector('.current-round');
                    if (currentRoundText) {
                        const currentRound = parseInt(currentRoundText.textContent);
                        if (currentRound < 4) {
                            currentRoundText.textContent = currentRound + 1;
                            
                            // Update active round indicator
                            const roundIndicators = timerSVG.querySelectorAll('.round-indicator');
                            roundIndicators.forEach((indicator, index) => {
                                indicator.classList.remove('active');
                                indicator.setAttribute('fill', '#666');
                            });
                            
                            // Activate the next round indicator
                            if (roundIndicators[currentRound]) {
                                roundIndicators[currentRound].classList.add('active');
                                roundIndicators[currentRound].setAttribute('fill', '#f8b71d');
                            }
                        }
                    }
                }
            }, 1000);
        }
    }

    // Hide loading screen and show content
    function hideLoadingScreen() {
        loadingScreen.style.opacity = '0';
        document.querySelector('.splash-container').style.opacity = '1';

        setTimeout(() => {
            loadingScreen.style.visibility = 'hidden';
        }, 500);
    }

    // Initialize the application
    function initApp() {
        // Initialize slider position and state
        updateSlider();
        // Start auto sliding
        startAutoSlide();
        // Initialize SVG animations with styling to match main system
        initializeSVGAnimations();
    }

    // Skip button click handler
    skipButton.addEventListener('click', () => {
        // Navigate to the last slide instead of redirecting
        currentSlide = totalSlides - 1;
        updateSlider();
        stopAutoSlide();
    });

    // Enter button click handler
    enterButton.addEventListener('click', () => {
        // Set flag in sessionStorage indicating splash screen was viewed
        sessionStorage.setItem('hasSeenSplash', 'true');
        // Set localStorage flag to prevent splash on tab/window reopening
        localStorage.setItem('hasSeenSplash', 'true');
        
        // Navigate to transition.html
        window.location.href = 'transition.html';
    });

    // Navigation dots click handlers
    navDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.getAttribute('data-index'));
            goToSlide(slideIndex);
        });
    });

    // Spotlight effect on mouse movement (replacing parallax)
    document.addEventListener('mousemove', function(e) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        // Get the active slide
        const activeSlideIndex = currentSlide;
        const activeSlide = document.querySelector(`.slide[data-index="${activeSlideIndex}"]`);
        
        if (!activeSlide) return;
        
        // Apply movement to background image
        const parallaxBg = activeSlide.querySelector('.parallax-bg');
        if (parallaxBg) {
            // Calculate offset for background
            const offsetX = (x - 0.5) * -10;
            const offsetY = (y - 0.5) * -10;
            
            // Apply movement to background
            parallaxBg.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
        
        // Get or create spotlight overlay
        let spotlightOverlay = activeSlide.querySelector('.spotlight-overlay');
        if (!spotlightOverlay) {
            // Create spotlight overlay if it doesn't exist
            spotlightOverlay = document.createElement('div');
            spotlightOverlay.className = 'spotlight-overlay';
            activeSlide.appendChild(spotlightOverlay);
        }
        
        // Update spotlight overlay position
        if (spotlightOverlay) {
            const spotlightX = x * 100;
            const spotlightY = y * 100;
            spotlightOverlay.style.background = `radial-gradient(circle at ${spotlightX}% ${spotlightY}%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)`;
        }
    });

    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
                updateSlider();
                resetAutoSlide();
            }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlider();
                resetAutoSlide();
            }
        } else if (e.key === 'Escape') {
            // Navigate to the last slide instead of redirecting
            currentSlide = totalSlides - 1;
            updateSlider();
            stopAutoSlide();
        }
    });

    // Add wheel event for scrolling
    let wheelTimeout;
    document.addEventListener('wheel', function(e) {
        // Prevent default scrolling behavior
        e.preventDefault();
        
        // Don't process wheel events during transition
        if (slider.getAttribute('data-transitioning') === 'true') {
            return;
        }
        
        // Clear any existing timeout
        clearTimeout(wheelTimeout);
        
        // Set a timeout to prevent rapid scrolling
        wheelTimeout = setTimeout(function() {
            if (e.deltaY > 0 && currentSlide < totalSlides - 1) {
                // Scroll down
                currentSlide++;
                updateSlider();
            } else if (e.deltaY < 0 && currentSlide > 0) {
                // Scroll up
                currentSlide--;
                updateSlider();
            }
        }, 50);
    }, { passive: false });
    
    // Add touch support for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        // Don't process touch events during transition
        if (slider.getAttribute('data-transitioning') === 'true') {
            return;
        }
        
        touchEndY = e.changedTouches[0].screenY;
        const touchDiff = touchStartY - touchEndY;
        
        // Only register significant touch movements (prevent accidental scrolls)
        if (Math.abs(touchDiff) > 50) {
            if (touchDiff > 0 && currentSlide < totalSlides - 1) {
                // Swipe up (scroll down)
                currentSlide++;
                updateSlider();
            } else if (touchDiff < 0 && currentSlide > 0) {
                // Swipe down (scroll up)
                currentSlide--;
                updateSlider();
            }
        }
    }, { passive: true });
    
    // Make scroll indicator clickable
    const scrollIndicator = document.getElementById('scrollIndicator');
    scrollIndicator.addEventListener('click', function() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlider();
        }
    });

    // Initial setup
    function initSlider() {
        // Set up initial state
        slider.setAttribute('data-active', '0');
        updateSlider();
        
        // Show first slide content with animation
        setTimeout(() => {
            const firstSlideContent = document.querySelector('.slide[data-slide="0"] .slide-content');
            if (firstSlideContent) {
                firstSlideContent.style.opacity = '1';
                firstSlideContent.style.transform = 'translateY(0)';
            }
        }, 500);
        
        // Setup scroll indicator
        if (scrollIndicator) {
            scrollIndicator.style.opacity = '1';
        }
    }

    // Call initialization when document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlider);
    } else {
        initSlider();
    }

    // Start loading process
    preloadImages()
        .then(() => {
            // Add a slight delay to make loading screen visible for at least 1 second
            setTimeout(() => {
                hideLoadingScreen();
                initApp();
            }, 1000);
        })
        .catch(error => {
            console.error("Error during preloading:", error);
            hideLoadingScreen();
            initApp();
        });
});