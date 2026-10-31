// ============================================
// SafeHer - Profile & Settings Logic
// ============================================

const Profile = {
  state: {
    currentTab: 'personal',
    editingPersonal: false,
    userData: null,
    theme: 'dark',
    accentColor: 'purple'
  },

  init() {
    this.loadUserData();
    this.setupTabs();
    this.setupPersonalForm();
    this.setupAvatarUpload();
    this.setupPasswordForm();
    this.setupBioCounter();
    this.setupThemeOptions();
    this.setupColorOptions();
    this.setupToggles();
    this.setupDeleteAccount();
    this.setup2FA();
    this.setupMuteAll();
    console.log('👤 Profile initialized');
  },

  // ============================================
  // LOAD USER DATA
  // ============================================
  loadUserData() {
    const stored = JSON.parse(localStorage.getItem('safeher_user'));
    if (stored) {
      this.state.userData = stored;
      const name = stored.fullName || stored.name || 'Priya Sharma';
      const email = stored.email || 'priya.sharma@example.com';
      
      document.getElementById('hero-name').textContent = name;
      document.getElementById('hero-email').textContent = email;
      
      const initial = name.charAt(0).toUpperCase();
      document.getElementById('main-avatar-text').textContent = initial;
    }
  },

  // ============================================
  // TABS
  // ============================================
  setupTabs() {
    document.querySelectorAll('.profile-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchTab(tabName);
      });
    });
  },

  switchTab(tabName) {
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.profile-tab[data-tab="${tabName}"]`)?.classList.add('active');

    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-${tabName}`)?.classList.add('active');

    this.state.currentTab = tabName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ============================================
  // PERSONAL FORM
  // ============================================
  setupPersonalForm() {
    const editBtn = document.getElementById('btn-edit-personal');
    const cancelBtn = document.getElementById('btn-cancel-personal');
    const form = document.getElementById('personal-form');
    const actions = document.getElementById('personal-actions');
    const inputs = form?.querySelectorAll('input, textarea, select');

    editBtn?.addEventListener('click', () => {
      inputs.forEach(input => input.disabled = false);
      actions.style.display = 'flex';
      editBtn.style.display = 'none';
      this.state.editingPersonal = true;
      Toast.info('Edit mode enabled');
    });

    cancelBtn?.addEventListener('click', () => {
      inputs.forEach(input => input.disabled = true);
      actions.style.display = 'none';
      editBtn.style.display = 'flex';
      this.state.editingPersonal = false;
      Toast.info('Changes cancelled');
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      // Save changes
      inputs.forEach(input => input.disabled = true);
      actions.style.display = 'none';
      editBtn.style.display = 'flex';
      this.state.editingPersonal = false;

      // Update user data
      const firstName = document.getElementById('first-name').value;
      const lastName = document.getElementById('last-name').value;
      const email = document.getElementById('email').value;
      const fullName = `${firstName} ${lastName}`.trim();

      document.getElementById('hero-name').textContent = fullName;
      document.getElementById('hero-email').textContent = email;

      // Save to localStorage
      localStorage.setItem('safeher_user', JSON.stringify({
        ...this.state.userData,
        fullName,
        firstName,
        lastName,
        email
      }));

      Toast.success('✓ Profile updated successfully');
    });
  },

  // ============================================
  // AVATAR UPLOAD
  // ============================================
  setupAvatarUpload() {
    document.getElementById('avatar-upload')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate
      if (!file.type.startsWith('image/')) {
        Toast.error('Please upload a valid image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        Toast.error('Image must be less than 5MB');
        return;
      }

      // Preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.getElementById('main-avatar-img');
        const text = document.getElementById('main-avatar-text');
        img.src = event.target.result;
        img.style.display = 'block';
        text.style.display = 'none';
      };
      reader.readAsDataURL(file);

      Toast.success('✓ Profile photo updated');
    });
  },

  // ============================================
  // BIO CHARACTER COUNTER
  // ============================================
  setupBioCounter() {
    const bio = document.getElementById('bio');
    const counter = document.getElementById('bio-count');

    bio?.addEventListener('input', () => {
      const length = bio.value.length;
      counter.textContent = length;
      if (length > 180) counter.style.color = 'var(--color-emergency)';
      else if (length > 150) counter.style.color = 'var(--color-warning)';
      else counter.style.color = 'var(--color-gray)';
    });
  },

  // ============================================
  // PASSWORD FORM
  // ============================================
  setupPasswordForm() {
    // Toggle password visibility
    document.querySelectorAll('.pwd-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = toggle.dataset.target;
        const input = document.getElementById(targetId);
        const icon = toggle.querySelector('i');

        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });

    // Password strength meter
    const newPassword = document.getElementById('new-password');
    const strengthFill = document.getElementById('pwd-strength-fill');
    const strengthText = document.getElementById('pwd-strength-text');
    const requirements = document.querySelectorAll('.pwd-requirements li');

    newPassword?.addEventListener('input', () => {
      const value = newPassword.value;
      const checks = {
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[^A-Za-z0-9]/.test(value)
      };

      // Update requirements
      requirements.forEach(req => {
        const type = req.dataset.req;
        if (checks[type]) req.classList.add('met');
        else req.classList.remove('met');
      });

      // Update strength bar
      const score = Object.values(checks).filter(v => v).length;
      strengthFill.className = 'pwd-strength-fill';
      strengthText.className = 'pwd-strength-text';

      if (value.length === 0) {
        strengthText.textContent = 'Enter password';
      } else if (score <= 1) {
        strengthFill.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Weak';
      } else if (score === 2) {
        strengthFill.classList.add('fair');
        strengthText.classList.add('fair');
        strengthText.textContent = 'Fair';
      } else if (score === 3) {
        strengthFill.classList.add('good');
        strengthText.classList.add('good');
        strengthText.textContent = 'Good';
      } else {
        strengthFill.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = 'Strong';
      }
    });

    // Submit
    document.getElementById('password-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = document.getElementById('current-password').value;
      const newPwd = document.getElementById('new-password').value;
      const confirm = document.getElementById('confirm-password').value;

      if (!current) return Toast.error('Please enter current password');
      if (newPwd.length < 8) return Toast.error('Password must be 8+ characters');
      if (newPwd !== confirm) return Toast.error('Passwords do not match');

      Toast.success('✓ Password updated successfully');
      e.target.reset();
      strengthFill.className = 'pwd-strength-fill';
      strengthText.textContent = 'Enter password';
      requirements.forEach(req => req.classList.remove('met'));
    });
  },

  // ============================================
  // THEME OPTIONS
  // ============================================
  setupThemeOptions() {
    document.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        const theme = option.querySelector('input').value;
        this.state.theme = theme;
        Toast.info(`Theme changed to ${theme} mode`);
      });
    });
  },

  // ============================================
  // COLOR OPTIONS
  // ============================================
  setupColorOptions() {
    document.querySelectorAll('.color-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        const color = option.querySelector('input').value;
        this.state.accentColor = color;
        Toast.info(`Accent color: ${color}`);
      });
    });
  },

  // ============================================
  // TOGGLES
  // ============================================
  setupToggles() {
    document.querySelectorAll('.switch-lg input[type="checkbox"]').forEach(toggle => {
      toggle.addEventListener('change', () => {
        // Toast on change (optional)
      });
    });
  },

  // ============================================
  // 2FA
  // ============================================
  setup2FA() {
    const status = document.getElementById('2fa-status');
    const toggles = ['2fa-sms', '2fa-email', '2fa-biometric', '2fa-app'];

    toggles.forEach(id => {
      const toggle = document.getElementById(id);
      toggle?.addEventListener('change', () => {
        const anyEnabled = toggles.some(t => document.getElementById(t)?.checked);
        if (anyEnabled) {
          status.textContent = 'Enabled';
          status.classList.remove('off');
          status.classList.add('on');
        } else {
          status.textContent = 'Disabled';
          status.classList.remove('on');
          status.classList.add('off');
        }
      });
    });
  },

  // ============================================
  // MUTE ALL
  // ============================================
  setupMuteAll() {
    document.getElementById('btn-mute-all')?.addEventListener('click', () => {
      const notifToggles = document.querySelectorAll('.notif-item .switch-lg input[type="checkbox"]');
      const allMuted = Array.from(notifToggles).every(t => !t.checked);

      if (allMuted) {
        notifToggles.forEach(t => t.checked = true);
        Toast.success('All notifications enabled');
      } else {
        notifToggles.forEach(t => t.checked = false);
        Toast.warning('All notifications muted');
      }
    });
  },

  // ============================================
  // DELETE ACCOUNT
  // ============================================
  setupDeleteAccount() {
    document.getElementById('btn-delete-account')?.addEventListener('click', () => {
      document.getElementById('delete-account-modal').classList.add('show');
    });

    document.getElementById('delete-account-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'delete-account-modal') e.target.classList.remove('show');
    });

    // Enable confirm button only when typing "DELETE"
    const input = document.getElementById('delete-confirm-input');
    const confirmBtn = document.getElementById('btn-confirm-delete-account');

    input?.addEventListener('input', () => {
      confirmBtn.disabled = input.value !== 'DELETE';
    });

    confirmBtn?.addEventListener('click', () => {
      if (input.value === 'DELETE') {
        Toast.info('Account deletion initiated...');
        setTimeout(() => {
          localStorage.clear();
          window.location.href = 'index.html';
        }, 2000);
      }
    });
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  Profile.init();
});