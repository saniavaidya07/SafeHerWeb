// ============================================
// SafeHer - Admin Common JavaScript
// ============================================

const Admin = {
  init() {
    this.checkAuth();
    this.setupSidebar();
    this.setupLogout();
    this.loadAdminData();
    console.log('👨‍💼 Admin panel initialized');
  },

  // Check if admin is logged in
  checkAuth() {
    const adminData = localStorage.getItem('safeher_admin');
    if (!adminData && !window.location.pathname.includes('login.html')) {
      window.location.href = 'login.html';
    }
  },

  // Setup sidebar toggle
  setupSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    const toggle = document.getElementById('admin-menu-toggle');
    const close = document.getElementById('admin-sidebar-close');

    const openSidebar = () => {
      sidebar?.classList.add('active');
      overlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeSidebar = () => {
      sidebar?.classList.remove('active');
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
    };

    toggle?.addEventListener('click', openSidebar);
    close?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);
  },

  // Setup logout
  setupLogout() {
    document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('safeher_admin');
        Toast.info('Signing out...');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 800);
      }
    });
  },

  // Load admin data
  loadAdminData() {
    const admin = JSON.parse(localStorage.getItem('safeher_admin') || '{}');
    // Update UI with admin info if needed
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Admin.init();
});