// ============================================
// SafeHer - Report Incident Logic
// ============================================

const ReportIncident = {
  state: {
    currentStep: 1,
    incidentType: null,
    severity: null,
    uploadedFiles: [],
    locationData: null,
    maxFiles: 5,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },

  init() {
    this.setupIncidentTypes();
    this.setupSeverity();
    this.setupStepNavigation();
    this.setupDescription();
    this.setupDateTime();
    this.setupLocation();
    this.setupFileUpload();
    this.setupFormSubmit();
    this.setupInfoBanner();
    this.setupSideSOS();
    console.log('📝 Report Incident initialized');
  },

  // ============================================
  // INCIDENT TYPE SELECTION
  // ============================================
  setupIncidentTypes() {
    const cards = document.querySelectorAll('.incident-type-card input');
    cards.forEach(input => {
      input.addEventListener('change', () => {
        this.state.incidentType = input.value;
      });
    });
  },

  // ============================================
  // SEVERITY SELECTION
  // ============================================
  setupSeverity() {
    const options = document.querySelectorAll('.severity-option input');
    options.forEach(input => {
      input.addEventListener('change', () => {
        this.state.severity = input.value;
      });
    });
  },

  // ============================================
  // STEP NAVIGATION
  // ============================================
  setupStepNavigation() {
    document.getElementById('btn-to-step-2')?.addEventListener('click', () => {
      if (!this.state.incidentType) {
        Toast.error('Please select an incident type');
        return;
      }
      if (!this.state.severity) {
        Toast.error('Please select severity level');
        return;
      }
      this.goToStep(2);
    });

    document.getElementById('btn-to-step-3')?.addEventListener('click', () => {
      if (!this.validateStep2()) return;
      this.populateReview();
      this.goToStep(3);
    });

    document.getElementById('btn-to-step-1')?.addEventListener('click', () => {
      this.goToStep(1);
    });

    document.getElementById('btn-to-step-2-back')?.addEventListener('click', () => {
      this.goToStep(2);
    });
  },

  goToStep(step) {
    this.state.currentStep = step;

    // Update step panels
    document.querySelectorAll('.form-step-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`panel-${step}`)?.classList.add('active');

    // Update step indicators
    document.querySelectorAll('.report-step').forEach(s => {
      const stepNum = parseInt(s.dataset.step);
      s.classList.remove('active', 'completed');
      if (stepNum < step) s.classList.add('completed');
      else if (stepNum === step) s.classList.add('active');
    });

    // Update connectors
    const connectors = document.querySelectorAll('.step-connector');
    connectors.forEach((c, index) => {
      if (index < step - 1) {
        c.style.background = 'var(--gradient-primary)';
      } else {
        c.style.background = 'var(--color-dark-3)';
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ============================================
  // DESCRIPTION (character counter)
  // ============================================
  setupDescription() {
    const textarea = document.getElementById('description');
    const counter = document.getElementById('char-count');

    textarea?.addEventListener('input', () => {
      const length = textarea.value.length;
      if (counter) counter.textContent = length;

      // Change color based on length
      if (length > 1800) {
        counter.style.color = 'var(--color-emergency)';
      } else if (length > 1500) {
        counter.style.color = 'var(--color-warning)';
      } else {
        counter.style.color = 'var(--color-gray)';
      }
    });
  },

  // ============================================
  // DATE & TIME (set defaults to today/now)
  // ============================================
  setupDateTime() {
    const dateInput = document.getElementById('incident-date');
    const timeInput = document.getElementById('incident-time');

    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
      dateInput.max = today; // Can't report future incidents
    }

    if (timeInput) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      timeInput.value = `${hours}:${mins}`;
    }
  },

  // ============================================
  // LOCATION DETECTION
  // ============================================
  setupLocation() {
    const detectBtn = document.getElementById('btn-detect-location');
    const removeBtn = document.getElementById('btn-remove-location');

    detectBtn?.addEventListener('click', () => this.detectLocation());
    removeBtn?.addEventListener('click', () => this.removeLocation());
  },

  detectLocation() {
    const detectBtn = document.getElementById('btn-detect-location');
    if (!navigator.geolocation) {
      Toast.error('Geolocation not supported by your browser');
      return;
    }

    // Show loading
    detectBtn.disabled = true;
    detectBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Detecting...</span>';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.state.locationData = { latitude, longitude };

        // Update UI
        const preview = document.getElementById('location-preview');
        const coords = document.getElementById('loc-coords');
        const address = document.getElementById('loc-address');
        const input = document.getElementById('incident-location');

        if (coords) coords.textContent = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        if (address) address.textContent = 'Fetching address...';
        if (preview) preview.style.display = 'flex';
        if (input) input.value = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;

        // Try to fetch address via reverse geocoding (using free Nominatim API)
        this.reverseGeocode(latitude, longitude);

        detectBtn.disabled = false;
        detectBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>Detected</span>';
        setTimeout(() => {
          detectBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i><span>Detect Again</span>';
        }, 2000);

        Toast.success('Location detected successfully');
      },
      (error) => {
        detectBtn.disabled = false;
        detectBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i><span>Detect</span>';
        Toast.error('Could not detect location. Please allow permission.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  },

  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'User-Agent': 'SafeHer/1.0' } }
      );
      const data = await response.json();
      const address = document.getElementById('loc-address');
      const input = document.getElementById('incident-location');
      
      if (data.display_name) {
        if (address) address.textContent = data.display_name;
        if (input) input.value = data.display_name;
      }
    } catch (err) {
      console.log('Reverse geocode failed:', err);
    }
  },

  removeLocation() {
    this.state.locationData = null;
    document.getElementById('location-preview').style.display = 'none';
    document.getElementById('incident-location').value = '';
    Toast.info('Location removed');
  },

  // ============================================
  // FILE UPLOAD (Drag & Drop)
  // ============================================
  setupFileUpload() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');

    if (!uploadZone || !fileInput) return;

    // Click to browse
    uploadZone.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });

    // Drag & drop events
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });
  },

  handleFiles(files) {
    Array.from(files).forEach(file => {
      // Check max files
      if (this.state.uploadedFiles.length >= this.state.maxFiles) {
        Toast.warning(`Maximum ${this.state.maxFiles} files allowed`);
        return;
      }

      // Check file size
      if (file.size > this.state.maxFileSize) {
        Toast.error(`${file.name} is too large (max 10MB)`);
        return;
      }

      // Check file type
      const validTypes = ['image/', 'video/', 'audio/'];
      const isValid = validTypes.some(type => file.type.startsWith(type));
      if (!isValid) {
        Toast.error(`${file.name} is not a supported file type`);
        return;
      }

      // Add file
      const fileObj = {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type
      };
      this.state.uploadedFiles.push(fileObj);
      this.renderFile(fileObj);
    });
  },

  renderFile(fileObj) {
    const container = document.getElementById('uploaded-files');
    if (!container) return;

    const fileType = fileObj.type.startsWith('image/') ? 'image' 
                   : fileObj.type.startsWith('video/') ? 'video'
                   : fileObj.type.startsWith('audio/') ? 'audio' : 'other';

    const icons = {
      image: 'fa-image',
      video: 'fa-video',
      audio: 'fa-music',
      other: 'fa-file'
    };

    const fileEl = document.createElement('div');
    fileEl.className = 'uploaded-file';
    fileEl.dataset.id = fileObj.id;
    fileEl.innerHTML = `
      <div class="uploaded-file-icon type-${fileType}">
        <i class="fa-solid ${icons[fileType]}"></i>
      </div>
      <div class="uploaded-file-info">
        <p class="uploaded-file-name">${fileObj.name}</p>
        <p class="uploaded-file-size">${this.formatFileSize(fileObj.size)} • ${fileType}</p>
      </div>
      <button class="uploaded-file-remove" data-id="${fileObj.id}">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    container.appendChild(fileEl);

    // Remove button
    fileEl.querySelector('.uploaded-file-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeFile(fileObj.id);
    });
  },

  removeFile(id) {
    this.state.uploadedFiles = this.state.uploadedFiles.filter(f => f.id !== id);
    document.querySelector(`.uploaded-file[data-id="${id}"]`)?.remove();
    Toast.info('File removed');
  },

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  },

  // ============================================
  // STEP 2 VALIDATION
  // ============================================
  validateStep2() {
    const description = document.getElementById('description').value.trim();
    const date = document.getElementById('incident-date').value;
    const time = document.getElementById('incident-time').value;
    const location = document.getElementById('incident-location').value.trim();
    const consent = document.getElementById('consent').checked;

    if (!description || description.length < 20) {
      Toast.error('Please provide a description (at least 20 characters)');
      document.getElementById('description').focus();
      return false;
    }

    if (!date) {
      Toast.error('Please select the incident date');
      return false;
    }

    if (!time) {
      Toast.error('Please select the incident time');
      return false;
    }

    if (!location) {
      Toast.error('Please provide the location');
      return false;
    }

    if (!consent) {
      Toast.error('Please confirm the information is accurate');
      return false;
    }

    return true;
  },

  // ============================================
  // REVIEW POPULATION
  // ============================================
  populateReview() {
    const typeNames = {
      harassment: 'Harassment',
      stalking: 'Stalking',
      unsafe_transport: 'Unsafe Transport',
      threat: 'Threat',
      suspicious: 'Suspicious Activity',
      domestic: 'Domestic Concern',
      cyber: 'Cyber Crime',
      other: 'Other'
    };

    const severityNames = {
      low: '🟢 Low',
      medium: '🟡 Medium',
      high: '🟣 High',
      critical: '🔴 Critical'
    };

    document.getElementById('review-type').textContent = typeNames[this.state.incidentType] || '--';
    document.getElementById('review-severity').textContent = severityNames[this.state.severity] || '--';
    document.getElementById('review-desc').textContent = document.getElementById('description').value;

    const date = document.getElementById('incident-date').value;
    const time = document.getElementById('incident-time').value;
    document.getElementById('review-datetime').textContent = 
      `${new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${time}`;

    document.getElementById('review-location').textContent = 
      document.getElementById('incident-location').value;

    // Evidence
    const evidenceCount = this.state.uploadedFiles.length;
    document.getElementById('review-evidence').textContent = 
      evidenceCount === 0 ? 'No files attached' : `${evidenceCount} file(s) attached`;

    // Anonymous
    const anonymous = document.getElementById('anonymous').checked;
    document.getElementById('review-anonymous').textContent = anonymous ? 'Yes' : 'No';
  },

  // ============================================
  // FORM SUBMIT
  // ============================================
  setupFormSubmit() {
    const form = document.getElementById('report-form');
    const btn = document.getElementById('btn-submit-report');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitReport();
    });
  },

  submitReport() {
    const btn = document.getElementById('btn-submit-report');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    const btnArrow = btn.querySelector('.btn-arrow');

    // Show loading
    btnText.textContent = 'Submitting...';
    btnLoader.classList.remove('hidden');
    btnArrow.style.display = 'none';
    btn.disabled = true;

    // Simulate API call
    setTimeout(() => {
      // Generate report ID
      const reportId = `#RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

      // Save to localStorage (temp until backend)
      const reports = JSON.parse(localStorage.getItem('safeher_reports') || '[]');
      reports.unshift({
        id: reportId,
        type: this.state.incidentType,
        severity: this.state.severity,
        description: document.getElementById('description').value,
        date: document.getElementById('incident-date').value,
        time: document.getElementById('incident-time').value,
        location: document.getElementById('incident-location').value,
        anonymous: document.getElementById('anonymous').checked,
        filesCount: this.state.uploadedFiles.length,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('safeher_reports', JSON.stringify(reports));

      // Show success modal
      document.getElementById('new-report-id').textContent = reportId;
      document.getElementById('success-modal').classList.add('show');

      // Reset button
      btnText.textContent = 'Submit Report';
      btnLoader.classList.add('hidden');
      btnArrow.style.display = 'block';
      btn.disabled = false;

    }, 2000);
  },

  // ============================================
  // INFO BANNER
  // ============================================
  setupInfoBanner() {
    document.getElementById('info-banner-close')?.addEventListener('click', () => {
      document.querySelector('.info-banner').style.display = 'none';
    });
  },

  // ============================================
  // SIDE SOS BUTTON
  // ============================================
  setupSideSOS() {
    document.getElementById('btn-emergency-sos-side')?.addEventListener('click', () => {
      window.location.href = 'safety-tools.html';
    });
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  ReportIncident.init();

  // Handle "View Report" in success modal
  document.getElementById('btn-view-report')?.addEventListener('click', () => {
    Toast.info('Report tracking will be available in Phase F12');
    document.getElementById('success-modal').classList.remove('show');
    // Reset form
    document.getElementById('report-form').reset();
    ReportIncident.state = {
      currentStep: 1,
      incidentType: null,
      severity: null,
      uploadedFiles: [],
      locationData: null,
      maxFiles: 5,
      maxFileSize: 10 * 1024 * 1024
    };
    document.getElementById('uploaded-files').innerHTML = '';
    ReportIncident.goToStep(1);
  });
});