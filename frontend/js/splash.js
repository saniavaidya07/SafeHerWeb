// ============================================
// SafeHer - Splash Screen JavaScript
// ============================================

/**
 * Splash Screen Manager
 * Handles the splash screen animation and transition to login page
 */
class SplashScreen {
  constructor() {
    this.splashScreen = document.getElementById('splash-screen');
    this.loadingState = document.getElementById('loading-state');
    this.btnGetStarted = document.getElementById('btn-get-started');
    this.loadDuration = 2500; // 2.5 seconds

    this.init();
  }

  /**
   * Initialize the splash screen
   */
  init() {
    console.log('🚀 SafeHer Splash Screen Initialized');
    
    // Show "Get Started" button after loading
    this.startLoadingSequence();

    // Attach event listener to button
    if (this.btnGetStarted) {
      this.btnGetStarted.addEventListener('click', () => this.navigateToLogin());
    }

    // Allow user to skip splash by clicking anywhere after 1 second
    setTimeout(() => {
      this.enableSkip();
    }, 1000);

    // Auto-navigate after longer time (optional)
    // setTimeout(() => this.navigateToLogin(), 6000);
  }

  /**
   * Start the loading sequence
   */
  startLoadingSequence() {
    setTimeout(() => {
      this.showGetStartedButton();
    }, this.loadDuration);
  }

  /**
   * Show the Get Started button after loading
   */
  showGetStartedButton() {
    if (this.loadingState && this.btnGetStarted) {
      // Fade out loading state
      this.loadingState.style.transition = 'opacity 0.3s ease';
      this.loadingState.style.opacity = '0';

      setTimeout(() => {
        this.loadingState.style.display = 'none';
        this.btnGetStarted.style.display = 'flex';
      }, 300);
    }
  }

  /**
   * Enable skip splash on click
   */
  enableSkip() {
    this.splashScreen.style.cursor = 'pointer';
    this.splashScreen.addEventListener('click', (e) => {
      // Only skip if clicking on the background, not the button
      if (e.target === this.splashScreen || e.target.classList.contains('splash-content')) {
        this.showGetStartedButton();
      }
    });
  }

  /**
   * Navigate to the login page
   */
  navigateToLogin() {
    console.log('➡️ Navigating to login page...');

    // Add fade out animation
    this.splashScreen.classList.add('fade-out');

    // Navigate after animation completes
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 600);
  }
}

// ============================================
// Initialize when DOM is ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  new SplashScreen();

  // Log welcome message
  console.log('%c🚨 SafeHer', 'font-size: 24px; font-weight: bold; color: #7C3AED;');
  console.log('%cYour Safety. Your Strength.', 'font-size: 14px; color: #EC4899;');
  console.log('%cBuilt with ❤️ for women\'s safety', 'font-size: 12px; color: #64748B;');
});