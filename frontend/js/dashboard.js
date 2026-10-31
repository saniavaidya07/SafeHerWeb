// ============================================
// SafeHer - Dashboard Logic
// ============================================

const Dashboard = {
  init() {
    this.loadUserData();
    this.setGreeting();
    this.detectLocation();
    this.animateFeatureCards();
    console.log('🏠 Dashboard initialized');
  },

  /**
   * Load user data from localStorage/sessionStorage
   */
  loadUserData() {
    const userData =
        JSON.parse(sessionStorage.getItem('safeher_user')) ||
        JSON.parse(localStorage.getItem('safeher_user'));

    // Redirect to login if not logged in
    if (!userData) {
        window.location.replace('login.html');
        return;
    }

    this.setUserInfo(userData);
},

  /**
   * Set user info across the UI
   */
  setUserInfo(user) {
    const name = user.fullName || user.name || user.email?.split('@')[0] || 'User';
    const email = user.email || 'user@safeher.com';
    const initial = name.charAt(0).toUpperCase();

    // Welcome name
    const welcomeName = document.getElementById('welcome-name');
    if (welcomeName) welcomeName.textContent = name.split(' ')[0];

    // Sidebar
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarInitial = document.getElementById('sidebar-avatar-initial');
    if (sidebarName) sidebarName.textContent = name;
    if (sidebarInitial) sidebarInitial.textContent = initial;

    // Navbar
    const navbarName = document.getElementById('navbar-user-name');
    const navbarInitial = document.getElementById('navbar-avatar-initial');
    if (navbarName) navbarName.textContent = name.split(' ')[0];
    if (navbarInitial) navbarInitial.textContent = initial;

    // Profile dropdown
    const dropdownName = document.getElementById('dropdown-user-name');
    const dropdownEmail = document.getElementById('dropdown-user-email');
    const dropdownInitial = document.getElementById('dropdown-avatar-initial');
    if (dropdownName) dropdownName.textContent = name;
    if (dropdownEmail) dropdownEmail.textContent = email;
    if (dropdownInitial) dropdownInitial.textContent = initial;
  },

  /**
   * Set greeting based on time
   */
  setGreeting() {
    const greetingEl = document.getElementById('welcome-greeting');
    if (!greetingEl) return;

    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    let emoji = '☀️';

    if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon';
      emoji = '🌤️';
    } else if (hour >= 17 && hour < 21) {
      greeting = 'Good Evening';
      emoji = '🌆';
    } else if (hour >= 21 || hour < 5) {
      greeting = 'Good Night';
      emoji = '🌙';
    }

    greetingEl.textContent = `${greeting} ${emoji}`;
  },

  /**
   * Detect user location
   */
  detectLocation() {
    const locationStatus = document.getElementById('location-status');
    if (!locationStatus) return;

    if (!navigator.geolocation) {
      locationStatus.textContent = 'Not Supported';
      return;
    }

    locationStatus.textContent = 'Detecting...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        locationStatus.textContent = `Detected ✓`;
        locationStatus.style.color = 'var(--color-success)';
        
        // Store for later use
        sessionStorage.setItem('user_location', JSON.stringify({
          latitude,
          longitude,
          timestamp: new Date().toISOString()
        }));
      },
      (error) => {
        locationStatus.textContent = 'Permission Denied';
        locationStatus.style.color = 'var(--color-warning)';
      },
      { timeout: 10000 }
    );
  },

  /**
   * Animate feature cards on scroll
   */
  animateFeatureCards() {
    const cards = document.querySelectorAll('.feature-card');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Dashboard.init();

  // Welcome toast
  setTimeout(() => {
    Toast.success('Welcome to SafeHer! Your dashboard is ready 🎉');
  }, 500);
});