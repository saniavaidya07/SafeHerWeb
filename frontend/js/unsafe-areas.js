// ============================================
// SafeHer - Unsafe Areas Logic
// ============================================

const UnsafeAreas = {
  state: {
    map: null,
    miniMap: null,
    userLocation: null,
    markers: [],
    heatmapCircles: [],
    areas: [],
    filteredAreas: [],
    filters: {
      severity: 'all',
      status: 'all',
      time: 'all',
      distance: 10
    },
    viewMode: 'markers', // markers or heatmap
    selectedArea: null,
    reportLocation: null,
    reportMarker: null
  },

  init() {
    this.initMap();
    this.detectLocation();
    this.setupFilters();
    this.setupViewToggle();
    this.setupMapControls();
    this.setupReportButton();
    this.setupModals();
    this.setupReportForm();
    console.log('⚠️ Unsafe Areas initialized');
  },

  // ============================================
  // INIT MAP
  // ============================================
  initMap() {
    const defaultCenter = [12.9716, 77.5946]; // Bangalore

    this.state.map = L.map('unsafe-map', {
      zoomControl: true
    }).setView(defaultCenter, 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.state.map);
  },

  // ============================================
  // DETECT USER LOCATION
  // ============================================
  detectLocation() {
    if (!navigator.geolocation) {
      this.loadAreas([12.9716, 77.5946]);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.state.userLocation = [latitude, longitude];
        this.state.map.setView([latitude, longitude], 13);

        // Add user marker
        L.circleMarker([latitude, longitude], {
          radius: 8,
          fillColor: '#7C3AED',
          color: 'white',
          weight: 3,
          opacity: 1,
          fillOpacity: 1
        }).addTo(this.state.map).bindPopup('<b>You are here</b>');

        this.loadAreas([latitude, longitude]);
      },
      () => {
        this.loadAreas([12.9716, 77.5946]);
        Toast.warning('Using default location');
      }
    );
  },

  // ============================================
  // LOAD MOCK UNSAFE AREAS
  // ============================================
  loadAreas(center) {
    const [lat, lng] = center;

    // Mock unsafe areas
    const mockAreas = [
      {
        id: 1,
        name: 'MG Road Metro Station',
        location: 'MG Road, Bangalore',
        lat: lat + 0.008,
        lng: lng + 0.012,
        severity: 'critical',
        status: 'verified',
        reports: 24,
        verified: 18,
        issues: ['poor_lighting', 'harassment', 'stalking'],
        unsafeTimes: ['evening', 'night'],
        description: 'Reports of harassment and stalking especially after 9 PM. Poor lighting near exits.',
        reportedAt: '2024-01-15',
        distance: 0
      },
      {
        id: 2,
        name: 'Silk Board Junction',
        location: 'Silk Board, Bangalore',
        lat: lat - 0.015,
        lng: lng + 0.008,
        severity: 'high',
        status: 'verified',
        reports: 18,
        verified: 14,
        issues: ['isolated', 'no_police', 'harassment'],
        unsafeTimes: ['night'],
        description: 'Under-construction area with limited lighting. Multiple reports of unsafe conditions.',
        reportedAt: '2024-01-20',
        distance: 0
      },
      {
        id: 3,
        name: 'Marathahalli Bridge Area',
        location: 'Marathahalli, Bangalore',
        lat: lat + 0.012,
        lng: lng - 0.010,
        severity: 'high',
        status: 'verified',
        reports: 15,
        verified: 10,
        issues: ['poor_lighting', 'isolated', 'theft'],
        unsafeTimes: ['evening', 'night'],
        description: 'Multiple bag-snatching incidents reported. Avoid walking alone at night.',
        reportedAt: '2024-02-01',
        distance: 0
      },
      {
        id: 4,
        name: 'Koramangala Back Roads',
        location: '5th Block, Koramangala',
        lat: lat - 0.008,
        lng: lng - 0.005,
        severity: 'medium',
        status: 'review',
        reports: 12,
        verified: 6,
        issues: ['isolated', 'drugs'],
        unsafeTimes: ['night'],
        description: 'Isolated stretches. Some reports of suspicious activity.',
        reportedAt: '2024-02-10',
        distance: 0
      },
      {
        id: 5,
        name: 'HSR Layout Underpass',
        location: 'HSR Layout, Bangalore',
        lat: lat + 0.005,
        lng: lng - 0.015,
        severity: 'high',
        status: 'reported',
        reports: 10,
        verified: 4,
        issues: ['poor_lighting', 'isolated'],
        unsafeTimes: ['evening', 'night'],
        description: 'Underpass with poor lighting. Take alternative routes at night.',
        reportedAt: '2024-02-12',
        distance: 0
      },
      {
        id: 6,
        name: 'Whitefield Industrial Area',
        location: 'Whitefield, Bangalore',
        lat: lat - 0.020,
        lng: lng - 0.008,
        severity: 'medium',
        status: 'verified',
        reports: 8,
        verified: 6,
        issues: ['no_police', 'isolated'],
        unsafeTimes: ['night'],
        description: 'Industrial area with minimal police presence after office hours.',
        reportedAt: '2024-02-05',
        distance: 0
      },
      {
        id: 7,
        name: 'Bellandur Lake Road',
        location: 'Bellandur, Bangalore',
        lat: lat + 0.018,
        lng: lng + 0.005,
        severity: 'low',
        status: 'resolved',
        reports: 5,
        verified: 3,
        issues: ['poor_lighting'],
        unsafeTimes: ['night'],
        description: 'Previously reported. Street lights have been installed. Situation improved.',
        reportedAt: '2024-01-05',
        distance: 0
      },
      {
        id: 8,
        name: 'Electronic City Phase 2',
        location: 'Electronic City, Bangalore',
        lat: lat - 0.010,
        lng: lng + 0.020,
        severity: 'critical',
        status: 'verified',
        reports: 21,
        verified: 15,
        issues: ['harassment', 'stalking', 'isolated', 'poor_lighting'],
        unsafeTimes: ['evening', 'night'],
        description: 'Multiple recent incidents. Very high risk area, especially after dark.',
        reportedAt: '2024-02-14',
        distance: 0
      }
    ];

    // Calculate distances
    mockAreas.forEach(area => {
      area.distance = this.calculateDistance(lat, lng, area.lat, area.lng);
    });

    this.state.areas = mockAreas;
    this.state.filteredAreas = [...mockAreas];

    this.updateStats();
    this.renderAreas();
    this.renderMapMarkers();
  },

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  // ============================================
  // UPDATE STATS
  // ============================================
  updateStats() {
    document.getElementById('stat-total').textContent = this.state.areas.length;
    document.getElementById('stat-critical').textContent = 
      this.state.areas.filter(a => a.severity === 'critical').length;
    document.getElementById('stat-verified').textContent = 
      this.state.areas.filter(a => a.status === 'verified').length;
  },

  // ============================================
  // RENDER MAP MARKERS
  // ============================================
  renderMapMarkers() {
    // Clear old markers
    this.state.markers.forEach(m => this.state.map.removeLayer(m));
    this.state.heatmapCircles.forEach(c => this.state.map.removeLayer(c));
    this.state.markers = [];
    this.state.heatmapCircles = [];

    if (this.state.viewMode === 'markers') {
      this.state.filteredAreas.forEach(area => {
        const icon = L.divIcon({
          className: 'unsafe-marker',
          html: `<div class="unsafe-marker-dot severity-${area.severity}">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const popupContent = `
          <div>
            <p style="color: white; font-weight: 700; font-size: 0.95rem; margin: 0 0 6px;">${area.name}</p>
            <p style="color: #CBD5E1; font-size: 0.75rem; margin: 0 0 8px;">${area.location}</p>
            <div style="display: flex; gap: 6px; margin-bottom: 8px;">
              <span style="padding: 3px 10px; background: rgba(239, 68, 68, 0.2); color: #EF4444; border-radius: 999px; font-size: 0.7rem; font-weight: 600;">${area.severity.toUpperCase()}</span>
              <span style="padding: 3px 10px; background: rgba(59, 130, 246, 0.15); color: #60A5FA; border-radius: 999px; font-size: 0.7rem;">${area.reports} reports</span>
            </div>
            <button 
              style="padding: 6px 12px; background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; border: none; border-radius: 6px; font-size: 0.8rem; cursor: pointer; width: 100%;"
              onclick="UnsafeAreas.openAreaModal(${area.id})"
            >
              View Details
            </button>
          </div>
        `;

        const marker = L.marker([area.lat, area.lng], { icon })
          .addTo(this.state.map)
          .bindPopup(popupContent);

        this.state.markers.push(marker);
      });
    } else {
      // HEATMAP MODE
      this.state.filteredAreas.forEach(area => {
        const severityColors = {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#EAB308',
          low: '#10B981'
        };

        const radius = 300 + (area.reports * 15);
        const opacity = 0.3 + (area.reports * 0.02);

        // Outer glow
        const outer = L.circle([area.lat, area.lng], {
          radius: radius,
          color: severityColors[area.severity],
          fillColor: severityColors[area.severity],
          fillOpacity: Math.min(opacity * 0.3, 0.4),
          weight: 0,
          className: 'heatmap-circle'
        }).addTo(this.state.map);

        // Middle
        const middle = L.circle([area.lat, area.lng], {
          radius: radius * 0.6,
          color: severityColors[area.severity],
          fillColor: severityColors[area.severity],
          fillOpacity: Math.min(opacity * 0.5, 0.5),
          weight: 0,
          className: 'heatmap-circle'
        }).addTo(this.state.map);

        // Inner hot spot
        const inner = L.circle([area.lat, area.lng], {
          radius: radius * 0.3,
          color: severityColors[area.severity],
          fillColor: severityColors[area.severity],
          fillOpacity: Math.min(opacity * 0.8, 0.7),
          weight: 0,
          className: 'heatmap-circle'
        }).addTo(this.state.map);

        inner.on('click', () => this.openAreaModal(area.id));

        this.state.heatmapCircles.push(outer, middle, inner);
      });
    }
  },

  // ============================================
  // RENDER AREAS LIST
  // ============================================
  renderAreas() {
    const list = document.getElementById('areas-list');
    const emptyState = document.getElementById('areas-empty');
    const count = document.getElementById('results-count');
    
    if (count) count.textContent = this.state.filteredAreas.length;

    if (this.state.filteredAreas.length === 0) {
      list.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    const issueLabels = {
      poor_lighting: 'Poor Lighting',
      isolated: 'Isolated',
      harassment: 'Harassment',
      stalking: 'Stalking',
      theft: 'Theft',
      drugs: 'Drugs',
      no_police: 'No Police',
      crowded: 'Overcrowded'
    };

    list.innerHTML = this.state.filteredAreas.map((area, index) => `
      <div class="area-card severity-${area.severity}" data-id="${area.id}" style="animation-delay: ${index * 0.05}s">
        <div class="area-card-top">
          <p class="area-card-name">${area.name}</p>
          <span class="area-severity-tag severity-${area.severity}">${area.severity}</span>
        </div>
        <p class="area-card-address">
          <i class="fa-solid fa-location-dot"></i> ${area.location}
        </p>
        <div class="area-card-issues">
          ${area.issues.slice(0, 3).map(issue => `
            <span class="mini-issue-tag">${issueLabels[issue] || issue}</span>
          `).join('')}
          ${area.issues.length > 3 ? `<span class="mini-issue-tag">+${area.issues.length - 3}</span>` : ''}
        </div>
        <div class="area-card-footer">
          <div style="display: flex; gap: 10px;">
            <span class="area-footer-item">
              <i class="fa-solid fa-flag"></i> ${area.reports}
            </span>
            <span class="area-footer-item">
              <i class="fa-solid fa-location-arrow"></i> ${area.distance < 1 ? Math.round(area.distance * 1000) + 'm' : area.distance.toFixed(1) + 'km'}
            </span>
          </div>
          <span class="status-badge status-${area.status}">${area.status}</span>
        </div>
      </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.area-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        this.openAreaModal(id);
      });
    });
  },

  // ============================================
  // FILTERS
  // ============================================
  setupFilters() {
    // Severity filters
    document.querySelectorAll('.sev-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sev-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.filters.severity = btn.dataset.severity;
        this.applyFilters();
      });
    });

    // Status filter
    document.getElementById('status-filter')?.addEventListener('change', (e) => {
      this.state.filters.status = e.target.value;
      this.applyFilters();
    });

    // Time filters
    document.querySelectorAll('.time-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.time-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.filters.time = btn.dataset.time;
        this.applyFilters();
      });
    });

    // Distance
    const rangeInput = document.getElementById('distance-range');
    const rangeValue = document.getElementById('distance-value');
    rangeInput?.addEventListener('input', (e) => {
      this.state.filters.distance = parseInt(e.target.value);
      rangeValue.textContent = e.target.value;
      this.applyFilters();
    });

    // Clear filters
    document.getElementById('btn-clear-filters')?.addEventListener('click', () => {
      this.clearFilters();
    });
  },

  applyFilters() {
    this.state.filteredAreas = this.state.areas.filter(area => {
      // Severity
      if (this.state.filters.severity !== 'all' && area.severity !== this.state.filters.severity) return false;
      // Status
      if (this.state.filters.status !== 'all' && area.status !== this.state.filters.status) return false;
      // Time
      if (this.state.filters.time !== 'all' && !area.unsafeTimes.includes(this.state.filters.time)) return false;
      // Distance
      if (area.distance > this.state.filters.distance) return false;
      return true;
    });

    this.renderAreas();
    this.renderMapMarkers();
  },

  clearFilters() {
    this.state.filters = { severity: 'all', status: 'all', time: 'all', distance: 20 };
    document.querySelectorAll('.sev-filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.sev-filter-btn[data-severity="all"]').classList.add('active');
    document.querySelectorAll('.time-filter-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('status-filter').value = 'all';
    document.getElementById('distance-range').value = 20;
    document.getElementById('distance-value').textContent = '20';
    this.applyFilters();
    Toast.info('Filters cleared');
  },

  // ============================================
  // VIEW TOGGLE
  // ============================================
  setupViewToggle() {
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.viewMode = btn.dataset.view;
        this.renderMapMarkers();
        Toast.info(`Switched to ${this.state.viewMode} view`);
      });
    });
  },

  // ============================================
  // MAP CONTROLS
  // ============================================
  setupMapControls() {
    document.getElementById('btn-locate-me')?.addEventListener('click', () => {
      if (this.state.userLocation) {
        this.state.map.setView(this.state.userLocation, 14);
        Toast.info('Centered to your location');
      }
    });

    document.getElementById('btn-add-area')?.addEventListener('click', () => {
      this.openReportModal();
    });
  },

  // ============================================
  // REPORT AREA BUTTON
  // ============================================
  setupReportButton() {
    document.getElementById('btn-report-area-header')?.addEventListener('click', () => {
      this.openReportModal();
    });
  },

  // ============================================
  // MODALS
  // ============================================
  setupModals() {
    document.getElementById('btn-close-area-modal')?.addEventListener('click', () => {
      document.getElementById('area-modal').classList.remove('show');
    });

    document.getElementById('btn-close-report-modal')?.addEventListener('click', () => {
      document.getElementById('report-area-modal').classList.remove('show');
    });

    document.getElementById('area-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'area-modal') e.target.classList.remove('show');
    });

    document.getElementById('report-area-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'report-area-modal') e.target.classList.remove('show');
    });

    // Verify button
    document.getElementById('btn-verify-area')?.addEventListener('click', () => {
      Toast.success('✓ Report verified. Thank you for helping!');
      const btn = document.getElementById('btn-verify-area');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Verified';
      btn.disabled = true;
    });

    // Share button
    document.getElementById('btn-share-area')?.addEventListener('click', () => {
      if (!this.state.selectedArea) return;
      const area = this.state.selectedArea;
      const shareText = `⚠️ SafeHer Warning: ${area.name} is marked as ${area.severity} risk area.\n\n${area.description}\n\nStay safe! Check SafeHer for more info.`;
      
      if (navigator.share) {
        navigator.share({ title: 'Safety Warning', text: shareText }).then(() => Toast.success('Shared')).catch(() => {});
      } else {
        navigator.clipboard.writeText(shareText);
        Toast.success('Copied to clipboard!');
      }
    });
  },

  openAreaModal(id) {
    const area = this.state.areas.find(a => a.id === id);
    if (!area) return;

    this.state.selectedArea = area;

    // Populate
    document.getElementById('modal-area-name').textContent = area.name;
    document.getElementById('modal-area-location').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${area.location}`;
    document.getElementById('modal-severity-badge').innerHTML = `
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span>${area.severity}</span>
    `;
    document.getElementById('modal-reports-count').textContent = area.reports;
    document.getElementById('modal-verified-count').textContent = area.verified;
    document.getElementById('modal-distance').textContent = 
      area.distance < 1 ? Math.round(area.distance * 1000) + 'm' : area.distance.toFixed(1) + 'km';
    document.getElementById('modal-description').textContent = area.description;

    // Header color by severity
    const header = document.getElementById('area-modal-header');
    const gradients = {
      critical: 'linear-gradient(135deg, #7C2D12, #EF4444)',
      high: 'linear-gradient(135deg, #7C2D12, #F97316)',
      medium: 'linear-gradient(135deg, #713F12, #EAB308)',
      low: 'linear-gradient(135deg, #064E3B, #10B981)'
    };
    header.style.background = gradients[area.severity];

    // Issues
    const issueLabels = {
      poor_lighting: 'Poor Lighting',
      isolated: 'Isolated Area',
      harassment: 'Harassment',
      stalking: 'Stalking',
      theft: 'Theft/Snatching',
      drugs: 'Drug Activity',
      no_police: 'No Police Presence',
      crowded: 'Overcrowded'
    };
    const issuesHtml = area.issues.map(i => `<span class="issue-tag">${issueLabels[i] || i}</span>`).join('');
    document.getElementById('modal-issues').innerHTML = issuesHtml;

    // Reset verify button
    const verifyBtn = document.getElementById('btn-verify-area');
    verifyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirm This Area';
    verifyBtn.disabled = false;

    // Show modal
    document.getElementById('area-modal').classList.add('show');

    // Center map on area
    this.state.map.setView([area.lat, area.lng], 15);
  },

  // ============================================
  // REPORT MODAL & FORM
  // ============================================
  openReportModal() {
    document.getElementById('report-area-modal').classList.add('show');
    
    // Init mini map after modal is shown
    setTimeout(() => this.initMiniMap(), 300);
  },

  initMiniMap() {
    if (this.state.miniMap) {
      this.state.miniMap.remove();
    }

    const center = this.state.userLocation || [12.9716, 77.5946];

    this.state.miniMap = L.map('mini-map', {
      zoomControl: true,
      attributionControl: false
    }).setView(center, 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd'
    }).addTo(this.state.miniMap);

    // Click to pick location
    this.state.miniMap.on('click', (e) => {
      this.setReportLocation(e.latlng.lat, e.latlng.lng);
    });

    setTimeout(() => this.state.miniMap.invalidateSize(), 100);
  },

  setReportLocation(lat, lng) {
    this.state.reportLocation = { lat, lng };

    // Remove old marker
    if (this.state.reportMarker) {
      this.state.miniMap.removeLayer(this.state.reportMarker);
    }

    // Add new marker
    const icon = L.divIcon({
      className: 'unsafe-marker',
      html: '<div class="unsafe-marker-dot severity-high"><i class="fa-solid fa-triangle-exclamation"></i></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    this.state.reportMarker = L.marker([lat, lng], { icon }).addTo(this.state.miniMap);

    // Update input
    document.getElementById('area-location').value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    // Try reverse geocode
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(r => r.json())
      .then(data => {
        if (data.display_name) {
          document.getElementById('area-location').value = data.display_name;
        }
      })
      .catch(() => {});

    Toast.info('📍 Location selected');
  },

  setupReportForm() {
    // Detect location button
    document.getElementById('btn-detect-area-location')?.addEventListener('click', () => {
      if (!navigator.geolocation) {
        Toast.error('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.setReportLocation(pos.coords.latitude, pos.coords.longitude);
          this.state.miniMap.setView([pos.coords.latitude, pos.coords.longitude], 15);
          Toast.success('Location detected');
        },
        () => Toast.error('Could not detect location')
      );
    });

    // Character counter
    const desc = document.getElementById('area-description');
    const counter = document.getElementById('area-char-count');
    desc?.addEventListener('input', () => {
      counter.textContent = desc.value.length;
    });

    // Submit form
    document.getElementById('report-area-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitReport();
    });
  },

  submitReport() {
    // Validate
    if (!this.state.reportLocation && !document.getElementById('area-location').value) {
      Toast.error('Please select a location');
      return;
    }

    const severity = document.querySelector('input[name="repSeverity"]:checked');
    if (!severity) {
      Toast.error('Please select severity level');
      return;
    }

    const issues = document.querySelectorAll('input[name="issues"]:checked');
    if (issues.length === 0) {
      Toast.error('Please select at least one issue');
      return;
    }

    const times = document.querySelectorAll('input[name="unsafeTime"]:checked');
    if (times.length === 0) {
      Toast.error('Please select at least one unsafe time');
      return;
    }

    const description = document.getElementById('area-description').value.trim();
    if (description.length < 20) {
      Toast.error('Description must be at least 20 characters');
      return;
    }

    // Submit
    Toast.success('✅ Area reported successfully! Thank you for keeping the community safe.');
    
    // Save to localStorage
    const reports = JSON.parse(localStorage.getItem('safeher_area_reports') || '[]');
    reports.push({
      id: Date.now(),
      location: document.getElementById('area-location').value,
      coords: this.state.reportLocation,
      severity: severity.value,
      issues: Array.from(issues).map(i => i.value),
      times: Array.from(times).map(t => t.value),
      description,
      anonymous: document.getElementById('area-anonymous').checked,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('safeher_area_reports', JSON.stringify(reports));

    // Close modal and reset
    document.getElementById('report-area-modal').classList.remove('show');
    document.getElementById('report-area-form').reset();
    this.state.reportLocation = null;
    if (this.state.reportMarker && this.state.miniMap) {
      this.state.miniMap.removeLayer(this.state.reportMarker);
    }
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  UnsafeAreas.init();
});