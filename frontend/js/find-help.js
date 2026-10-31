// ============================================
// SafeHer - Find Help Logic (with Leaflet Map)
// ============================================

const FindHelp = {
  state: {
    map: null,
    userLocation: null,
    userMarker: null,
    markers: [],
    places: [],
    filteredPlaces: [],
    activeFilter: 'all',
    selectedPlace: null,
    searchQuery: '',
    sortBy: 'distance',
    savedPlaces: JSON.parse(localStorage.getItem('safeher_saved_places') || '[]')
  },

  init() {
    this.initMap();
    this.detectUserLocation();
    this.setupFilters();
    this.setupSearch();
    this.setupSort();
    this.setupMapControls();
    this.setupModal();
    this.setupRefreshLocation();
    console.log('🗺️ Find Help initialized');
  },

  // ============================================
  // INIT MAP
  // ============================================
  initMap() {
    // Default center (India) until user location detected
    const defaultCenter = [20.5937, 78.9629];

    this.state.map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView(defaultCenter, 5);

    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.state.map);
  },

  // ============================================
  // DETECT USER LOCATION
  // ============================================
  detectUserLocation() {
    if (!navigator.geolocation) {
      Toast.error('Geolocation not supported');
      this.loadPlaces([20.5937, 78.9629]); // Fallback
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.state.userLocation = [latitude, longitude];

        // Update location status
        this.updateLocationStatus('active', 'Location Active');

        // Reverse geocode
        this.reverseGeocode(latitude, longitude);

        // Center map on user
        this.state.map.setView([latitude, longitude], 14);

        // Add user marker
        this.addUserMarker(latitude, longitude);

        // Load nearby places
        this.loadPlaces([latitude, longitude]);
      },
      (error) => {
        console.error('Location error:', error);
        this.updateLocationStatus('denied', 'Location Denied');
        Toast.warning('Using default location. Enable GPS for accurate results.');
        // Use fallback location (Bangalore)
        this.state.userLocation = [12.9716, 77.5946];
        this.state.map.setView(this.state.userLocation, 12);
        this.addUserMarker(...this.state.userLocation);
        this.loadPlaces(this.state.userLocation);
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
      const address = document.getElementById('loc-status-address');
      if (address && data.display_name) {
        const shortAddress = data.display_name.split(',').slice(0, 3).join(',');
        address.textContent = shortAddress;
      }
    } catch (err) {
      console.log('Geocode failed:', err);
    }
  },

  updateLocationStatus(status, text) {
    const badge = document.getElementById('loc-status-badge');
    if (!badge) return;

    badge.classList.remove('active');
    if (status === 'active') badge.classList.add('active');

    badge.innerHTML = `
      <span class="loading-dot"></span>
      ${text}
    `;
  },

  addUserMarker(lat, lng) {
    if (this.state.userMarker) {
      this.state.map.removeLayer(this.state.userMarker);
    }

    const userIcon = L.divIcon({
      className: 'user-marker-icon',
      html: '<div class="user-marker"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    this.state.userMarker = L.marker([lat, lng], { icon: userIcon })
      .addTo(this.state.map)
      .bindPopup('<div class="map-popup"><p class="popup-name">📍 Your Location</p></div>');
  },

  // ============================================
  // LOAD PLACES (MOCK DATA)
  // ============================================
  loadPlaces(center) {
    const [lat, lng] = center;

    // Generate mock places around user location
    const mockPlaces = [
      // Police Stations
      { id: 1, name: 'Central Police Station', category: 'police', lat: lat + 0.005, lng: lng + 0.008, phone: '100', address: 'Main Road, City Center', hours: '24/7', rating: 4.5, description: 'Primary police station providing 24/7 emergency response and reporting services.' },
      { id: 2, name: 'Women\'s Police Station', category: 'police', lat: lat - 0.007, lng: lng + 0.005, phone: '1091', address: 'Women\'s Safety Cell, MG Road', hours: '24/7', rating: 4.8, description: 'Dedicated police station for women, staffed with trained female officers.' },
      { id: 3, name: 'Traffic Police HQ', category: 'police', lat: lat + 0.010, lng: lng - 0.003, phone: '103', address: 'Traffic Police Building', hours: '9 AM - 9 PM', rating: 4.2, description: 'Traffic-related police services and complaints.' },

      // Hospitals
      { id: 4, name: 'City General Hospital', category: 'hospital', lat: lat - 0.004, lng: lng + 0.012, phone: '108', address: 'Hospital Road, Sector 5', hours: '24/7', rating: 4.6, description: 'Multi-specialty hospital with 24/7 emergency and trauma care.' },
      { id: 5, name: 'Women\'s Care Hospital', category: 'hospital', lat: lat + 0.008, lng: lng - 0.006, phone: '108', address: 'Health District, Block A', hours: '24/7', rating: 4.7, description: 'Specialized women\'s healthcare with gynecology and maternity services.' },
      { id: 6, name: 'Emergency Trauma Center', category: 'hospital', lat: lat - 0.010, lng: lng - 0.004, phone: '108', address: 'Highway Junction', hours: '24/7', rating: 4.4, description: 'Advanced trauma care and emergency medical services.' },

      // Helplines (physical offices)
      { id: 7, name: 'Women\'s Helpline Center', category: 'helpline', lat: lat + 0.003, lng: lng - 0.009, phone: '1091', address: 'Support Center, Downtown', hours: '24/7', rating: 4.9, description: 'Free counseling and immediate helpline services for women in distress.' },
      { id: 8, name: 'Child Helpline Office', category: 'helpline', lat: lat - 0.006, lng: lng - 0.008, phone: '1098', address: 'Child Protection Bldg', hours: '24/7', rating: 4.7, description: 'Support and rescue services for children in need.' },

      // NGOs
      { id: 9, name: 'SafeHer NGO', category: 'ngo', lat: lat + 0.012, lng: lng + 0.010, phone: '+919876543210', address: '123 NGO Street, Cultural District', hours: '9 AM - 6 PM', rating: 4.8, description: 'Non-profit organization dedicated to women\'s empowerment and safety education.' },
      { id: 10, name: 'Empowerment Foundation', category: 'ngo', lat: lat - 0.011, lng: lng + 0.007, phone: '+919812345678', address: '45 Charity Lane', hours: '10 AM - 5 PM', rating: 4.6, description: 'Providing legal aid, counseling, and skill training for women.' },

      // Shelters
      { id: 11, name: 'Safe Haven Shelter', category: 'shelter', lat: lat + 0.006, lng: lng + 0.015, phone: '+919876543211', address: 'Confidential Location, Zone 4', hours: '24/7', rating: 4.7, description: 'Emergency shelter providing safe accommodation for women in crisis.' },
      { id: 12, name: 'Women\'s Refuge Home', category: 'shelter', lat: lat - 0.008, lng: lng + 0.011, phone: '+919876543212', address: 'Refuge Compound', hours: '24/7', rating: 4.9, description: 'Long-term shelter with counseling and rehabilitation programs.' },

      // Legal Aid
      { id: 13, name: 'Women\'s Legal Aid Cell', category: 'legal', lat: lat + 0.009, lng: lng + 0.004, phone: '+919876543213', address: 'Legal Complex, Court Road', hours: '10 AM - 5 PM', rating: 4.5, description: 'Free legal consultation and representation for women.' },
      { id: 14, name: 'Free Legal Services', category: 'legal', lat: lat - 0.005, lng: lng - 0.010, phone: '+919876543214', address: 'District Court Complex', hours: '9 AM - 6 PM', rating: 4.3, description: 'Government-supported free legal aid for underprivileged women.' }
    ];

    // Calculate distances
    mockPlaces.forEach(place => {
      place.distance = this.calculateDistance(lat, lng, place.lat, place.lng);
    });

    this.state.places = mockPlaces;
    this.state.filteredPlaces = [...mockPlaces];
    
    this.updateCounts();
    this.sortPlaces();
    this.renderPlaces();
    this.addMarkersToMap();
  },

  // Calculate distance using Haversine formula
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // ============================================
  // ADD MARKERS
  // ============================================
  addMarkersToMap() {
    // Remove old markers
    this.state.markers.forEach(m => this.state.map.removeLayer(m));
    this.state.markers = [];

    const icons = {
      police: 'fa-shield-halved',
      hospital: 'fa-hospital',
      helpline: 'fa-phone-volume',
      ngo: 'fa-hand-holding-heart',
      shelter: 'fa-house-user',
      legal: 'fa-scale-balanced'
    };

    this.state.filteredPlaces.forEach(place => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin marker-${place.category}"><i class="fa-solid ${icons[place.category]}"></i></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      const popupContent = `
        <div class="map-popup">
          <p class="popup-name">${place.name}</p>
          <p class="popup-category">${place.category}</p>
          <p class="popup-address">${place.address}</p>
          <div class="popup-actions">
            <a href="tel:${place.phone}" class="popup-btn call">
              <i class="fa-solid fa-phone"></i> Call
            </a>
            <button class="popup-btn view" onclick="FindHelp.openPlaceModal(${place.id})">
              <i class="fa-solid fa-eye"></i> Details
            </button>
          </div>
        </div>
      `;

      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(this.state.map)
        .bindPopup(popupContent);

      marker.on('click', () => {
        this.highlightPlace(place.id);
      });

      this.state.markers.push(marker);
    });
  },

  // ============================================
  // RENDER PLACES LIST
  // ============================================
  renderPlaces() {
    const list = document.getElementById('places-list');
    const emptyState = document.getElementById('empty-state');
    
    if (!list) return;

    if (this.state.filteredPlaces.length === 0) {
      list.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    const icons = {
      police: 'fa-shield-halved',
      hospital: 'fa-hospital',
      helpline: 'fa-phone-volume',
      ngo: 'fa-hand-holding-heart',
      shelter: 'fa-house-user',
      legal: 'fa-scale-balanced'
    };

    list.innerHTML = this.state.filteredPlaces.map((place, index) => `
      <div class="place-card" data-id="${place.id}" style="animation-delay: ${index * 0.05}s;">
        <div class="place-card-header">
          <div class="place-card-icon icon-${place.category}">
            <i class="fa-solid ${icons[place.category]}"></i>
          </div>
          <div class="place-card-info">
            <p class="place-card-name">${place.name}</p>
            <p class="place-card-category">${place.category}</p>
          </div>
          <span class="place-card-distance">
            ${place.distance < 1 
              ? `${Math.round(place.distance * 1000)}m` 
              : `${place.distance.toFixed(1)}km`
            }
          </span>
        </div>
        <p class="place-card-address">
          <i class="fa-solid fa-location-dot"></i> ${place.address}
        </p>
        <div class="place-card-footer">
          <div class="place-card-rating">
            <i class="fa-solid fa-star"></i>
            <span>${place.rating}</span>
            <span class="place-card-status ${place.hours === '24/7' ? '' : 'closed'}">
              ${place.hours === '24/7' ? '● Open 24/7' : place.hours}
            </span>
          </div>
          <div class="place-card-actions">
            <button class="place-quick-btn call" onclick="event.stopPropagation(); window.location.href='tel:${place.phone}'">
              <i class="fa-solid fa-phone"></i>
            </button>
            <button class="place-quick-btn directions" onclick="event.stopPropagation(); FindHelp.getDirections(${place.id})">
              <i class="fa-solid fa-diamond-turn-right"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.place-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        this.openPlaceModal(id);
      });
    });
  },

  // ============================================
  // UPDATE COUNTS
  // ============================================
  updateCounts() {
    const counts = {
      all: this.state.places.length,
      police: 0,
      hospital: 0,
      helpline: 0,
      ngo: 0,
      shelter: 0,
      legal: 0
    };

    this.state.places.forEach(p => {
      counts[p.category]++;
    });

    Object.keys(counts).forEach(key => {
      const el = document.getElementById(`count-${key}`);
      if (el) el.textContent = counts[key];
    });
  },

  // ============================================
  // FILTERS
  // ============================================
  setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.activeFilter = btn.dataset.category;
        this.applyFilters();
      });
    });
  },

  // ============================================
  // SEARCH
  // ============================================
  setupSearch() {
    const input = document.getElementById('place-search');
    const clearBtn = document.getElementById('btn-clear-search');

    input?.addEventListener('input', (e) => {
      this.state.searchQuery = e.target.value.toLowerCase().trim();
      if (this.state.searchQuery) {
        clearBtn.style.display = 'block';
      } else {
        clearBtn.style.display = 'none';
      }
      this.applyFilters();
    });

    clearBtn?.addEventListener('click', () => {
      input.value = '';
      this.state.searchQuery = '';
      clearBtn.style.display = 'none';
      this.applyFilters();
    });
  },

  // ============================================
  // SORT
  // ============================================
  setupSort() {
    document.getElementById('sort-select')?.addEventListener('change', (e) => {
      this.state.sortBy = e.target.value;
      this.sortPlaces();
      this.renderPlaces();
    });
  },

  sortPlaces() {
    const sortFns = {
      distance: (a, b) => a.distance - b.distance,
      name: (a, b) => a.name.localeCompare(b.name),
      rating: (a, b) => b.rating - a.rating
    };

    this.state.filteredPlaces.sort(sortFns[this.state.sortBy]);
  },

  // ============================================
  // APPLY FILTERS
  // ============================================
  applyFilters() {
    this.state.filteredPlaces = this.state.places.filter(place => {
      // Category filter
      if (this.state.activeFilter !== 'all' && place.category !== this.state.activeFilter) {
        return false;
      }
      // Search filter
      if (this.state.searchQuery) {
        const query = this.state.searchQuery;
        return place.name.toLowerCase().includes(query) ||
               place.address.toLowerCase().includes(query) ||
               place.category.toLowerCase().includes(query);
      }
      return true;
    });

    this.sortPlaces();
    this.renderPlaces();
    this.addMarkersToMap();
  },

  // ============================================
  // HIGHLIGHT PLACE
  // ============================================
  highlightPlace(id) {
    document.querySelectorAll('.place-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`.place-card[data-id="${id}"]`);
    if (card) {
      card.classList.add('selected');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },

  // ============================================
  // MAP CONTROLS
  // ============================================
  setupMapControls() {
    // Center on user
    document.getElementById('btn-center-map')?.addEventListener('click', () => {
      if (this.state.userLocation) {
        this.state.map.setView(this.state.userLocation, 14);
        Toast.info('Centered to your location');
      } else {
        Toast.warning('User location not available');
      }
    });

    // Toggle layer
    let isDark = true;
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd'
    });
    const lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    });

    document.getElementById('btn-toggle-layer')?.addEventListener('click', () => {
      isDark = !isDark;
      this.state.map.eachLayer((layer) => {
        if (layer._url) this.state.map.removeLayer(layer);
      });
      if (isDark) darkLayer.addTo(this.state.map);
      else lightLayer.addTo(this.state.map);
      Toast.info(`Switched to ${isDark ? 'dark' : 'light'} map`);
    });

    // Fullscreen
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      const mapEl = document.getElementById('map');
      if (!document.fullscreenElement) {
        mapEl.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });
  },

  setupRefreshLocation() {
    document.getElementById('btn-refresh-location')?.addEventListener('click', () => {
      Toast.info('Refreshing location...');
      this.detectUserLocation();
    });
  },

  // ============================================
  // PLACE MODAL
  // ============================================
  setupModal() {
    document.getElementById('btn-close-place-modal')?.addEventListener('click', () => {
      document.getElementById('place-modal').classList.remove('show');
    });

    document.getElementById('place-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'place-modal') {
        e.target.classList.remove('show');
      }
    });
  },

  openPlaceModal(id) {
    const place = this.state.places.find(p => p.id === id);
    if (!place) return;

    this.state.selectedPlace = place;

    const icons = {
      police: 'fa-shield-halved',
      hospital: 'fa-hospital',
      helpline: 'fa-phone-volume',
      ngo: 'fa-hand-holding-heart',
      shelter: 'fa-house-user',
      legal: 'fa-scale-balanced'
    };

    // Populate modal
    document.getElementById('modal-place-icon').innerHTML = `<i class="fa-solid ${icons[place.category]}"></i>`;
    document.getElementById('modal-place-badge').textContent = place.category;
    document.getElementById('modal-place-name').textContent = place.name;
    document.getElementById('modal-place-distance').innerHTML = `
      <i class="fa-solid fa-location-arrow"></i>
      <span>${place.distance < 1 ? `${Math.round(place.distance * 1000)}m` : `${place.distance.toFixed(1)}km`} away</span>
    `;
    document.getElementById('modal-place-address').textContent = place.address;
    document.getElementById('modal-place-phone').textContent = place.phone;
    document.getElementById('modal-place-hours').textContent = place.hours;
    document.getElementById('modal-place-rating').textContent = place.rating;

    // Rating stars
    const fullStars = Math.floor(place.rating);
    const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    document.getElementById('modal-rating-stars').textContent = stars;

    document.getElementById('modal-place-description').textContent = place.description;

    // Update save button
    const saveBtn = document.getElementById('btn-modal-save');
    const isSaved = this.state.savedPlaces.includes(place.id);
    if (isSaved) {
      saveBtn.classList.add('saved');
      saveBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i><span>Saved</span>';
    } else {
      saveBtn.classList.remove('saved');
      saveBtn.innerHTML = '<i class="fa-regular fa-bookmark"></i><span>Save</span>';
    }

    // Update modal header gradient
    const header = document.getElementById('place-modal-header');
    const gradients = {
      police: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      hospital: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      helpline: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      ngo: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      shelter: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
      legal: 'linear-gradient(135deg, #EAB308 0%, #FACC15 100%)'
    };
    header.style.background = gradients[place.category] || gradients.police;

    // Setup action buttons
    document.getElementById('btn-modal-call').onclick = () => {
      window.location.href = `tel:${place.phone}`;
    };

    document.getElementById('btn-modal-directions').onclick = () => {
      this.getDirections(place.id);
    };

    document.getElementById('btn-modal-share').onclick = () => {
      this.sharePlace(place);
    };

    document.getElementById('btn-modal-save').onclick = () => {
      this.togglSavePlace(place.id);
    };

    // Show modal
    document.getElementById('place-modal').classList.add('show');

    // Highlight place card
    this.highlightPlace(place.id);

    // Focus on map
    this.state.map.setView([place.lat, place.lng], 16);
  },

  getDirections(id) {
    const place = this.state.places.find(p => p.id === id);
    if (!place) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    window.open(url, '_blank');
    Toast.info('Opening directions in Google Maps...');
  },

  sharePlace(place) {
    const shareText = `${place.name}\n📞 ${place.phone}\n📍 ${place.address}\nhttps://www.google.com/maps?q=${place.lat},${place.lng}`;

    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: shareText
      }).then(() => Toast.success('Shared successfully')).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      Toast.success('Copied to clipboard!');
    }
  },

  togglSavePlace(id) {
    const index = this.state.savedPlaces.indexOf(id);
    const saveBtn = document.getElementById('btn-modal-save');

    if (index > -1) {
      this.state.savedPlaces.splice(index, 1);
      saveBtn.classList.remove('saved');
      saveBtn.innerHTML = '<i class="fa-regular fa-bookmark"></i><span>Save</span>';
      Toast.info('Removed from saved');
    } else {
      this.state.savedPlaces.push(id);
      saveBtn.classList.add('saved');
      saveBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i><span>Saved</span>';
      Toast.success('Saved to your favorites');
    }

    localStorage.setItem('safeher_saved_places', JSON.stringify(this.state.savedPlaces));
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  FindHelp.init();
});