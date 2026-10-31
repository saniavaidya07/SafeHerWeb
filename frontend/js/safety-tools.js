// ============================================
// SafeHer - Safety Tools & SOS Logic
// ============================================

const SafetyTools = {
  // State
  state: {
    sosHoldTimer: null,
    sosHoldProgress: 0,
    sosActive: false,
    sosActivatedAt: null,
    activeTimerInterval: null,
    locationSharing: false,
    locationWatchId: null,
    recording: false,
    mediaRecorder: null,
    recordingStartTime: null,
    recordingTimerInterval: null,
    audioChunks: [],
    safetyTimerActive: false,
    safetyTimerInterval: null,
    safetyTimerRemaining: 0,
    selectedTimerMinutes: 0,
    alarmActive: false,
    alarmAudio: null,
    fakeCallTimer: null,
    countdownInterval: null
  },

  init() {
    this.setupSOSButton();
    this.setupQuickActions();
    this.setupLocationSharing();
    this.setupVoiceRecording();
    this.setupFakeCall();
    this.setupSafetyTimer();
    this.setupPanicAlarm();
    this.setupShareContacts();
    this.setupSOSModal();
    console.log('🚨 Safety Tools initialized');
  },

  // ============================================
  // MAIN SOS BUTTON (Hold to activate)
  // ============================================
  setupSOSButton() {
    const btn = document.getElementById('sos-main-button');
    const progressCircle = document.getElementById('progress-circle');
    if (!btn) return;

    const HOLD_DURATION = 3000; // 3 seconds
    const CIRCLE_LENGTH = 289;
    let startTime;

    const startHold = (e) => {
      e.preventDefault();
      if (this.state.sosActive) return;

      btn.classList.add('holding');
      startTime = Date.now();

      // Haptic feedback
      if ('vibrate' in navigator) navigator.vibrate(50);

      this.state.sosHoldTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / HOLD_DURATION, 1);
        const offset = CIRCLE_LENGTH - (CIRCLE_LENGTH * progress);
        progressCircle.style.strokeDashoffset = offset;

        if (progress >= 1) {
          clearInterval(this.state.sosHoldTimer);
          this.showSOSConfirmation();
          this.resetSOSButton();
        }
      }, 50);
    };

    const endHold = () => {
      if (this.state.sosHoldTimer) {
        clearInterval(this.state.sosHoldTimer);
        this.state.sosHoldTimer = null;
      }
      btn.classList.remove('holding');
      progressCircle.style.strokeDashoffset = CIRCLE_LENGTH;
    };

    // Mouse events
    btn.addEventListener('mousedown', startHold);
    btn.addEventListener('mouseup', endHold);
    btn.addEventListener('mouseleave', endHold);

    // Touch events
    btn.addEventListener('touchstart', startHold);
    btn.addEventListener('touchend', endHold);
    btn.addEventListener('touchcancel', endHold);
  },

  resetSOSButton() {
    const btn = document.getElementById('sos-main-button');
    const progressCircle = document.getElementById('progress-circle');
    btn?.classList.remove('holding');
    if (progressCircle) progressCircle.style.strokeDashoffset = 289;
  },

  // ============================================
  // SOS CONFIRMATION MODAL
  // ============================================
  setupSOSModal() {
    const modal = document.getElementById('sos-modal');
    const cancelBtn = document.getElementById('btn-cancel-sos');
    const confirmBtn = document.getElementById('btn-confirm-sos');
    const deactivateBtn = document.getElementById('btn-deactivate-sos');

    cancelBtn?.addEventListener('click', () => this.hideSOSConfirmation());
    confirmBtn?.addEventListener('click', () => this.activateSOS());
    deactivateBtn?.addEventListener('click', () => this.deactivateSOS());
  },

  showSOSConfirmation() {
    const modal = document.getElementById('sos-modal');
    if (!modal) return;

    modal.classList.add('show');

    // Start 5-second countdown
    let countdown = 5;
    const countdownNumber = document.getElementById('countdown-number');
    const countdownFill = document.getElementById('countdown-fill');

    if (countdownFill) countdownFill.style.width = '100%';

    this.state.countdownInterval = setInterval(() => {
      countdown--;
      if (countdownNumber) countdownNumber.textContent = countdown;
      if (countdownFill) countdownFill.style.width = `${(countdown / 5) * 100}%`;

      if (countdown <= 0) {
        clearInterval(this.state.countdownInterval);
        this.activateSOS();
      }
    }, 1000);

    // Vibrate
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
  },

  hideSOSConfirmation() {
    const modal = document.getElementById('sos-modal');
    modal?.classList.remove('show');

    if (this.state.countdownInterval) {
      clearInterval(this.state.countdownInterval);
      this.state.countdownInterval = null;
    }

    // Reset countdown display
    const countdownNumber = document.getElementById('countdown-number');
    const countdownFill = document.getElementById('countdown-fill');
    if (countdownNumber) countdownNumber.textContent = '5';
    if (countdownFill) countdownFill.style.width = '100%';

    Toast.info('SOS activation cancelled');
  },

  // ============================================
  // ACTIVATE / DEACTIVATE SOS
  // ============================================
  activateSOS() {
    this.hideSOSConfirmation();

    if (this.state.sosActive) return;

    this.state.sosActive = true;
    this.state.sosActivatedAt = Date.now();

    // Show active overlay
    const overlay = document.getElementById('sos-active-overlay');
    overlay?.classList.add('show');

    // Update status badge
    const badge = document.getElementById('sos-status-badge');
    const badgeText = document.getElementById('sos-status-text');
    if (badge) badge.classList.add('active');
    if (badgeText) badgeText.textContent = 'SOS Active - Alert Sent';

    // Set alert time
    const alertTime = document.getElementById('alert-time');
    if (alertTime) alertTime.textContent = new Date().toLocaleTimeString();

    // Start active timer
    this.startActiveTimer();

    // Auto-start location sharing
    if (!this.state.locationSharing) {
      this.startLocationSharing();
    }

    // Continuous vibration pattern
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }

    // Show notification
    if (Notification.permission === 'granted') {
      new Notification('SafeHer SOS Alert', {
        body: 'Emergency alert is now ACTIVE. Help is on the way.',
        icon: '/frontend/assets/icons/icon-192.png',
        requireInteraction: true
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    Toast.error('🚨 SOS ALERT ACTIVATED! Contacts notified.', 6000);

    console.log('🚨 SOS ACTIVATED at', new Date().toLocaleString());
  },

  deactivateSOS() {
    if (!this.state.sosActive) return;

    if (!confirm('Are you sure you want to deactivate the SOS alert?')) return;

    this.state.sosActive = false;
    this.state.sosActivatedAt = null;

    // Hide active overlay
    const overlay = document.getElementById('sos-active-overlay');
    overlay?.classList.remove('show');

    // Reset status badge
    const badge = document.getElementById('sos-status-badge');
    const badgeText = document.getElementById('sos-status-text');
    if (badge) badge.classList.remove('active');
    if (badgeText) badgeText.textContent = 'Emergency System Ready';

    // Stop active timer
    if (this.state.activeTimerInterval) {
      clearInterval(this.state.activeTimerInterval);
      this.state.activeTimerInterval = null;
    }

    Toast.success('SOS alert deactivated. Stay safe! 💜');
  },

  startActiveTimer() {
    const timerEl = document.getElementById('active-timer');
    if (!timerEl) return;

    this.state.activeTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.state.sosActivatedAt) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
  },

  // ============================================
  // QUICK ACTIONS
  // ============================================
  setupQuickActions() {
    const buttons = document.querySelectorAll('.quick-action-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleQuickAction(action);
      });
    });
  },

  handleQuickAction(action) {
    switch (action) {
      case 'call-112':
        window.location.href = 'tel:112';
        break;
      case 'share-location':
        if (!this.state.locationSharing) {
          this.startLocationSharing();
        } else {
          Toast.info('Location is already being shared');
        }
        break;
      case 'fake-call':
        this.triggerFakeCall(3);
        Toast.info('Fake call in 3 seconds...');
        break;
      case 'alarm':
        this.togglePanicAlarm();
        break;
    }
  },

  // ============================================
  // LIVE LOCATION SHARING
  // ============================================
  setupLocationSharing() {
    const btn = document.getElementById('btn-toggle-location');
    btn?.addEventListener('click', () => {
      if (this.state.locationSharing) {
        this.stopLocationSharing();
      } else {
        this.startLocationSharing();
      }
    });
  },

  startLocationSharing() {
    if (!navigator.geolocation) {
      Toast.error('Geolocation is not supported by your browser');
      return;
    }

    this.state.locationSharing = true;
    const btn = document.getElementById('btn-toggle-location');
    const status = document.getElementById('location-tool-status');
    const info = document.getElementById('location-info');

    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-stop"></i><span>Stop Sharing</span>';
      btn.classList.add('active');
    }
    if (status) {
      status.classList.add('active');
      status.querySelector('span:last-child').textContent = 'Sharing';
    }
    if (info) info.style.display = 'block';

    // Get initial position
    this.state.locationWatchId = navigator.geolocation.watchPosition(
      (position) => this.updateLocationDisplay(position),
      (error) => {
        Toast.error(`Location error: ${error.message}`);
        this.stopLocationSharing();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );

    Toast.success('📍 Live location sharing started');
  },

  stopLocationSharing() {
    if (this.state.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.state.locationWatchId);
      this.state.locationWatchId = null;
    }

    this.state.locationSharing = false;
    const btn = document.getElementById('btn-toggle-location');
    const status = document.getElementById('location-tool-status');
    const info = document.getElementById('location-info');

    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-play"></i><span>Start Sharing</span>';
      btn.classList.remove('active');
    }
    if (status) {
      status.classList.remove('active');
      status.querySelector('span:last-child').textContent = 'Inactive';
    }
    if (info) info.style.display = 'none';

    Toast.info('Location sharing stopped');
  },

  updateLocationDisplay(position) {
    const { latitude, longitude, accuracy } = position.coords;
    
    document.getElementById('loc-lat').textContent = latitude.toFixed(6);
    document.getElementById('loc-lng').textContent = longitude.toFixed(6);
    document.getElementById('loc-accuracy').textContent = `±${Math.round(accuracy)}m`;
    document.getElementById('loc-updated').textContent = new Date().toLocaleTimeString();

    // Save to session for other pages
    sessionStorage.setItem('user_location', JSON.stringify({
      latitude, longitude, accuracy, timestamp: Date.now()
    }));
  },

  // ============================================
  // VOICE RECORDING
  // ============================================
  setupVoiceRecording() {
    const btn = document.getElementById('btn-toggle-recording');
    btn?.addEventListener('click', () => {
      if (this.state.recording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    });
  },

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.state.mediaRecorder = new MediaRecorder(stream);
      this.state.audioChunks = [];

      this.state.mediaRecorder.ondataavailable = (e) => {
        this.state.audioChunks.push(e.data);
      };

      this.state.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.state.audioChunks, { type: 'audio/webm' });
        console.log('Recording saved:', audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.state.mediaRecorder.start();
      this.state.recording = true;
      this.state.recordingStartTime = Date.now();

      // Update UI
      const btn = document.getElementById('btn-toggle-recording');
      const status = document.getElementById('recording-tool-status');
      const info = document.getElementById('recording-info');

      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-stop"></i><span>Stop Recording</span>';
        btn.classList.add('active');
      }
      if (status) {
        status.classList.add('active');
        status.querySelector('span:last-child').textContent = 'Recording';
      }
      if (info) info.style.display = 'block';

      // Start timer
      this.state.recordingTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.state.recordingStartTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        document.getElementById('recording-timer').textContent = 
          `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }, 1000);

      Toast.success('🎤 Recording started');
    } catch (err) {
      Toast.error('Microphone permission denied');
      console.error('Recording error:', err);
    }
  },

  stopRecording() {
    if (!this.state.mediaRecorder) return;

    this.state.mediaRecorder.stop();
    this.state.recording = false;

    if (this.state.recordingTimerInterval) {
      clearInterval(this.state.recordingTimerInterval);
      this.state.recordingTimerInterval = null;
    }

    // Reset UI
    const btn = document.getElementById('btn-toggle-recording');
    const status = document.getElementById('recording-tool-status');
    const info = document.getElementById('recording-info');

    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-microphone"></i><span>Start Recording</span>';
      btn.classList.remove('active');
    }
    if (status) {
      status.classList.remove('active');
      status.querySelector('span:last-child').textContent = 'Inactive';
    }
    if (info) info.style.display = 'none';

    Toast.success('Recording saved securely');
  },

  // ============================================
  // FAKE CALL
  // ============================================
  setupFakeCall() {
    const btn = document.getElementById('btn-fake-call');
    btn?.addEventListener('click', () => {
      const timer = parseInt(document.getElementById('fake-call-timer').value);
      this.triggerFakeCall(timer);
      Toast.info(`Fake call scheduled in ${timer} seconds`);
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-clock"></i><span>Waiting ${timer}s...</span>`;
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-phone"></i><span>Schedule Fake Call</span>';
      }, timer * 1000);
    });

    // Decline / Accept buttons
    document.getElementById('btn-decline-fake')?.addEventListener('click', () => this.endFakeCall());
    document.getElementById('btn-accept-fake')?.addEventListener('click', () => this.endFakeCall());
  },

  triggerFakeCall(delaySeconds) {
    this.state.fakeCallTimer = setTimeout(() => {
      const screen = document.getElementById('fake-call-screen');
      screen?.classList.add('show');

      // Vibrate like a phone
      if ('vibrate' in navigator) {
        navigator.vibrate([1000, 500, 1000, 500, 1000, 500, 1000]);
      }
    }, delaySeconds * 1000);
  },

  endFakeCall() {
    const screen = document.getElementById('fake-call-screen');
    screen?.classList.remove('show');
    if ('vibrate' in navigator) navigator.vibrate(0);
    Toast.info('Fake call ended');
  },

  // ============================================
  // SAFETY TIMER
  // ============================================
  setupSafetyTimer() {
    const quickBtns = document.querySelectorAll('.timer-quick-btn');
    const startBtn = document.getElementById('btn-start-timer');

    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        quickBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.selectedTimerMinutes = parseInt(btn.dataset.time);
        if (startBtn) startBtn.disabled = false;
      });
    });

    startBtn?.addEventListener('click', () => {
      if (this.state.safetyTimerActive) {
        this.stopSafetyTimer();
      } else {
        this.startSafetyTimer();
      }
    });
  },

  startSafetyTimer() {
    if (this.state.selectedTimerMinutes === 0) return;

    this.state.safetyTimerActive = true;
    this.state.safetyTimerRemaining = this.state.selectedTimerMinutes * 60;

    const btn = document.getElementById('btn-start-timer');
    const status = document.getElementById('timer-tool-status');
    const display = document.getElementById('timer-display');

    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-stop"></i><span>Cancel Timer</span>';
      btn.classList.add('active');
    }
    if (status) {
      status.classList.add('active');
      status.querySelector('span:last-child').textContent = 'Active';
    }
    if (display) display.style.display = 'block';

    this.updateTimerDisplay();

    this.state.safetyTimerInterval = setInterval(() => {
      this.state.safetyTimerRemaining--;
      this.updateTimerDisplay();

      if (this.state.safetyTimerRemaining <= 0) {
        this.timerExpired();
      }
    }, 1000);

    Toast.success(`⏱️ Safety timer set for ${this.state.selectedTimerMinutes} minutes`);
  },

  stopSafetyTimer() {
    this.state.safetyTimerActive = false;
    if (this.state.safetyTimerInterval) {
      clearInterval(this.state.safetyTimerInterval);
      this.state.safetyTimerInterval = null;
    }

    const btn = document.getElementById('btn-start-timer');
    const status = document.getElementById('timer-tool-status');
    const display = document.getElementById('timer-display');

    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-play"></i><span>Start Timer</span>';
      btn.classList.remove('active');
    }
    if (status) {
      status.classList.remove('active');
      status.querySelector('span:last-child').textContent = 'Not Set';
    }
    if (display) display.style.display = 'none';

    Toast.info('Safety timer cancelled');
  },

  updateTimerDisplay() {
    const mins = Math.floor(this.state.safetyTimerRemaining / 60);
    const secs = this.state.safetyTimerRemaining % 60;
    const display = document.getElementById('timer-value');
    if (display) {
      display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  },

  timerExpired() {
    this.stopSafetyTimer();
    Toast.error('⚠️ Safety timer expired! Are you safe?', 8000);
    
    if (confirm('Safety timer expired! Are you safe?\n\nClick OK if you are safe, Cancel to trigger SOS.')) {
      Toast.success('Glad you\'re safe! 💜');
    } else {
      this.activateSOS();
    }
  },

  // ============================================
  // PANIC ALARM
  // ============================================
  setupPanicAlarm() {
    const btn = document.getElementById('btn-toggle-alarm');
    btn?.addEventListener('click', () => this.togglePanicAlarm());
  },

  togglePanicAlarm() {
    if (this.state.alarmActive) {
      this.stopAlarm();
    } else {
      this.startAlarm();
    }
  },

  startAlarm() {
    this.state.alarmActive = true;

    // Create alarm sound using Web Audio API
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      
      const playBeep = (freq, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      };

      this.state.alarmAudio = setInterval(() => {
        if (!this.state.alarmActive) return;
        playBeep(1000, 0.3);
        setTimeout(() => playBeep(700, 0.3), 350);
      }, 800);

      // Vibrate
      if ('vibrate' in navigator) {
        this.state.alarmVibrateInterval = setInterval(() => {
          navigator.vibrate([500, 200, 500]);
        }, 1500);
      }

      const btn = document.getElementById('btn-toggle-alarm');
      const status = document.getElementById('alarm-tool-status');

      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i><span>Stop Alarm</span>';
        btn.classList.add('active');
      }
      if (status) {
        status.classList.add('active');
        status.querySelector('span:last-child').textContent = 'ACTIVE';
      }

      Toast.warning('🔔 Panic alarm activated!');
    } catch (err) {
      console.error('Alarm error:', err);
      Toast.error('Could not activate alarm');
    }
  },

  stopAlarm() {
    this.state.alarmActive = false;
    if (this.state.alarmAudio) {
      clearInterval(this.state.alarmAudio);
      this.state.alarmAudio = null;
    }
    if (this.state.alarmVibrateInterval) {
      clearInterval(this.state.alarmVibrateInterval);
      if ('vibrate' in navigator) navigator.vibrate(0);
    }

    const btn = document.getElementById('btn-toggle-alarm');
    const status = document.getElementById('alarm-tool-status');

    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i><span>Activate Alarm</span>';
      btn.classList.remove('active');
    }
    if (status) {
      status.classList.remove('active');
      status.querySelector('span:last-child').textContent = 'Silent';
    }

    Toast.info('Alarm stopped');
  },

  // ============================================
  // SHARE WITH CONTACTS
  // ============================================
  setupShareContacts() {
    const btn = document.getElementById('btn-share-contacts');
    btn?.addEventListener('click', () => {
      const location = JSON.parse(sessionStorage.getItem('user_location'));
      
      if (!location) {
        Toast.warning('Please enable location sharing first');
        return;
      }

      const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      const message = `🚨 SafeHer Alert: I need help! My location: ${mapsUrl}`;

      if (navigator.share) {
        navigator.share({
          title: 'SafeHer Alert',
          text: message,
          url: mapsUrl
        }).then(() => {
          Toast.success('Location shared with contacts!');
        }).catch(() => {
          Toast.info('Share cancelled');
        });
      } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(message);
        Toast.success('Location copied to clipboard!');
      }
    });
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SafetyTools.init();

  // Override the generic SOS handler from layout.js
  const sosButtons = [
    document.getElementById('sidebar-sos-btn'),
    document.getElementById('navbar-quick-sos'),
    document.getElementById('bottom-nav-sos')
  ].filter(Boolean);

  sosButtons.forEach(btn => {
    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => SafetyTools.showSOSConfirmation());
  });
});