// ============================================
// SafeHer - Authentication Logic
// ============================================

/**
 * Validation utilities
 */
const Validator = {
  email(value) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  },

  phone(value) {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  },

  emailOrPhone(value) {
    return this.email(value) || this.phone(value);
  },

  name(value) {
    return value.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(value);
  },

  password(value) {
    return value.length >= 8;
  },

  passwordStrength(value) {
    let score = 0;
    const checks = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[^A-Za-z0-9]/.test(value)
    };

    Object.values(checks).forEach(check => { if (check) score++; });

    return { score, checks };
  }
};

/**
 * Show/hide password toggle
 */
function setupPasswordToggle() {
  const toggles = document.querySelectorAll('.password-toggle');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = toggle.dataset.target || 'password';
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
}

/**
 * Real-time input validation
 */
function setupInputValidation() {
  // Email/Phone (Login)
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('blur', () => validateLoginEmail(emailInput));
    emailInput.addEventListener('input', () => clearError('email'));
  }

  // Password (Login)
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', () => clearError('password'));
  }

  // Register: Full Name
  const nameInput = document.getElementById('fullName');
  if (nameInput) {
    nameInput.addEventListener('blur', () => {
      const value = nameInput.value.trim();
      if (value && !Validator.name(value)) {
        showError('fullName', 'Please enter a valid name (letters only, min 2 chars)');
        nameInput.classList.add('invalid');
        nameInput.classList.remove('valid');
      } else if (value) {
        clearError('fullName');
        nameInput.classList.add('valid');
        nameInput.classList.remove('invalid');
      }
    });
    nameInput.addEventListener('input', () => clearError('fullName'));
  }

  // Register: Email
  const regEmail = document.getElementById('regEmail');
  if (regEmail) {
    regEmail.addEventListener('blur', () => {
      const value = regEmail.value.trim();
      if (value && !Validator.email(value)) {
        showError('regEmail', 'Please enter a valid email address');
        regEmail.classList.add('invalid');
        regEmail.classList.remove('valid');
      } else if (value) {
        clearError('regEmail');
        regEmail.classList.add('valid');
        regEmail.classList.remove('invalid');
      }
    });
    regEmail.addEventListener('input', () => clearError('regEmail'));
  }

  // Register: Phone
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('blur', () => {
      const value = phoneInput.value.trim();
      if (value && !Validator.phone(value)) {
        showError('phone', 'Please enter a valid phone number');
      } else {
        clearError('phone');
      }
    });
    phoneInput.addEventListener('input', () => clearError('phone'));
  }

  // Confirm Password
  const confirmPass = document.getElementById('confirmPassword');
  if (confirmPass) {
    confirmPass.addEventListener('input', () => {
      const password = document.getElementById('regPassword').value;
      if (confirmPass.value && confirmPass.value !== password) {
        showError('confirmPassword', 'Passwords do not match');
      } else {
        clearError('confirmPassword');
      }
    });
  }
}

/**
 * Validate login email/phone
 */
function validateLoginEmail(input) {
  const value = input.value.trim();
  if (value && !Validator.emailOrPhone(value)) {
    showError('email', 'Please enter a valid email or phone number');
    input.classList.add('invalid');
    input.classList.remove('valid');
    return false;
  } else if (value) {
    clearError('email');
    input.classList.add('valid');
    input.classList.remove('invalid');
    return true;
  }
  return true;
}

/**
 * Show error message
 */
function showError(fieldId, message) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  const inputEl = document.getElementById(fieldId);
  if (errorEl) errorEl.textContent = message;
  if (inputEl) {
    inputEl.classList.add('invalid');
    inputEl.classList.remove('valid');
    inputEl.classList.add('animate-shake');
    setTimeout(() => inputEl.classList.remove('animate-shake'), 500);
  }
}

/**
 * Clear error message
 */
function clearError(fieldId) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) errorEl.textContent = '';
}

/**
 * Password strength meter
 */
function setupPasswordStrength() {
  const passwordInput = document.getElementById('regPassword');
  if (!passwordInput) return;

  const strengthFill = document.getElementById('strength-fill');
  const strengthText = document.getElementById('strength-text');
  const requirements = document.querySelectorAll('#password-requirements li');

  passwordInput.addEventListener('input', () => {
    const value = passwordInput.value;
    const { score, checks } = Validator.passwordStrength(value);

    // Update requirements
    requirements.forEach(req => {
      const type = req.dataset.req;
      if (checks[type]) {
        req.classList.add('met');
      } else {
        req.classList.remove('met');
      }
    });

    // Update strength bar
    strengthFill.className = 'strength-fill';
    strengthText.className = 'strength-text';

    if (value.length === 0) {
      strengthText.textContent = 'Password strength';
      return;
    }

    if (score <= 2) {
      strengthFill.classList.add('strength-weak');
      strengthText.classList.add('strength-weak');
      strengthText.textContent = '⚠️ Weak password';
    } else if (score === 3) {
      strengthFill.classList.add('strength-fair');
      strengthText.classList.add('strength-fair');
      strengthText.textContent = '⚡ Fair password';
    } else if (score === 4) {
      strengthFill.classList.add('strength-good');
      strengthText.classList.add('strength-good');
      strengthText.textContent = '✓ Good password';
    } else {
      strengthFill.classList.add('strength-strong');
      strengthText.classList.add('strength-strong');
      strengthText.textContent = '🛡️ Strong password';
    }
  });
}

/**
 * Multi-step form (Register)
 */
function setupMultiStepForm() {
  const nextBtn = document.getElementById('btn-next-step');
  const backBtn = document.getElementById('btn-back-step');
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const steps = document.querySelectorAll('.step');

  if (!nextBtn || !backBtn) return;

  nextBtn.addEventListener('click', () => {
    // Validate step 1 fields
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('phone').value.trim();

    let hasError = false;

    if (!fullName) {
      showError('fullName', 'Please enter your full name');
      hasError = true;
    } else if (!Validator.name(fullName)) {
      showError('fullName', 'Please enter a valid name');
      hasError = true;
    }

    if (!email) {
      showError('regEmail', 'Please enter your email address');
      hasError = true;
    } else if (!Validator.email(email)) {
      showError('regEmail', 'Please enter a valid email address');
      hasError = true;
    }

    if (!phone) {
      showError('phone', 'Please enter your phone number');
      hasError = true;
    } else if (!Validator.phone(phone)) {
      showError('phone', 'Please enter a valid phone number');
      hasError = true;
    }

    if (hasError) {
      Toast.error('Please fill in all required fields correctly');
      return;
    }

    // Move to step 2
    step1.classList.remove('active');
    step2.classList.add('active');
    steps[0].classList.remove('active');
    steps[0].classList.add('completed');
    steps[1].classList.add('active');
  });

  backBtn.addEventListener('click', () => {
    step2.classList.remove('active');
    step1.classList.add('active');
    steps[1].classList.remove('active');
    steps[0].classList.remove('completed');
    steps[0].classList.add('active');
  });
}

/**
 * Handle Login Form Submit
 */
function setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        if (!email) {
            showError('email', 'Please enter your email');
            return;
        }

        if (!password) {
            showError('password', 'Please enter your password');
            return;
        }

        const btn = document.getElementById('btn-login');
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');
        const btnArrow = btn.querySelector('.btn-arrow');

        btnText.textContent = 'Signing in...';
        btnLoader.classList.remove('hidden');
        btnArrow.style.display = 'none';
        btn.disabled = true;

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            const userData = {
                ...data.user,
                loginTime: new Date().toISOString()
            };

            if (rememberMe) {
                localStorage.setItem('safeher_user', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('safeher_user', JSON.stringify(userData));
            }

            Toast.success('Login successful! Welcome back ❤️');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            Toast.error(error.message || 'Could not connect to SafeHer server');

            btnText.textContent = 'Sign In Securely';
            btnLoader.classList.add('hidden');
            btnArrow.style.display = '';
            btn.disabled = false;
        }
    });
}

/**
 * Handle Register Form Submit
 */
 function setupRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const countryCode = document.getElementById('countryCode').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        let hasError = false;

        if (!fullName || !Validator.name(fullName)) {
            showError('fullName', 'Please enter a valid name');
            hasError = true;
        }

        if (!Validator.email(email)) {
            showError('regEmail', 'Please enter a valid email');
            hasError = true;
        }

        if (!Validator.phone(phone)) {
            showError('phone', 'Please enter a valid phone number');
            hasError = true;
        }

        if (!Validator.password(password)) {
            showError('regPassword', 'Password must be at least 8 characters');
            hasError = true;
        }

        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            hasError = true;
        }

        if (!agreeTerms) {
            Toast.error('Please agree to the Terms of Service');
            hasError = true;
        }

        if (hasError) return;

        const btn = document.getElementById('btn-register');
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');
        const btnArrow = btn.querySelector('.btn-arrow');

        btnText.textContent = 'Creating account...';
        btnLoader.classList.remove('hidden');
        btnArrow.style.display = 'none';
        btn.disabled = true;

        try {
            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: fullName,
                    email: email,
                    password: password,
                    mobile: countryCode + phone
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            localStorage.setItem('safeher_user', JSON.stringify(data.user));

            Toast.success('Account created successfully! Welcome to SafeHer ❤️');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            Toast.error(error.message || 'Could not connect to SafeHer server');

            btnText.textContent = 'Create Account';
            btnLoader.classList.add('hidden');
            btnArrow.style.display = '';
            btn.disabled = false;
        }
    });
}
/**
 * Initialize everything
 */
document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggle();
  setupInputValidation();
  setupPasswordStrength();
  setupMultiStepForm();
  setupLoginForm();
  setupRegisterForm();

  console.log('🔐 SafeHer Auth Page Initialized');
});