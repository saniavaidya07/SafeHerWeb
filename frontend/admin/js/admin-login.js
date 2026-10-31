// ============================================
// SafeHer - Admin Login Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('👨‍💼 Admin Login Initialized');

  // Role selector
  const roleOptions = document.querySelectorAll('.role-option');
  roleOptions.forEach(option => {
    option.addEventListener('click', () => {
      roleOptions.forEach(o => o.classList.remove('active'));
      option.classList.add('active');
    });
  });

  // Password toggle
  const pwdToggle = document.getElementById('admin-pwd-toggle');
  const pwdInput = document.getElementById('admin-password');
  
  pwdToggle?.addEventListener('click', () => {
    const icon = pwdToggle.querySelector('i');
    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      pwdInput.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  });

  // Login form
  const form = document.getElementById('admin-login-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    if (!email || !password) {
      Toast.error('Please fill in all fields');
      return;
    }

    const btn = document.getElementById('btn-admin-signin');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    const btnArrow = btn.querySelector('.btn-arrow');

    btnText.textContent = 'Authenticating...';
    btnLoader.classList.remove('hidden');
    btnArrow.style.display = 'none';
    btn.disabled = true;

    // Simulate authentication
    setTimeout(() => {
      // Save admin session
      const adminData = {
        email,
        role,
        name: 'Admin User',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('safeher_admin', JSON.stringify(adminData));

      Toast.success('✓ Authentication successful! Redirecting...');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    }, 1500);
  });
});