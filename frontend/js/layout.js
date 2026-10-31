// ============================================
// SafeHer - Layout JavaScript
// (Sidebar, Navbar, Dropdowns, Bottom Nav)
// ============================================

/**
 * Layout Manager - Handles all navigation UI
 */
const Layout = {
  init() {
    this.setupSidebar();
    this.setupDropdowns();
    this.setupLogout();
    this.setupSOSButtons();
    this.setupKeyboardShortcuts();
    console.log('🎨 Layout initialized');
  },

  /**
   * Sidebar toggle (mobile)
   */
  setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const overlay = document.getElementById('sidebar-overlay');

    if (!sidebar) return;

    const openSidebar = () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeSidebar = () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (menuToggle) menuToggle.addEventListener('click', openSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
    });
  },

  /**
   * Dropdown menus (notifications & profile)
   */
  setupDropdowns() {
    const notifBtn = document.getElementById('notification-btn');
    const notifDropdown = document.getElementById('notification-dropdown');
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');

    // Notification dropdown
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
        if (profileDropdown) profileDropdown.classList.remove('show');
        if (profileBtn) profileBtn.classList.remove('show');
      });
    }

    // Profile dropdown
    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
        profileBtn.classList.toggle('show');
        if (notifDropdown) notifDropdown.classList.remove('show');
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (notifDropdown && !e.target.closest('.navbar-notification-wrapper')) {
        notifDropdown.classList.remove('show');
      }
      if (profileDropdown && !e.target.closest('.navbar-profile-wrapper')) {
        profileDropdown.classList.remove('show');
        if (profileBtn) profileBtn.classList.remove('show');
      }
    });

    // Mark all notifications as read
    const markAllBtn = document.querySelector('.notification-mark-all');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
          item.classList.remove('unread');
        });
        const dot = document.querySelector('.notification-dot');
        if (dot) dot.style.display = 'none';
        Toast.success('All notifications marked as read');
      });
    }
  },

  /**
   * Logout functionality
   */
  setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (confirm('Are you sure you want to sign out?')) {
        // Clear user session
        localStorage.removeItem('safeher_user');
        sessionStorage.removeItem('safeher_user');
        
        Toast.info('Signing out...');
        
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 800);
      }
    });
  },

  /**
   * SOS buttons across the layout
   */
  setupSOSButtons() {
    const sosButtons = [
      document.getElementById('sidebar-sos-btn'),
      document.getElementById('navbar-quick-sos'),
      document.getElementById('big-sos-btn'),
      document.getElementById('bottom-nav-sos')
    ].filter(Boolean);

    sosButtons.forEach(btn => {
      btn.addEventListener('click', () => this.handleSOS());
    });
  },

  /**
   * Handle SOS activation (placeholder - full logic in Phase F4)
   */
   handleSOS() {
    const confirmed = confirm(
      'You pressed the SafeHer SOS button. This is a demo only. No emergency contacts or police will be notified. Do you want to continue?'
    );

    if (!confirmed) return;

    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    Toast.warning(
      'SOS Demo activated. No real emergency alert was sent.',
      4000
    );
},

  /**
   * Keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.navbar-search input');
        if (searchInput) searchInput.focus();
      }
    });
  }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => Layout.init());