// ============================================
// SafeHer - Toast Notification System
// ============================================

const Toast = {
  container: null,

  /**
   * Initialize toast container
   */
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in ms (default 4000)
   */
  show(message, type = 'info', duration = 4000) {
    if (!this.container) this.init();

    const icons = {
      success: 'fa-circle-check',
      error: 'fa-circle-xmark',
      warning: 'fa-triangle-exclamation',
      info: 'fa-circle-info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fa-solid ${icons[type]}"></i>
      </div>
      <div class="toast-content">
        <p class="toast-message">${message}</p>
      </div>
      <button class="toast-close" aria-label="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="toast-progress"></div>
    `;

    this.container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));

    // Auto remove after duration
    const progressBar = toast.querySelector('.toast-progress');
    progressBar.style.animationDuration = `${duration}ms`;

    setTimeout(() => this.remove(toast), duration);
  },

  /**
   * Remove a toast with animation
   */
  remove(toast) {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  },

  // Shortcut methods
  success(message, duration) { this.show(message, 'success', duration); },
  error(message, duration) { this.show(message, 'error', duration); },
  warning(message, duration) { this.show(message, 'warning', duration); },
  info(message, duration) { this.show(message, 'info', duration); }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => Toast.init());

// Toast Styles (injected dynamically)
const toastStyles = document.createElement('style');
toastStyles.textContent = `
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  color: white;
  min-width: 320px;
  transform: translateX(400px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  pointer-events: auto;
  position: relative;
  overflow: hidden;
}

.toast.show {
  transform: translateX(0);
  opacity: 1;
}

.toast.hide {
  transform: translateX(400px);
  opacity: 0;
}

.toast-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.toast-success .toast-icon { background: rgba(16, 185, 129, 0.2); color: #10B981; }
.toast-error .toast-icon { background: rgba(239, 68, 68, 0.2); color: #EF4444; }
.toast-warning .toast-icon { background: rgba(245, 158, 11, 0.2); color: #F59E0B; }
.toast-info .toast-icon { background: rgba(59, 130, 246, 0.2); color: #3B82F6; }

.toast-content {
  flex: 1;
}

.toast-message {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: none;
  color: #64748B;
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
  transition: color 0.2s;
}

.toast-close:hover {
  color: white;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  animation: toastProgress linear forwards;
}

.toast-success .toast-progress { background: #10B981; }
.toast-error .toast-progress { background: #EF4444; }
.toast-warning .toast-progress { background: #F59E0B; }
.toast-info .toast-progress { background: #3B82F6; }

@keyframes toastProgress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

@media (max-width: 640px) {
  .toast-container {
    left: 10px;
    right: 10px;
    top: 10px;
    max-width: none;
  }

  .toast {
    min-width: auto;
    width: 100%;
  }
}
`;
document.head.appendChild(toastStyles);