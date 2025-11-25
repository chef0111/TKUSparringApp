/**
 * SPA Manager for TKU Sparring System
 * Manages the application flow between splash, transition, and main pages
 */

window.SPA = {
    init: function() {
        console.log('SPA Initializing...');
        if (!sessionStorage.getItem('hasSeenSplash')) {
            this.showView('splash');
        } else if (!sessionStorage.getItem('hasSeenTransition')) {
            this.showView('transition');
        } else {
            this.showView('app');
        }
    },

    showView: function(viewName) {
        console.log('Showing view:', viewName);
        const views = document.querySelectorAll('.spa-view');
        views.forEach(view => {
            view.style.display = 'none';
        });

        const view = document.getElementById('view-' + viewName);
        if (view) {
            view.style.display = 'block';
            
            // Trigger specific view logic if needed
            if (viewName === 'splash') {
                document.dispatchEvent(new CustomEvent('view:splash'));
            } else if (viewName === 'transition') {
                document.dispatchEvent(new CustomEvent('view:transition'));
            } else if (viewName === 'app') {
                document.dispatchEvent(new CustomEvent('view:app'));
            }
        } else {
            console.error('View not found:', viewName);
        }
    },
    
    navigate: function(toView) {
        if (toView === 'transition') {
             sessionStorage.setItem('hasSeenSplash', 'true');
             localStorage.setItem('hasSeenSplash', 'true');
        }
        if (toView === 'app') {
             sessionStorage.setItem('hasSeenTransition', 'true');
        }
        this.showView(toView);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.SPA.init();
    }, 50);
});
